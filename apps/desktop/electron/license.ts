import { safeStorage } from 'electron';
import Store from 'electron-store';

interface LicenseState {
  encryptedKey: string | null;
}

export class LicenseManager {
  private store: Store<LicenseState>;

  constructor() {
    this.store = new Store<LicenseState>({
      name: 'license',
      defaults: {
        encryptedKey: null,
      },
      encryptionKey: 'macclean-license-protect', // Obfuscates the store file itself a bit
    });
  }

  /**
   * Securely saves the license key to the macOS Keychain via safeStorage.
   */
  public saveLicenseKey(jwt: string): boolean {
    if (!safeStorage.isEncryptionAvailable()) {
      console.error('[LicenseManager] safeStorage is not available on this system.');
      return false;
    }

    try {
      const buffer = safeStorage.encryptString(jwt);
      // Store as base64
      this.store.set('encryptedKey', buffer.toString('base64'));
      return true;
    } catch (err) {
      console.error('[LicenseManager] Failed to encrypt license key:', err);
      return false;
    }
  }

  /**
   * Retrieves and decrypts the license key from Keychain.
   */
  public getLicenseKey(): string | null {
    const encrypted = this.store.get('encryptedKey');
    if (!encrypted) return null;

    if (!safeStorage.isEncryptionAvailable()) {
      return null;
    }

    try {
      const buffer = Buffer.from(encrypted, 'base64');
      return safeStorage.decryptString(buffer);
    } catch (err) {
      console.error('[LicenseManager] Failed to decrypt license key:', err);
      return null;
    }
  }

  /**
   * Clears the saved license key.
   */
  public removeLicenseKey(): void {
    this.store.delete('encryptedKey' as any);
  }

  /**
   * Validates the license offline by verifying JWT expiry and basic structure.
   * Full signature verification is mocked here since we don't have the server public key locally yet.
   */
  public isPro(): boolean {
    const key = this.getLicenseKey();
    if (!key) return false;

    try {
      // Very basic JWT decode (header.payload.signature)
      const parts = key.split('.');
      if (parts.length !== 3) return false;

      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
      
      // Check expiry (exp is in seconds)
      if (payload.exp && Date.now() / 1000 > payload.exp) {
        return false; // Expired
      }

      // If we wanted offline RS256 validation, we'd use `crypto.verify` with the embedded public key here.
      // For now, if it reads properly and isn't expired, we consider it valid.
      return true;
    } catch (err) {
      console.error('[LicenseManager] Failed to parse license token:', err);
      return false;
    }
  }

  /**
   * Returns details of the current plan.
   */
  public getPlanDetails(): { isPro: boolean; expiresAt: Date | null; email: string | null } {
    const key = this.getLicenseKey();
    if (!key) return { isPro: false, expiresAt: null, email: null };

    try {
      const parts = key.split('.');
      if (parts.length !== 3) return { isPro: false, expiresAt: null, email: null };

      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
      
      const expiresAt = payload.exp ? new Date(payload.exp * 1000) : null;
      const isPro = expiresAt === null || expiresAt.getTime() > Date.now();
      const email = payload.email || null;

      return { isPro, expiresAt, email };
    } catch {
      return { isPro: false, expiresAt: null, email: null };
    }
  }
}
