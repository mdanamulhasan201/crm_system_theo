'use client'
import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'

interface ImageDisplayProps {
    imageUrl: string
    alt: string
    isZoomMode?: boolean
    onLoad?: () => void
    onError?: () => void
}

export default function ImageDisplay({
    imageUrl,
    alt,
    isZoomMode = false,
    onLoad,
    onError
}: ImageDisplayProps) {
    const [isImageLoading, setIsImageLoading] = useState(true)
    const [useFallbackImage, setUseFallbackImage] = useState(false)
    const [imageLoadError, setImageLoadError] = useState<string | null>(null)
    const originalImageRef = useRef<HTMLImageElement | null>(null)

    // Reset state when image URL changes
    useEffect(() => {
        setIsImageLoading(true)
        setUseFallbackImage(false)
        setImageLoadError(null)
    }, [imageUrl])

    const handleImageLoad = (img: HTMLImageElement) => {
        originalImageRef.current = img
        setIsImageLoading(false)
        setImageLoadError(null)
        onLoad?.()
    }

    const handleImageError = () => {
        if (!useFallbackImage) {
            console.warn('Next.js Image failed, falling back to regular img tag. URL:', imageUrl)
            setIsImageLoading(false)
            setUseFallbackImage(true)
        } else {
            console.error('Fallback image failed without CORS. URL:', imageUrl)
            setImageLoadError('Image konnte nicht geladen werden')
            setIsImageLoading(false)
            onError?.()
        }
    }

    if (!imageUrl) {
        return (
            <div className={`w-full bg-gray-100 border-2 border-dashed border-gray-300 ${
                isZoomMode ? 'rounded-xl h-[600px] lg:h-[800px]' : 'rounded-lg h-64 sm:h-80 md:h-96 lg:h-[500px] xl:h-[600px]'
            } flex flex-col items-center justify-center text-gray-500 text-sm md:text-base p-4`}>
                {imageLoadError ? (
                    <>
                        <p className="text-red-600 font-semibold mb-2">{imageLoadError}</p>
                        <p className="text-xs text-gray-400 break-all text-center">{imageUrl}</p>
                    </>
                ) : (
                    'Kein Bild verfügbar'
                )}
            </div>
        )
    }

    return (
        <div className="relative w-full">
            {/* Shimmer effect while loading */}
            {isImageLoading && (
                <div className={`absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse z-10 ${
                    isZoomMode ? 'rounded-xl' : 'rounded-lg'
                }`} />
            )}
            
            {!useFallbackImage ? (
                <Image
                    src={imageUrl}
                    alt={alt}
                    width={isZoomMode ? 800 : 400}
                    height={isZoomMode ? 1200 : 600}
                    className={`w-full h-auto transition-opacity duration-300 ${
                        isZoomMode ? 'rounded-xl shadow-inner' : 'rounded-lg'
                    } bg-gray-50 ${isImageLoading ? 'opacity-0' : 'opacity-100'}`}
                    priority={isZoomMode}
                    unoptimized={true}
                    onLoad={(e) => handleImageLoad(e.target as HTMLImageElement)}
                    onError={handleImageError}
                />
            ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={imageUrl}
                    alt={alt}
                    className={`w-full h-auto transition-opacity duration-300 ${
                        isZoomMode ? 'rounded-xl shadow-inner' : 'rounded-lg'
                    } bg-gray-50 ${isImageLoading ? 'opacity-0' : 'opacity-100'}`}
                    onLoad={(e) => handleImageLoad(e.target as HTMLImageElement)}
                    onError={handleImageError}
                />
            )}
        </div>
    )
}

