/**
 * Remote file helpers: true download (blob) vs preview (new tab).
 */

export function sanitizeFilename(name: string, fallback = 'download'): string {
    const s = name.replace(/[/\\?%*:|"<>]/g, '-').trim() || fallback
    return s.length > 200 ? s.slice(0, 200) : s
}

/**
 * Downloads a file in-place without navigating the current tab.
 * Uses fetch → blob → object URL (works when the server sends CORS headers).
 */
export async function downloadUrlAsFile(url: string, filename: string): Promise<boolean> {
    const safe = sanitizeFilename(filename)
    try {
        const res = await fetch(url, { mode: 'cors', credentials: 'omit' })
        if (!res.ok) throw new Error(String(res.status))
        const blob = await res.blob()
        const objectUrl = URL.createObjectURL(blob)
        try {
            const a = document.createElement('a')
            a.href = objectUrl
            a.download = safe
            a.rel = 'noopener'
            document.body.appendChild(a)
            a.click()
            a.remove()
        } finally {
            URL.revokeObjectURL(objectUrl)
        }
        return true
    } catch {
        return false
    }
}

/** Opens the file URL in a new tab for preview (PDF, images, etc.). */
export function openFilePreview(url: string): void {
    window.open(url, '_blank', 'noopener,noreferrer')
}
