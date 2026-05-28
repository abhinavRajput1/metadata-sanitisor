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

**Architecture**

Below is a high-level architecture diagram showing how the frontend and backend interact, the main processing components, and storage flow.

```mermaid
flowchart LR
   Browser[Browser\n(React UI)] -->|Upload POST /api/upload| API[FastAPI\n(uvicorn)]
   Browser -->|Stateless POST /api/sanitize-file| API
   Browser -->|Download GET /api/download/{id}| API

   subgraph Backend
      API --> Storage[/tmp/uploads\n/tmp/cleaned]
      API --> Metadata[metadata_utils.py]
      Metadata --> Libraries[Processing libs\n(Pillow, pikepdf, Mutagen, python-docx, openpyxl, python-pptx)]
      Metadata --> Storage
      API -->|StreamingResponse| Browser
   end

   classDef backend fill:#f8f9fa,stroke:#333
   class API,Metadata,Storage,Libraries backend
```

Notes:
- **Frontend**: React + Vite handles the UI, sends files to the backend or uses stateless sanitize.
- **Backend**: `backend/main.py` exposes the REST endpoints and coordinates processing.
- **Processing**: `backend/metadata_utils.py` performs extraction and cleaning using the listed libraries.
- **Storage**: Temporary local storage is used for uploads and cleaned files; consider S3 or signed URLs for production.

If you'd like, I can also render this Mermaid block to an image and add it to the repo, or create a diagram variant for a serverless deployment.
