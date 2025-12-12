'use client'
import React, { useState } from 'react'
import { Play } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'

interface VideoTutorial {
    id: string
    title: string
    description: string
    videoUrl: string // Direct video URL
    thumbnailUrl: string // Thumbnail image URL
}

const videoTutorials: VideoTutorial[] = [
    {
        id: '1',
        title: 'EINLEITUNG',
        description: 'Lernen Sie die neue FeetFirst-Software kennen - jetzt als Video.',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        thumbnailUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg',
    },
    {
        id: '2',
        title: 'OUTSOURCING',
        description: 'Maßschäfte und Konstruktionen - schnell, digital und ohne eigenen Aufwand.',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        thumbnailUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg',
    },
    {
        id: '3',
        title: 'SHOE FINDER',
        description: 'Alles, was Sie über den FeetFirst Shoe Finder wissen müssen.',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        thumbnailUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg',
    }
]

export default function VideosTutorial() {
    const [selectedVideo, setSelectedVideo] = useState<VideoTutorial | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const handleVideoClick = (video: VideoTutorial) => {
        setSelectedVideo(video)
        setIsModalOpen(true)
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
        setSelectedVideo(null)
    }

    return (
        <div className="w-full space-y-6">
            {/* Title */}
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">
                VIDEOS-TUTORIALS
            </h2>

            {/* Video Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videoTutorials.map((video) => (
                    <div
                        key={video.id}
                        className="cursor-pointer group"
                        onClick={() => handleVideoClick(video)}
                    >
                        {/* Video Thumbnail Card */}
                        <div className="bg-black rounded-lg overflow-hidden relative shadow-md hover:shadow-lg transition-shadow aspect-video">
                            {/* Video Preview (thumbnail) */}
                            <div className="w-full h-full relative">
                                {/* Video Thumbnail */}
                                <img
                                    src={video.thumbnailUrl}
                                    alt={video.title}
                                    className="w-full h-full object-cover"
                                />

                                {/* Play Button Overlay */}
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
                                    <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                        <Play className="w-8 h-8 md:w-10 md:h-10 text-black ml-1" fill="black" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Video Title */}
                        <h3 className="text-base md:text-lg font-bold text-gray-900 mt-4 mb-2">
                            {video.title}
                        </h3>

                        {/* Video Description */}
                        <p className="text-sm md:text-base text-gray-700">
                            {video.description}
                        </p>
                    </div>
                ))}
            </div>

            {/* Video Modal */}
            <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
                <DialogContent className="max-w-4xl w-full p-0">
                    <DialogHeader className="px-6 pt-6 pb-4">
                        <DialogTitle className="text-xl md:text-2xl font-bold">
                            {selectedVideo?.title}
                        </DialogTitle>
                    </DialogHeader>
                    
                    {selectedVideo && (
                        <div className="px-6 pb-6">
                            {/* Video Player */}
                            <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
                                <video
                                    src={selectedVideo.videoUrl}
                                    controls
                                    autoPlay
                                    className="w-full h-full"
                                >
                                    Your browser does not support the video tag.
                                </video>
                            </div>

                            {/* Video Description in Modal */}
                            <p className="text-sm md:text-base text-gray-600 mt-4">
                                {selectedVideo.description}
                            </p>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
