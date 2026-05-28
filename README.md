<div align="center">
  <img src="metadata-cleaner/public/logo.png" alt="MetaClean Logo" width="120" />
  <h1>MetaClean</h1>
  <h3>Secure Metadata Sanitization Tool</h3>
</div>

**MetaClean** is a privacy-focused web application designed to strip sensitive metadata from your digital files. Whether it's GPS coordinates in photos, author information in documents, or hidden properties in media files, MetaClean ensures your data remains private before you share it.

## Features

*   **Privacy First**: Files are processed securely. Your original files are never exposed publicly.
*   **Comprehensive Metadata Removal**:
    *   **Images**: Removes EXIF, IPTC, and XMP data (GPS, camera model, timestamps).
    *   **Documents**: Cleans Author, Company, Revision history, and other properties from Word, Excel, PowerPoint, and PDF files.
    *   **Media**: Strips metadata from Audio and Video files.
*   **Detailed Risk Analysis**: Scans files and provides a report of detected sensitive information before cleaning.
*   **Modern Interactive UI**: A clean, responsive interface built with React and Tailwind CSS.
*   **Cross-Platform**: Accessible via any modern web browser.

## Tech Stack

### Frontend
*   **React 18**: Component-based UI library.
*   **TypeScript**: Type-safe development.
*   **Vite**: Fast build tool and dev server.
*   **Tailwind CSS**: Utility-first CSS framework for styling.
*   **Framer Motion**: Smooth animations.
*   **Lucide React**: Beautiful icons.

### Backend
*   **FastAPI**: High-performance Python web framework.
*   **Pillow (PIL)**: Image processing.
*   **PikePDF**: PDF manipulation.
*   **Mutagen**: Audio/Video metadata handling.
*   **Python-Docx/OpenPyXL/Python-PPTX**: Office document processing.

## Installation & Setup

### Prerequisites
*   Node.js (v16+)
*   Python (v3.8+)

### 1. Clone the Repository
```bash
git clone https://github.com/abhinavRajput1/metadata-sanitisor.git
cd metadata-cleaner
```

### 2. Backend Setup
Navigate to the backend directory and install dependencies:
```bash
cd backend
# Create a virtual environment (optional but recommended)
python -m venv venv
# Activate venv:
# Windows: venv\Scripts\activate
# Linux/Mac: source venv/bin/activate

pip install -r requirements.txt
```
Start the backend server:
```bash
python -m uvicorn main:app --reload --port 3001
```
The backend will run at `http://localhost:3001`.

### 3. Frontend Setup
Open a new terminal, navigate to the frontend directory (`metadata-cleaner`), and install dependencies:
```bash
cd metadata-cleaner
npm install
```
Start the development server:
```bash
npm run dev
```
The application will be available at `http://localhost:5173`.

## Usage
1.  Open the application in your browser.
2.  Drag and drop files or click to upload.
3.  Review the "Detected Sensitivity" report to see what hidden data was found.
4.  Click **"Remove Metadata"** (or **"Sanitize All"**).
5.  Download the clean, safe versions of your files.

## Privacy Policy
MetaClean is designed with privacy as its core tenet. We do not retain uploaded files. Files are temporarily stored for processing and immediately deleted after sanitization or upon session expiry.

## License
MIT
$env:ADMIN_SECRET="Adminhubhai"; python main.py 