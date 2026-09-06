export const getModalFocusWrapTarget = (
  activeIndex: number,
  itemCount: number,
  shiftKey: boolean,
): number | null => {
  if (itemCount <= 0) return null;
  if (activeIndex < 0) return shiftKey ? itemCount - 1 : 0;
  if (shiftKey && activeIndex === 0) return itemCount - 1;
  if (!shiftKey && activeIndex === itemCount - 1) return 0;
  return null;
};
