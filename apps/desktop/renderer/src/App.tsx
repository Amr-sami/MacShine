import React, { useEffect, useState } from 'react';
import './index.css';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { SmartScanPage } from './app/SmartScanPage';
import { ModulePage } from './app/ModulePage';
import { SettingsPage } from './app/SettingsPage';
import { HistoryPage } from './app/HistoryPage';
import { OnboardingPage } from './app/OnboardingPage';
import { SpaceLensPage } from './app/SpaceLensPage';
import { AppManagerPage } from './app/AppManagerPage';
import { InAppBanner } from './components/InAppBanner';
import { MalwarePage } from './app/modules/MalwarePage';
import { UpdateManagerPage } from './app/modules/UpdateManagerPage';
import { EmailCleanerPage } from './app/modules/EmailCleanerPage';
import type { ModuleId } from './store/sessionStore';

type Page = 'dashboard' | 'history' | 'settings' | 'app-manager' | 'space-lens' | 'malware' | 'update-manager' | 'email-cleaner' | string;

function App() {
  const [currentPage, setCurrentPage] = useState('smart-scan');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [lastCleanedAt, setLastCleanedAt] = useState<string | null>(null);
  const [banner, setBanner] = useState<{ title: string; body: string } | null>(null);

  useEffect(() => {
    // Check onboarding status
    window.macclean?.getSettings().then((settings: any) => {
      if (!settings?.onboardingComplete) {
        setShowOnboarding(true);
      }
      setLastCleanedAt(settings?.lastCleanedAt ?? null);
    }).catch(() => {});

    // Listen for progress events
    const cleanup = window.macclean?.onProgress((data) => {
      // Progress events are handled by individual modules
    });

    // Listen for navigation events from notifications
    const navCleanup = (window as any).macclean?.onNavigate?.((page: string) => {
      setCurrentPage(page);
    });

    // Listen for in-app notification banners
    const bannerCleanup = (window as any).macclean?.onInAppNotification?.(
      (data: { title: string; body: string }) => setBanner(data)
    );

    return () => { cleanup?.(); navCleanup?.(); bannerCleanup?.(); };
  }, []);

  if (showOnboarding) {
    return (
      <OnboardingPage
        onComplete={() => {
          setShowOnboarding(false);
          setCurrentPage('smart-scan');
        }}
      />
    );
  }

  const renderPage = () => {
    if (currentPage === 'smart-scan') return <SmartScanPage />;
    if (currentPage === 'app-manager') return <AppManagerPage />;
    if (currentPage === 'settings') return <SettingsPage />;
    if (currentPage === 'history') return <HistoryPage />;
    if (currentPage === 'space-lens') return <SpaceLensPage />;
    if (currentPage === 'malware') return <MalwarePage />;
    if (currentPage === 'update-manager') return <UpdateManagerPage />;
    if (currentPage === 'email-cleaner') return <EmailCleanerPage />;
    if (currentPage.startsWith('module:')) {
      const moduleId = currentPage.split(':')[1] as ModuleId;
      return <ModulePage moduleId={moduleId} />;
    }
    return <SmartScanPage />;
  };

  return (
    <div className="flex h-screen bg-mc-bg">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="flex-1 flex flex-col overflow-hidden">
        <TopBar lastCleanedAt={lastCleanedAt} />
        <div className="flex-1 overflow-hidden">
          {renderPage()}
        </div>
      </main>
      {banner && (
        <InAppBanner title={banner.title} body={banner.body} onDismiss={() => setBanner(null)} />
      )}
    </div>
  );
}

export default App;
