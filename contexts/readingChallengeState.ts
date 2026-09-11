export const mergeReadingChallengeBooks = (
  booksRead: string[],
  bookId: string,
  remove: boolean,
) => {
  const next = new Set(booksRead);
  if (remove) next.delete(bookId);
  else next.add(bookId);
  return Array.from(next);
};
