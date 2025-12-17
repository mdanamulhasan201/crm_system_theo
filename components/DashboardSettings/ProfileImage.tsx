"use client"
import React, { useEffect, useRef, useState } from 'react'
import Image from "next/image";
import { FaCamera } from "react-icons/fa";

type ProfileImageProps = {
  src?: string | null
  onChange?: (file: File, dataUrl: string) => void
  editable?: boolean
}

const normalizeImageSrc = (value?: string | null): string | null => {
  if (!value) return null

  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("data:")
  ) {
    return value
  }

  if (value.startsWith("/")) {
    return value
  }

  // e.g. "fragrances-...trycloudflare.com/..." → add https://
  return `https://${value}`
}

export default function ProfileImage({ src = null, onChange, editable = true }: ProfileImageProps) {
  const [logo, setLogo] = useState<string | null>(normalizeImageSrc(src))
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setLogo(normalizeImageSrc(src))
  }, [src])

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const reader = new FileReader()
      reader.onload = ev => {
        const dataUrl = ev.target?.result as string
        setLogo(dataUrl)
        if (onChange) onChange(file, dataUrl)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className=" flex flex-col items-center relative">
      <div className="relative mb-4">
        <div
          className={`relative w-28 h-28 rounded-full bg-gray-100 flex items-center justify-center border-2 border-[#62A07C] overflow-hidden shadow-md group ${editable ? 'cursor-pointer' : 'cursor-default opacity-100'} transition-all duration-200`}
          tabIndex={editable ? 0 : -1}
          onClick={() => { if (editable) fileInputRef.current?.click() }}
          onKeyPress={e => { if (editable && e.key === "Enter") fileInputRef.current?.click() }}
          title={editable ? "Logo hochladen" : "Bearbeiten aktivieren, um das Logo zu ändern"}
        >
          {logo ? (
            <div className="w-20 h-full p-2">
              <Image
                width={500}
                height={500}
                src={logo}
                alt="Logo Preview"
                className="w-full h-full "
              />
            </div>
          ) : (
            <span className="text-gray-300 text-4xl">+</span>
          )}
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={handleLogoChange}
            disabled={!editable}
          />
        </div>
        <div
          className={`absolute bottom-0 -right-0 border border-white rounded-full w-9 h-9 flex items-center justify-center shadow-lg transition-all duration-200 z-10 ${editable ? 'bg-black/90 group-hover:bg-blue-600 cursor-pointer' : 'bg-gray-300 cursor-not-allowed'}`}
          onClick={e => {
            if (!editable) return
            e.stopPropagation()
            fileInputRef.current?.click()
          }}
          title={editable ? "Logo ändern" : "Bearbeiten aktivieren, um das Logo zu ändern"}
          aria-disabled={!editable}
        >
          <FaCamera className={`text-lg ${editable ? 'text-white' : 'text-gray-500'}`} />
        </div>
      </div>
      <p className="text-sm text-gray-500 mt-4 text-center max-w-lg">Laden Sie hier Ihr Firmenlogo hoch, um es an verschiedenen Stellen wie Werkstattzetteln, Rechnungen und der Partnerübersicht anzuzeigen.</p>
    </div>
  )
}
