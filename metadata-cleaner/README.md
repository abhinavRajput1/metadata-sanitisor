# MetaClean - Secure Metadata Removal Tool

MetaClean is a privacy-first web application designed to detect and sanitize sensitive metadata from digital files purely within the browser.

## Features

- **Client-Side Processing**: Files never leave your device. All sanitization happens locally.
- **Deep Metadata Analysis**: Extracts metadata from Images, PDFs, Office Docs, and more.
- **Selective Sanitization**: Choose to strip all metadata or keep specific fields (e.g., date).
- **Audit Logs**: Track sanitization history for compliance.
- **Responsive Design**: Modern, privacy-centric UI built with Tailwind CSS.

## Tech Stack

- React 18
- Vite 5
- Tailwind CSS 3
- Framer Motion (Animations)
- Lucide React (Icons)
- React Router DOM 6

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Project Structure

- `src/components`: UI components (FileUploader, MetadataViewer, etc.)
- `src/pages`: Main application pages (Landing, Tool, Audit)
- `src/utils`: Helper functions for metadata simulation
- `src/App.tsx`: Routing and Layout configuration

## Security Note

This is a demonstration frontend. Actual metadata stripping requires specific libraries (like `exif-js`, `pdf-lib`) integrated into the `handleSanitize` function in `ToolPage.tsx`. The current version simulates the sanitization process to showcase the UX.
