# Downloads Directory

This directory contains PDF files that are available for download to authenticated users.

## How to Add PDFs

1. Place your PDF files in this directory (`/public/downloads/`)
2. Update the `DownloadsPage.tsx` file to add the download items to the array

## Example Entry in DownloadsPage.tsx

```typescript
{
  id: '1',
  title: 'Your PDF Title',
  description: 'A brief description of what this PDF contains',
  fileUrl: '/downloads/your-file-name.pdf',
  fileSize: '2.5 MB',
  category: 'Guides', // or 'Resources', 'Templates', etc.
  uploadDate: '2024-01-15'
}
```

## Categories

You can organize your downloads into categories. Common categories might include:
- Guides
- Resources
- Templates
- Worksheets
- Checklists
- Bonus Materials

## File Naming Best Practices

- Use lowercase letters
- Replace spaces with hyphens (-)
- Use descriptive names
- Example: `book-reading-guide-2024.pdf`

## Notes

- Only authenticated users can access the Downloads page
- Files in this directory are publicly accessible if someone knows the direct URL
- Consider using more secure storage (like Firebase Storage) for truly private files
