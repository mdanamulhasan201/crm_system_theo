import { DocumentType } from './types'

// Map file types to document types
export const mapFileTypeToDocumentType = (fileType: string, table: string, fieldName: string): DocumentType => {
    // Check table and fieldName for specific document types
    if (table === 'customer_files') {
        // You can add logic here to determine document type based on fieldName or other criteria
        // For now, we'll map by file extension
        switch (fileType.toLowerCase()) {
            case 'pdf':
                return 'pdf'
            case 'jpg':
            case 'jpeg':
                return 'jpg'
            case 'webp':
                return 'webp'
            default:
                return 'image'
        }
    }

    // Map by file extension
    switch (fileType.toLowerCase()) {
        case 'pdf':
            return 'pdf'
        case 'stl':
            return 'stl'
        case 'csv':
            return 'csv'
        case 'jpg':
        case 'jpeg':
            return 'jpg'
        case 'webp':
            return 'webp'
        default:
            return 'image'
    }
}

// Get color classes based on document type
export const getDocumentColors = (type: DocumentType): { iconColor: string; tagColor: string } => {
    const colorMap: Record<DocumentType, { iconColor: string; tagColor: string }> = {
        all: { iconColor: 'text-gray-600', tagColor: 'bg-gray-100 text-gray-700' },
        rezept: { iconColor: 'text-blue-600', tagColor: 'bg-blue-100 text-blue-700' },
        kostenvoranschlag: { iconColor: 'text-purple-600', tagColor: 'bg-purple-100 text-purple-700' },
        genehmigung: { iconColor: 'text-green-600', tagColor: 'bg-green-100 text-green-700' },
        konformität: { iconColor: 'text-cyan-600', tagColor: 'bg-cyan-100 text-cyan-700' },
        rechnung: { iconColor: 'text-orange-600', tagColor: 'bg-orange-100 text-orange-700' },
        zahlungsbeleg: { iconColor: 'text-yellow-600', tagColor: 'bg-yellow-100 text-yellow-700' },
        image: { iconColor: 'text-pink-600', tagColor: 'bg-pink-100 text-pink-700' },
        stl: { iconColor: 'text-indigo-600', tagColor: 'bg-indigo-100 text-indigo-700' },
        csv: { iconColor: 'text-teal-600', tagColor: 'bg-teal-100 text-teal-700' },
        pdf: { iconColor: 'text-red-600', tagColor: 'bg-red-100 text-red-700' },
        jpg: { iconColor: 'text-pink-600', tagColor: 'bg-pink-100 text-pink-700' },
        webp: { iconColor: 'text-pink-600', tagColor: 'bg-pink-100 text-pink-700' }
    }
    return colorMap[type] || colorMap.image
}

// Format file size (mock - API doesn't provide size)
export const formatFileSize = (url: string): string => {
    // Since API doesn't provide size, we'll return a placeholder
    // In production, you might want to fetch file headers or store size in DB
    return 'N/A'
}

// Format date
export const formatDate = (dateString: string): string => {
    try {
        const date = new Date(dateString)
        return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
    } catch {
        return dateString
    }
}

// Get file title from URL
export const getFileTitle = (url: string, fieldName: string, table: string): string => {
    const fileName = url.split('/').pop() || url
    // Extract only the last part after the last dash
    const lastPart = fileName.includes('-')
        ? fileName.substring(fileName.lastIndexOf('-') + 1)
        : fileName
    // If still too long, truncate
    if (lastPart.length > 30) {
        return lastPart.substring(0, 27) + '...'
    }
    return lastPart || `${fieldName}_${table}`
}
