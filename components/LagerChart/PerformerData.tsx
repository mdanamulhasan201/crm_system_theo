'use client'
import React, { useEffect, useState, useCallback } from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { getPerformanceData } from '@/apis/productsManagementApis'

interface PerformerDataItem {
    model: string
    verkaufe: number
    umsatzanteil: number
    progress: number
}

export default function PerformerData() {
    const [activeTab, setActiveTab] = useState<'top' | 'low'>('top')
    const [currentData, setCurrentData] = useState<PerformerDataItem[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

    // Responsive tweaks
    const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1200)
    const isSmall = windowWidth < 768

    // Fetch performance data
    const fetchPerformanceData = useCallback(async (type: 'top' | 'low') => {
        try {
            setLoading(true)
            setError(null)
            const response = await getPerformanceData(type)
            console.log('Performance Data Response:', response)
            
            // Check if response has the expected structure
            if (response && response.success && response.data && Array.isArray(response.data)) {
                setCurrentData(response.data)
                console.log('Data set successfully:', response.data)
            } else {
                console.warn('Unexpected response structure:', response)
                setError(response?.message || 'Failed to fetch performance data')
                setCurrentData([])
            }
        } catch (err: any) {
            console.error('Error fetching performance data:', err)
            const errorMessage = err?.response?.data?.message || err?.message || 'Error fetching performance data'
            setError(errorMessage)
            setCurrentData([])
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchPerformanceData(activeTab)
    }, [activeTab, fetchPerformanceData])

    useEffect(() => {
        const onResize = () => setWindowWidth(window.innerWidth)
        window.addEventListener('resize', onResize)
        return () => window.removeEventListener('resize', onResize)
    }, [])

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-2 sm:p-3 border border-gray-200 shadow-lg rounded-lg">
                    <p className="font-semibold text-xs sm:text-sm text-gray-800">{`${label}`}</p>
                    <p className="text-xs sm:text-sm text-gray-600">
                        Verkäufe: <span className="font-medium">{payload[0].value}</span>
                    </p>
                </div>
            )
        }
        return null
    }

    // Calculate max verkaufe for dynamic domain
    const maxVerkaufe = currentData.length > 0 
        ? Math.max(...currentData.map(item => item.verkaufe), 1) * 1.2 // Add 20% padding, minimum 1
        : 250

    return (
        <div className="lg:mt-14 w-full">

            {/* Tabs */}
            <div className="flex mb-4 sm:mb-6">
                <button
                    onClick={() => setActiveTab('top')}
                    disabled={loading}
                    className={`px-3 sm:px-4 py-2 rounded-l-lg cursor-pointer font-medium text-xs sm:text-sm transition-colors ${activeTab === 'top'
                        ? 'bg-gray-800 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    Top-Performer
                </button>
                <button
                    onClick={() => setActiveTab('low')}
                    disabled={loading}
                    className={`px-3 sm:px-4 py-2 rounded-r-lg cursor-pointer font-medium text-xs sm:text-sm transition-colors ${activeTab === 'low'
                        ? 'bg-gray-800 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    Low-Performer
                </button>
            </div>

            {/* Chart and Table */}
            <div className="w-full overflow-x-auto -mx-2 sm:mx-0">
                <div className="rounded-lg border border-gray-200 p-2 sm:p-4 min-w-[280px]">
                    <h1 className='text-base sm:text-lg md:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 md:mb-6'>
                        {activeTab === 'top' ? 'Top-Performer' : 'Low-Performer'} Modelle/Aufträge
                    </h1>
                    
                    {loading ? (
                        <div className="flex items-center justify-center h-[300px]">
                            <div className="text-gray-500 text-sm">Loading...</div>
                        </div>
                    ) : error ? (
                        <div className="flex items-center justify-center h-[300px]">
                            <div className="text-red-500 text-sm">{error}</div>
                        </div>
                    ) : currentData.length === 0 ? (
                        <div className="flex items-center justify-center h-[300px]">
                            <div className="text-gray-500 text-sm">No data available</div>
                        </div>
                    ) : (
                        <div className='flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8'>
                            {/* Chart */}
                            <div className="flex-1 w-full min-w-0">
                                <div className="h-[200px] sm:h-[240px] md:h-[280px] lg:h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={currentData}
                                            layout="vertical"
                                            margin={{
                                                top: 10,
                                                right: isSmall ? 5 : (windowWidth < 1024 ? 15 : 30),
                                                left: isSmall ? 0 : 0,
                                                bottom: 10
                                            }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                            <XAxis
                                                type="number"
                                                domain={[0, maxVerkaufe]}
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fontSize: isSmall ? 10 : (windowWidth < 1024 ? 11 : 12), fill: '#666' }}
                                            />
                                            <YAxis
                                                type="category"
                                                dataKey="model"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fontSize: isSmall ? 10 : (windowWidth < 1024 ? 11 : 12), fill: '#666' }}
                                                width={isSmall ? 60 : (windowWidth < 1024 ? 70 : 80)}
                                            />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Bar
                                                dataKey="verkaufe"
                                                fill="#10B981"
                                                radius={[0, 4, 4, 0]}
                                                barSize={isSmall ? 10 : (windowWidth < 640 ? 12 : (windowWidth < 1024 ? 14 : 16))}
                                                name="Verkäufe"
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Table */}
                            <div className="w-full lg:w-4/12 h-auto lg:h-[300px]">
                                <div className="bg-gray-50 rounded-lg p-2 sm:p-3 md:p-4 h-full flex flex-col min-h-[200px] lg:min-h-0">
                                    <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 mb-2 sm:mb-3">
                                        <div className="text-xs sm:text-sm font-medium text-gray-700 text-center">Verkäufe</div>
                                        <div className="text-xs sm:text-sm font-medium text-gray-700 text-center">
                                            Umsatzanteil
                                        </div>
                                    </div>

                                    <div className="flex-1 flex flex-col justify-between gap-2 sm:gap-0">
                                        {currentData.map((item, index) => (
                                            <div key={index} className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 text-xs sm:text-sm">
                                                <div className="text-center font-medium text-gray-800">
                                                    {item.verkaufe}
                                                </div>
                                                <div className="text-center font-medium text-gray-800">
                                                    {item.umsatzanteil}%
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
