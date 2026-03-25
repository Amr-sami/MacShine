import React, { useState, useEffect } from 'react';
import { Layout } from './components/layout/Layout';
import { HomeScreen } from './app/HomeScreen';
import { Onboarding } from './app/Onboarding';
import { ModulePanel } from './components/modules/ModulePanel';
import { useModuleScan } from './hooks/useModuleScan';
import { AppManagerPage } from './app/AppManagerPage';
import { SpaceLensPage } from './app/SpaceLensPage';
import { SettingsPage } from './app/SettingsPage';
import { HistoryPage } from './app/HistoryPage';

const MODULE_INFO = {
  caches: { title: 'System Caches', desc: 'Temporary files created by macOS and apps. Safe to delete.' },
  logs: { title: 'System Logs', desc: 'Log files and diagnostic reports.' },
  trash: { title: 'Trash', desc: 'Files you previously moved to the Trash.' },
  xcode: { title: 'Xcode', desc: 'Derived data and old simulator caches.' },
  browsers: { title: 'Browsers', desc: 'Web cache and temporary files.' },
  large_files: { title: 'Large Files', desc: 'Files larger than 200MB hidden deep in your drive.' },
  duplicates: { title: 'Duplicates', desc: 'Identical files taking up twice the space.' },
  brew: { title: 'Homebrew', desc: 'Old versions and unlinked formulate.' },
  startup: { title: 'Startup Items', desc: 'Apps that run automatically when you log in.' },
  dns_memory: { title: 'DNS & Memory', desc: 'Flush DNS cache and purge inactive memory.' },
};

function ModuleWrapper({ moduleId }: { moduleId: string }) {
  const { state, scan, confirmDelete, skip, cancelScan } = useModuleScan(moduleId);
  const info = MODULE_INFO[moduleId as keyof typeof MODULE_INFO] || { title: moduleId, desc: '' };
  
  return (
    <ModulePanel 
      moduleId={moduleId}
      title={info.title}
      description={info.desc}
      status={state.status}
      foundPaths={state.foundPaths}
      totalBytes={state.totalFoundBytes}
      freedBytes={state.freedBytes}
      currentPath={state.currentPath}
      pathsChecked={state.pathsChecked}
      errorMessage={state.error ?? undefined}
      isPermanent={moduleId === 'trash' || moduleId === 'large_files'}
      onScan={scan}
      onDelete={confirmDelete}
      onSkip={skip}
      onCancelScan={cancelScan}
      onTryAgain={scan}
      onOpenPrivacy={() => (window as any).macclean?.openPrivacySettings?.()}
    />
  );
}

export default function App() {
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Basic check for onboarding
    const isDone = window.localStorage.getItem('macclean_onboarding_done');
    if (!isDone) setShowOnboarding(true);
  }, []);

  const handleOnboardingComplete = () => {
    window.localStorage.setItem('macclean_onboarding_done', 'true');
    setShowOnboarding(false);
  };

  return (
    <>
      <Layout activeModule={activeModule || ''} onModuleSelect={setActiveModule}>
        {activeModule === null || activeModule === '' ? (
          <HomeScreen onModuleSelect={setActiveModule} />
        ) : activeModule === 'app-manager' ? (
          <AppManagerPage />
        ) : activeModule === 'space-lens' ? (
          <SpaceLensPage />
        ) : activeModule === 'settings' ? (
          <SettingsPage />
        ) : activeModule === 'history' ? (
          <HistoryPage />
        ) : (
          <ModuleWrapper key={activeModule} moduleId={activeModule} />
        )}
      </Layout>
      {showOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}
    </>
  );
}
