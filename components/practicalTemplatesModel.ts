type ClipboardWriter = Pick<Clipboard, 'writeText'>;
export type CopyResult = 'Copied' | 'Copy failed';

export const copyPracticalTemplate = async (
  text: string,
  target?: ClipboardWriter,
): Promise<CopyResult> => {
  try {
    const clipboard = target ?? (
      typeof navigator !== 'undefined' ? navigator.clipboard : undefined
    );
    if (!clipboard) throw new Error('Clipboard unavailable');
    await clipboard.writeText(text);
    return 'Copied';
  } catch {
    return 'Copy failed';
  }
};
