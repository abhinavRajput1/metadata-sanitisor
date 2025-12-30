import os
from pathlib import Path
from PIL import Image
import pikepdf
from mutagen import File
from docx import Document
from openpyxl import load_workbook
from pptx import Presentation

def extract_metadata(file_path: Path) -> dict:
    ext = file_path.suffix.lower()
    metadata = {}
    
    try:
        if ext in ['.jpg', '.jpeg', '.png', '.tiff']:
            with Image.open(file_path) as img:
                exif = img.getexif()
                if exif:
                    for tag_id, value in exif.items():
                        # Get tag name if possible, simple implementation
                        tag = str(tag_id)
                        metadata[tag] = str(value)
                metadata["Format"] = img.format
                metadata["Mode"] = img.mode
                metadata["Size"] = f"{img.size[0]}x{img.size[1]}"

        elif ext == '.pdf':
            pdf = pikepdf.Pdf.open(file_path)
            meta = pdf.docinfo
            for key, value in meta.items():
                metadata[str(key)] = str(value)
            pdf.close()

        elif ext in ['.mp3', '.flac', '.mp4', '.mkv']:
            audio = File(file_path)
            if audio is not None and audio.tags:
                for key, value in audio.tags.items():
                    metadata[key] = str(value)
        
        elif ext == '.docx':
            doc = Document(file_path)
            core_props = doc.core_properties
            metadata['Author'] = core_props.author
            metadata['Created'] = str(core_props.created)
            metadata['Last Modified By'] = core_props.last_modified_by

        elif ext == '.pptx':
            prs = Presentation(file_path)
            core_props = prs.core_properties
            metadata['Author'] = core_props.author
            metadata['Created'] = str(core_props.created)
            metadata['Last Modified By'] = core_props.last_modified_by
            
        # Add basic file info
        stats = os.stat(file_path)
        metadata["File Size"] = f"{stats.st_size} bytes"
    except Exception as e:
        print(f"Error extracting metadata: {e}")
        metadata["Error"] = str(e)

    return metadata

def remove_metadata(input_path: Path, output_path: Path):
    ext = input_path.suffix.lower()
    
    try:
        if ext in ['.jpg', '.jpeg', '.png', '.tiff']:
            with Image.open(input_path) as img:
                data = list(img.getdata())
                img_without_exif = Image.new(img.mode, img.size)
                img_without_exif.putdata(data)
                img_without_exif.save(output_path)

        elif ext == '.pdf':
            pdf = pikepdf.Pdf.open(input_path)
            del pdf.docinfo
            # For deeper cleaning in PDF usually rec: pdf.remove_unreferenced_resources()
            pdf.save(output_path)
            pdf.close()
            
        elif ext in ['.mp3', '.flac', '.mp4', '.mkv']:
            # Mutagen saves in place, so copy first
            import shutil
            shutil.copy2(input_path, output_path)
            audio = File(output_path)
            if audio is not None:
                audio.delete()
                audio.save()

        elif ext == '.docx':
            # Basic docx cleaning
            doc = Document(input_path)
            doc.core_properties.author = ""
            doc.core_properties.last_modified_by = ""
            doc.core_properties.comments = ""
            doc.save(output_path)

        elif ext == '.pptx':
            prs = Presentation(input_path)
            prs.core_properties.author = ""
            prs.core_properties.last_modified_by = ""
            prs.core_properties.comments = ""
            prs.save(output_path)


        else:
            # Fallback: just copy if not supported
            import shutil
            shutil.copy2(input_path, output_path)
            
    except Exception as e:
        print(f"Error removing metadata: {e}")
        # If failure, copy original to ensure file exists
        import shutil
        shutil.copy2(input_path, output_path)
