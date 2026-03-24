import React, { useState, useCallback, useEffect } from 'react';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { UndoToast } from '../../components/UndoToast';

interface AttachmentInfo {
  name: string;
  path: string;
  type: string;
  sizeBytes: number;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

export function EmailCleanerPage() {
  const [attachments, setAttachments] = useState<AttachmentInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [confirmItem, setConfirmItem] = useState<AttachmentInfo | null>(null);
  const [undoInfo, setUndoInfo] = useState<{ name: string } | null>(null);

  const scanAttachments = useCallback(async () => {
    setLoading(true);
    try {
      const result = await window.macclean.scan('emails') as any;
      setAttachments(result.paths || []);
      setScanned(true);
    } catch (err) {
      console.error('Failed to scan email attachments:', err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    scanAttachments();
  }, [scanAttachments]);

  const deleteAttachment = useCallback(async (item: AttachmentInfo) => {
    setConfirmItem(null);
    try {
      await window.macclean.delete('emails', [item.path]);
      setUndoInfo({ name: item.name });
      setAttachments((prev) => prev.filter((a) => a.path !== item.path));
    } catch (err) {
      console.error('Failed to delete attachment:', err);
    }
  }, []);

  const totalSize = attachments.reduce((acc, item) => acc + item.sizeBytes, 0);

  return (
    <div className="flex flex-col h-full bg-[#0d0f0e]">
      <div className="px-6 py-5 border-b border-mc-border flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-mc-text flex items-center gap-2">
            <span>📫</span> Mail Attachment Cleaner
            <span className="text-[10px] font-bold text-mc-accent border border-mc-accent/30 bg-mc-accent/10 px-1.5 py-0.5 rounded uppercase">Pro</span>
          </h2>
          <p className="text-sm text-mc-muted mt-1">
            {scanned 
              ? `Found ${attachments.length} large attachments occupying ${formatBytes(totalSize)}`
              : 'Scanning Apple Mail for large attachments...'}
          </p>
        </div>
        <button
          onClick={scanAttachments}
          disabled={loading}
          className={`px-4 py-2 text-sm rounded-lg transition-colors border ${
            loading 
              ? 'bg-mc-surface text-mc-muted border-mc-border cursor-not-allowed'
              : 'bg-mc-text bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/30 hover:bg-blue-500/30 cursor-pointer'
          }`}
        >
          {loading ? 'Scanning...' : 'Rescan Mail'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {loading && !scanned && (
          <div className="flex flex-col items-center justify-center h-full text-mc-muted">
            <div className="animate-spin text-3xl mb-4 text-blue-400">🌀</div>
            <span className="text-sm">Parsing Library/Mail...</span>
          </div>
        )}

        {scanned && attachments.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-mc-muted max-w-sm mx-auto text-center">
            <div className="w-20 h-20 rounded-full bg-mc-surface flex items-center justify-center text-4xl mb-4 text-blue-400 border border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.1)]">
              ✨
            </div>
            <h3 className="text-lg font-medium text-mc-text mb-2">Mailbox is lean!</h3>
            <p className="text-sm">No large email attachments were found in your local Apple Mail data.</p>
          </div>
        )}

        {attachments.length > 0 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {attachments.map((item) => (
                <div key={item.path} className="border border-mc-border bg-mc-surface rounded-xl p-4 flex flex-col justify-between hover:border-mc-accent/30 transition-colors">
                  <div className="flex gap-3 mb-4">
                    <div className="w-10 h-10 rounded bg-mc-bg flex items-center justify-center text-xl shrink-0 border border-mc-border">
                      📎
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-mc-text truncate" title={item.name}>{item.name}</h4>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-mc-accent font-medium">{formatBytes(item.sizeBytes)}</span>
                        <span className="text-[10px] text-mc-muted px-1.5 py-0.5 rounded bg-mc-bg border border-mc-border">{item.type}</span>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setConfirmItem(item)}
                    className="w-full px-3 py-1.5 text-xs font-medium text-mc-destructive border border-mc-destructive/30 rounded-lg hover:bg-mc-destructive/10 transition-colors"
                  >
                    Delete Attachment
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {confirmItem && (
        <ConfirmDialog
          isOpen={true}
          title={`Delete Attachment?`}
          description={`Are you sure you want to move ${confirmItem.name} to the Trash? Note: This removes the local downloaded copy, but the file may still exist on your mail server.`}
          totalSize={formatBytes(confirmItem.sizeBytes)}
          pathCount={1}
          isPermanent={false}
          actionLabel="Move to Trash"
          onConfirm={() => deleteAttachment(confirmItem)}
          onCancel={() => setConfirmItem(null)}
        />
      )}

      {undoInfo && (
        <UndoToast
          message={`Deleted attachment: ${undoInfo.name}`}
          onUndo={() => setUndoInfo(null)}
        />
      )}
    </div>
  );
}
