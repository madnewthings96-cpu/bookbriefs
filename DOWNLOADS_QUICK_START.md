# Example: How to Add Your First Download

## Quick Start Example

Here's a complete example showing how to add your first PDF download:

### 1. Your PDF File
Save your PDF as: `/public/downloads/my-first-guide.pdf`

### 2. Update DownloadsPage.tsx

In the file `/pages/DownloadsPage.tsx`, find line ~20 and update:

```typescript
const [downloads] = useState<DownloadItem[]>([
    {
        id: '1',
        title: 'My First Reading Guide',
        description: 'An essential guide for new readers with tips and strategies.',
        fileUrl: '/downloads/my-first-guide.pdf',
        fileSize: '2.3 MB',
        category: 'Guides',
        uploadDate: '2024-10-23'
    }
]);
```

### 3. Test It
1. Log in to your account
2. Click the menu (☰) in the header
3. Select "Downloads"
4. You should see your PDF with a download button!

---

## Multiple Downloads Example

```typescript
const [downloads] = useState<DownloadItem[]>([
    {
        id: '1',
        title: 'Speed Reading Techniques',
        description: 'Learn proven methods to double your reading speed while maintaining comprehension.',
        fileUrl: '/downloads/speed-reading-guide.pdf',
        fileSize: '3.1 MB',
        category: 'Guides',
        uploadDate: '2024-10-23'
    },
    {
        id: '2',
        title: 'Book Summary Template',
        description: 'A structured template to help you create comprehensive book summaries.',
        fileUrl: '/downloads/summary-template.pdf',
        fileSize: '850 KB',
        category: 'Templates',
        uploadDate: '2024-10-23'
    },
    {
        id: '3',
        title: 'Reading Challenge Tracker',
        description: 'Track your reading goals with this printable monthly tracker.',
        fileUrl: '/downloads/reading-tracker.pdf',
        fileSize: '1.2 MB',
        category: 'Worksheets',
        uploadDate: '2024-10-23'
    }
]);
```

That's it! Your downloads are now live for authenticated users.
