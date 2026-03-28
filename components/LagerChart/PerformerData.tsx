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

    /** Extra vertical px per category so Y labels and grid lines do not stack; hover shows full name via <title> */
    const renderYAxisTick = (props: { x?: number; y?: number; payload?: { value?: string } }) => {
        const { x = 0, y = 0, payload } = props
        const raw = String(payload?.value ?? '')
        const maxLen = isSmall ? 14 : 26
        const shown = raw.length > maxLen ? `${raw.slice(0, Math.max(0, maxLen - 1))}…` : raw
        return (
            <g transform={`translate(${x},${y})`}>
                <title>{raw}</title>
                <text x={0} y={0} dy={4} textAnchor="end" fill="#666" fontSize={isSmall ? 10 : 11}>
                    {shown}
                </text>
            </g>
        )
    }

    // Calculate max verkaufe for dynamic domain (round domain to avoid float ticks like 63.5999…)
    const maxVerkaufeRaw =
        currentData.length > 0 ? Math.max(...currentData.map((item) => item.verkaufe), 1) * 1.2 : 250
    const maxVerkaufe = Math.ceil(maxVerkaufeRaw)

    /** Vertical bar chart: generous px per row so labels/bars do not stick together; outer box stays short — scroll handles overflow */
    const BAR_ROW_PX = 44
    const CHART_MIN_HEIGHT = 220
    const SCROLL_MAX_HEIGHT = 'min(46vh, 340px)'
    const chartContentHeight = Math.max(CHART_MIN_HEIGHT, currentData.length * BAR_ROW_PX)

    const formatUmsatzanteil = (n: number) => {
        if (!Number.isFinite(n)) return '0'
        const rounded = Math.round(n * 10) / 10
        return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1)
    }

    const xAxisTickFormatter = (v: number) => {
        if (!Number.isFinite(v)) return ''
        const rounded = Math.round(v)
        return Math.abs(v - rounded) < 1e-9 ? String(rounded) : String(Math.round(v * 10) / 10)
    }

    const yAxisWidth = isSmall ? 80 : windowWidth < 1024 ? 118 : 140

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
            <div className="w-full  -mx-2 sm:mx-0">
                <div className="rounded-lg border border-gray-200 p-2 sm:p-4 min-w-[280px]">
                    <h1 className='text-base sm:text-lg md:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 md:mb-6'>
                        {activeTab === 'top' ? 'Top-Performer' : 'Low-Performer'} Modelle/Aufträge
                    </h1>
                    
                    {loading ? (
                        <div className="flex items-center justify-center h-[160px]">
                            <div className="text-gray-500 text-sm">Loading...</div>
                        </div>
                    ) : error ? (
                        <div className="flex items-center justify-center h-[160px]">
                            <div className="text-red-500 text-sm">{error}</div>
                        </div>
                    ) : currentData.length === 0 ? (
                        <div className="flex items-center justify-center h-[160px]">
                            <div className="text-gray-500 text-sm">No data available</div>
                        </div>
                    ) : (
                        <div
                            className="flex flex-col lg:flex-row gap-3 sm:gap-4 lg:gap-6 lg:items-start overflow-y-auto overflow-x-hidden rounded-md pr-1 -mr-1 [scrollbar-gutter:stable]"
                            style={{ maxHeight: SCROLL_MAX_HEIGHT }}
                        >
                            {/* Chart — height grows with row count; section scrolls when content exceeds maxHeight */}
                            <div className="flex-1 w-full min-w-0 shrink-0">
                                <div style={{ height: chartContentHeight }} className="w-full min-h-[220px]">
                                    <ResponsiveContainer width="100%" height={chartContentHeight}>
                                        <BarChart
                                            data={currentData}
                                            layout="vertical"
                                            barCategoryGap="36%"
                                            barGap={4}
                                            margin={{
                                                top: 10,
                                                right: isSmall ? 8 : windowWidth < 1024 ? 14 : 22,
                                                left: 10,
                                                bottom: 10
                                            }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                            <XAxis
                                                type="number"
                                                domain={[0, maxVerkaufe]}
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fontSize: isSmall ? 10 : windowWidth < 1024 ? 11 : 12, fill: '#666' }}
                                                tickFormatter={xAxisTickFormatter}
                                            />
                                            <YAxis
                                                type="category"
                                                dataKey="model"
                                                axisLine={false}
                                                tickLine={false}
                                                interval={0}
                                                tick={renderYAxisTick}
                                                width={yAxisWidth}
                                            />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Bar
                                                dataKey="verkaufe"
                                                fill="#10B981"
                                                radius={[0, 3, 3, 0]}
                                                maxBarSize={26}
                                                barSize={
                                                    isSmall
                                                        ? 12
                                                        : windowWidth < 640
                                                          ? 14
                                                          : windowWidth < 1024
                                                            ? 16
                                                            : 18
                                                }
                                                name="Verkäufe"
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Table — same scroll region as chart so rows stay aligned */}
                            <div className="w-full lg:w-4/12 shrink-0">
                                <div className="bg-gray-50 rounded-lg p-2 sm:p-3 md:p-4 flex flex-col h-full">
                                    <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 mb-2 sm:mb-3">
                                        <div className="text-xs sm:text-sm font-medium text-gray-700 text-center">
                                            Verkäufe
                                        </div>
                                        <div className="text-xs sm:text-sm font-medium text-gray-700 text-center">
                                            Umsatzanteil
                                        </div>
                                    </div>

                                    <div className="flex flex-col">
                                        {currentData.map((item, index) => (
                                            <div
                                                key={index}
                                                className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 text-xs sm:text-sm py-2 border-b border-gray-100/80 last:border-0 min-h-[44px] items-center"
                                            >
                                                <div className="text-center font-medium text-gray-800 tabular-nums">
                                                    {item.verkaufe}
                                                </div>
                                                <div className="text-center font-medium text-gray-800 tabular-nums">
                                                    {formatUmsatzanteil(item.umsatzanteil)}%
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
