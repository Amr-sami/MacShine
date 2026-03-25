import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, StatBlock, PathList, StatusType } from '../ui';
import { ConfirmBar } from './ConfirmBar';
import { useCountUp } from '../../hooks/useCountUp';
import { AlertCircle, FileSearch } from 'lucide-react';

export interface ModulePanelProps {
  moduleId: string;
  title: string;
  description: string;
  status: StatusType | 'deleting';
  foundPaths: { path: string; size?: number }[];
  totalBytes: number;
  freedBytes: number;
  warn?: string;
  isPermanent?: boolean;
  currentPath?: string;
  pathsChecked?: number;
  errorMessage?: string;
  onScan: () => void;
  onDelete: () => void;
  onSkip: () => void;
  onCancelScan?: () => void;
  onTryAgain?: () => void;
  onOpenPrivacy?: () => void;
}

export function ModulePanel({
  moduleId,
  title,
  description,
  status,
  foundPaths,
  totalBytes,
  freedBytes,
  warn,
  isPermanent = false,
  currentPath,
  pathsChecked = 0,
  errorMessage,
  onScan,
  onDelete,
  onSkip,
  onCancelScan,
  onTryAgain,
  onOpenPrivacy
}: ModulePanelProps) {
  const animatedFreed = useCountUp(freedBytes);

  return (
    <div className="h-full w-full relative flex flex-col bg-[--bg-elevated]">
      {(status === 'scanning' || status === 'deleting') && (
        <div className="absolute top-0 left-0 right-0 overflow-hidden" style={{ zIndex: 10 }}>
          <div className="scan-bar" />
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={status}
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -8 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="flex flex-col h-full items-center justify-center p-8 text-center"
        >
          {status === 'idle' && (
            <div className="flex flex-col items-center max-w-sm">
              <FileSearch size={64} className="text-[--text-muted] mb-6" />
              <h2 className="text-[20px] font-semibold text-[--text-primary] mb-2">{title}</h2>
              <p className="text-[13px] text-[--text-secondary] mb-8 leading-relaxed">{description}</p>
              <Button onClick={onScan} className="w-full max-w-[200px]">Scan</Button>
            </div>
          )}

          {status === 'scanning' && (
            <div className="flex flex-col items-center max-w-sm w-full">
              <span className="w-3 h-3 rounded-full bg-[--warning] animate-pulse mb-6" />
              <p className="font-mono text-[11px] text-[--text-secondary] truncate w-full mb-3">
                {currentPath ? `Scanning ${currentPath}...` : 'Scanning...'}
              </p>
              <p className="text-[12px] text-[--text-muted] mb-8">
                {pathsChecked.toLocaleString()} paths checked
              </p>
              <Button variant="ghost" onClick={onCancelScan}>Cancel</Button>
            </div>
          )}

          {status === 'found' && (
            <div className="flex flex-col h-full w-full pt-4">
              <div className="mb-6 flex justify-center">
                <StatBlock label="Total Found" value={(totalBytes / 1024 / 1024).toFixed(1) + ' MB'} variant="warning" />
              </div>
              <div className="flex-1 overflow-y-auto w-full px-8 pb-8">
                <PathList paths={foundPaths} />
              </div>
            </div>
          )}

          {status === 'deleting' && (
            <div className="flex flex-col items-center max-w-sm">
              <span className="w-4 h-4 rounded-full border-2 border-[--accent] border-t-transparent animate-spin mb-6" />
              <p className="text-[13px] text-[--text-primary]">Deleting files...</p>
            </div>
          )}

          {status === 'done' && (
            <div className="flex flex-col items-center max-w-sm">
              <StatBlock label="Freed" value={(animatedFreed / 1024 / 1024).toFixed(1) + ' MB'} variant="accent" />
              <p className="text-[13px] text-[--text-secondary] mt-4 mb-8">
                Successfully freed space from {title}
              </p>
              <Button variant="ghost" onClick={onScan}>Scan Again</Button>
            </div>
          )}

          {status === 'skipped' && (
            <div className="flex flex-col items-center max-w-sm">
              <p className="text-[14px] text-[--text-muted] mb-6">Skipped</p>
              <Button variant="ghost" onClick={onScan}>Scan Again</Button>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center max-w-sm">
              <AlertCircle size={32} className="text-[--danger] mb-4" />
              <p className="text-[13px] text-[--text-primary] mb-6">{errorMessage || 'An error occurred'}</p>
              {errorMessage?.toLowerCase().includes('permission') && (
                <Button variant="secondary" onClick={onOpenPrivacy} className="mb-3 w-full">
                  Open Privacy Settings
                </Button>
              )}
              <Button variant="primary" onClick={onTryAgain} className="w-full">
                Try Again
              </Button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {status === 'found' && (
        <ConfirmBar
          total={totalBytes}
          description="files finding"
          warn={warn}
          isPermanent={isPermanent}
          onSkip={onSkip}
          onConfirm={onDelete}
        />
      )}
    </div>
  );
}
