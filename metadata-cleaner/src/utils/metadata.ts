export interface Metadata {
    [key: string]: string;
}

export const generateMockMetadata = (file: File): Metadata => {
    const type = file.type;
    const common = {
        "File Name": file.name,
        "File Size": (file.size / 1024).toFixed(2) + " KB",
        "Last Modified": new Date(file.lastModified).toLocaleString(),
    };

    if (type.startsWith('image/')) {
        return {
            ...common,
            "Camera Make": "Canon",
            "Camera Model": "EOS R5",
            "Lens": "RF 24-70mm f/2.8 L IS USM",
            "ISO": "100",
            "Shutter Speed": "1/200",
            "Aperture": "f/5.6",
            "GPS Position": "37.7749° N, 122.4194° W",
            "Software": "Adobe Photoshop 2024",
            "Original Date": "2024-10-15 14:30:22",
            "Risk Level": "High"
        };
    } else if (type === 'application/pdf') {
        return {
            ...common,
            "Author": "John Doe",
            "Creator": "Microsoft Word 16.0",
            "Producer": "macOS 14.2 Quartz PDFContext",
            "Creation Date": "2024-05-12 09:15:00",
            "Title": "Quarterly Report",
            "Keywords": "financial, internal, sensitive",
            "Risk Level": "Medium"
        }
    } else if (type.includes('word') || type.includes('document')) {
        return {
            ...common,
            "Author": "Alice Smith",
            "Last Saved By": "Alice Smith",
            "Company": "Acme Corp",
            "Revision": "12",
            "Total Edit Time": "450 mins",
            "Risk Level": "High"
        }
    }

    return { ...common, "Risk Level": "Low", "Note": "No specific metadata parsers found for this type." };
};
