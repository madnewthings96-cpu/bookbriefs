export interface PdfBlobUrlOptions {
  /** Return false when the owning page, route, or identity is no longer current. */
  canCommit?: () => boolean;
  createObjectURL?: (blob: Blob) => string;
  open?: (url: string) => unknown;
  revokeObjectURL?: (url: string) => void;
  /** Schedule revocation after the browser has started the new-tab navigation. */
  schedule?: (callback: () => void) => void;
}

const getBrowserCreateObjectURL = (blob: Blob): string => URL.createObjectURL(blob);
const openInNewTab = (url: string): unknown => window.open(url, '_blank', 'noopener,noreferrer');
const revokeBrowserObjectURL = (url: string): void => URL.revokeObjectURL(url);
const scheduleBrowserRevocation = (callback: () => void): void => {
  window.setTimeout(callback, 0);
};

/**
 * Opens a generated PDF only while its owner is still current and revokes the
 * temporary URL after the navigation attempt, including failed/stale paths.
 */
export const openPdfBlobUrl = (blob: Blob, options: PdfBlobUrlOptions = {}): boolean => {
  if (options.canCommit && !options.canCommit()) return false;

  const createObjectURL = options.createObjectURL ?? getBrowserCreateObjectURL;
  const open = options.open ?? openInNewTab;
  const revokeObjectURL = options.revokeObjectURL ?? revokeBrowserObjectURL;
  const schedule = options.schedule ?? scheduleBrowserRevocation;
  let url: string | null = null;

  try {
    url = createObjectURL(blob);
    if (options.canCommit && !options.canCommit()) return false;
    open(url);
    return true;
  } finally {
    if (url) {
      const revoke = () => revokeObjectURL(url as string);
      try {
        schedule(revoke);
      } catch {
        // A host scheduler can disappear during teardown; do not leak the
        // blob URL when that happens.
        revoke();
      }
    }
  }
};
