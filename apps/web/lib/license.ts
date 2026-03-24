import { SignJWT, generateKeyPair, exportPKCS8, exportSPKI } from 'jose';

// In production, this would be an environment variable containing the PCKS8 private key string
const PRIVATE_KEY_ENV = process.env.LICENSE_PRIVATE_KEY;

let cachedPrivateKey: any = null;
let cachedPublicKey: string | null = null;

async function getOrGenerateKeys() {
  if (cachedPrivateKey) return { privateKey: cachedPrivateKey, publicKey: cachedPublicKey };

  if (PRIVATE_KEY_ENV) {
    const { importPKCS8 } = await import('jose');
    cachedPrivateKey = await importPKCS8(PRIVATE_KEY_ENV, 'RS256');
    return { privateKey: cachedPrivateKey, publicKey: 'Loaded from ENV' };
  }

  // Fallback for local development: generate a key pair on the fly
  console.warn("No LICENSE_PRIVATE_KEY found. Generating temporary RS256 key pair for development.");
  const { publicKey, privateKey } = await generateKeyPair('RS256', { extractable: true });
  cachedPrivateKey = privateKey;
  cachedPublicKey = await exportSPKI(publicKey);
  
  return { privateKey, publicKey: cachedPublicKey };
}

export async function generateLicenseKey(userId: string, plan: string, email: string, expiresAt: Date): Promise<string> {
  const { privateKey } = await getOrGenerateKeys();

  const jwt = await new SignJWT({ sub: userId, plan, email })
    .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
    .setIssuedAt()
    .setExpirationTime(Math.floor(expiresAt.getTime() / 1000))
    .setIssuer('macclean-saas')
    .sign(privateKey);

  return jwt;
}
