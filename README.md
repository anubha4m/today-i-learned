# Today I Learned (TIL)

A beautiful journal app for tracking your daily learning adventures. Capture insights, save bookmarks to learning resources, and review your progress over time.

## Features

- **Rich Text Editor**: Write your learnings with formatting support (bold, italic, headings, lists, code blocks, quotes)
- **Review Before Saving**: Preview and edit your entries before committing them
- **History View**: Browse your entries from the last 7 days with chronological sorting
- **Bookmarks**: Save URLs to learning resources with notes about what you learned
- **Search**: Find past bookmarks by URL, title, or notes
- **Dark Mode**: Beautiful dark theme with amber accents

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: SQLite with Prisma ORM
- **Rich Text Editor**: Tiptap
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up the database:
   ```bash
   npx prisma migrate dev
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with navigation
│   ├── page.tsx            # Main TIL entry page
│   ├── history/
│   │   └── page.tsx        # History view
│   ├── bookmarks/
│   │   └── page.tsx        # Bookmarks view
│   └── api/
│       ├── entries/
│       │   └── route.ts    # CRUD for entries
│       └── bookmarks/
│           └── route.ts    # CRUD for bookmarks
├── components/
│   ├── Editor.tsx          # Tiptap editor component
│   ├── EntryCard.tsx       # Entry display card
│   ├── BookmarkCard.tsx    # Bookmark display card
│   ├── Navigation.tsx      # Tab navigation
│   └── ReviewModal.tsx     # Pre-save review modal
└── lib/
    └── prisma.ts           # Prisma client instance
```

## License

MIT
