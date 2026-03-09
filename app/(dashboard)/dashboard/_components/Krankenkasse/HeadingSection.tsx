import React from 'react'
import { Button } from '@/components/ui/button'
import { Upload, Download, Plus } from 'lucide-react'

export default function HeadingSection() {
    return (
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
                <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
                    Krankenkassen-Einstellungen
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                    Verwalten Sie alle Krankenkassen, mit denen Ihr Partnergeschäft arbeitet.
                </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <Button variant="outline" size="default" className="border-gray-300">
                    <Upload className="size-4" />
                    Importieren
                </Button>
                <Button variant="outline" size="default" className="border-gray-300">
                    <Download className="size-4" />
                    Exportieren
                </Button>
                <Button
                    size="default"
                    className="bg-[#61A175] hover:bg-[#4f8a61] text-white"
                >
                    <Plus className="size-4" />
                    Neue Kasse
                </Button>
            </div>
        </header>
    )
}
