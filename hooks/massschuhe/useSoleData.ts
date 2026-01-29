import { useState, useEffect } from "react"

export type SoleType = {
    id: string
    name: string
    des?: string
    image: string
    description: string
}

export function useSoleData() {
    const [soleOptions, setSoleOptions] = useState<SoleType[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchSoleData = async () => {
            try {
                const response = await fetch('/data/soleData.json')
                const data = await response.json()
                setSoleOptions(data as SoleType[])
            } catch (error) {
                console.error('Error fetching sole data:', error)
                setSoleOptions([])
            } finally {
                setLoading(false)
            }
        }
        fetchSoleData()
    }, [])

    return { soleOptions, loading }
}

