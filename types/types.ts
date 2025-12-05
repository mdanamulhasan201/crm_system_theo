export type DocumentType = 'all' | 'rezept' | 'kostenvoranschlag' | 'genehmigung' | 'konformität' | 'rechnung' | 'zahlungsbeleg' | 'image' | 'stl' | 'csv' | 'pdf' | 'jpg' | 'webp'

export type TableFilter = 'all' | 'customer_files' | 'custom_shafts' | 'screener_file'

export interface Document {
    id: string
    url: string
    title: string
    size: string
    date: string
    type: DocumentType
    iconColor: string
    tagColor: string
    fullUrl: string
    fileType: string
    table: string
    fieldName: string
}

export interface ApiFile {
    fieldName: string
    table: string
    url: string
    id: string
    fileType: string
    createdAt: string
    fullUrl: string
}

export interface ApiResponse {
    success: boolean
    message: string
    data: ApiFile[]
    pagination: {
        page: number
        limit: number
        total: number
        totalPages: number
        hasNext: boolean
        hasPrev: boolean
    }
}

export const documentTypeLabels: Record<DocumentType, string> = {
    all: 'Alle',
    rezept: 'Rezept',
    kostenvoranschlag: 'Kostenvoranschlag',
    genehmigung: 'Genehmigung',
    konformität: 'Konformität',
    rechnung: 'Rechnung',
    zahlungsbeleg: 'Zahlungsbeleg',
    image: 'Bild',
    stl: '3D Modell',
    csv: 'CSV',
    pdf: 'PDF',
    jpg: 'JPG',
    webp: 'WebP'
}

export const tableFilterLabels: Record<TableFilter, string> = {
    all: 'Alle',
    customer_files: 'Kundendateien',
    custom_shafts: 'Individuelle Schäfte',
    screener_file: 'Scanner-Datei'
}
