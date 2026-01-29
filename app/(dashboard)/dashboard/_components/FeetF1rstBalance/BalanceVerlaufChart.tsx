'use client'
import React, { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { totalRadioMassschuheOrder } from '@/apis/MassschuheManagemantApis';

interface ChartDataPoint {
    date: string;
    value: number;
}

interface DailyDataItem {
    date: string;
    value: number;
    count: number;
}

interface BalanceRatioResponse {
    success: boolean;
    message: string;
    data: {
        partnerId: string;
        month: number;
        year: number;
        dailyData: DailyDataItem[];
    };
}

export default function BalanceVerlaufChart() {
    const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
    const [loading, setLoading] = useState(true);
    const interval = Math.max(0, Math.floor(chartData.length / 8));

    useEffect(() => {
        const fetchChart = async () => {
            try {
                setLoading(true);
                const response = await totalRadioMassschuheOrder() as BalanceRatioResponse;
                
                // Extract dailyData from response
                const dailyData = response?.data?.dailyData;
                
                if (Array.isArray(dailyData) && dailyData.length > 0) {
                    const mapped: ChartDataPoint[] = dailyData.map((item) => ({
                        date: new Date(item.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }),
                        value: typeof item.value === 'number' ? item.value : Number(item.value) || 0,
                    }));
                    
                    // Check if all values are 0
                    const hasNonZeroValues = mapped.some(item => item.value !== 0);
                    
                    if (hasNonZeroValues) {
                        setChartData(mapped);
                    } else {
                        // All values are 0 - show empty state
                        setChartData([]);
                    }
                } else {
                    // No data from API – show empty chart
                    setChartData([]);
                }
            } catch (error) {
                console.error('Failed to fetch balance chart:', error);
                setChartData([]);
            } finally {
                setLoading(false);
            }
        };
        fetchChart();
    }, []);
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                    <p className="font-semibold text-gray-800">{label}</p>
                    <p className="text-emerald-600 font-bold">
                        {payload[0].value.toLocaleString('de-DE', { 
                            minimumFractionDigits: 1, 
                            maximumFractionDigits: 1 
                        })}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Balance Verlauf</h2>
            
            {loading ? (
                <div className="w-full h-56 sm:h-64 md:h-72 flex items-center justify-center">
                    <p className="text-gray-500">Lädt...</p>
                </div>
            ) : chartData.length === 0 ? (
                <div className="w-full h-56 sm:h-64 md:h-72 flex items-center justify-center">
                    <p className="text-gray-500">Keine Daten verfügbar</p>
                </div>
            ) : (
            <div className="w-full h-56 sm:h-64 md:h-72">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={chartData}
                        margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
                    >
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fill: '#6B7280' }}
                            interval={interval}
                            angle={0}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fill: '#6B7280' }}
                            domain={[0, 'dataMax + 1']}
                            tickFormatter={(value) => value.toFixed(1)}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Line
                            type="monotone"
                            dataKey="value"
                            stroke="#10B981"
                            strokeWidth={2}
                            dot={{ r: 4, fill: '#10B981', stroke: '#fff', strokeWidth: 2 }}
                            activeDot={{ r: 6, fill: '#10B981', stroke: '#fff', strokeWidth: 2 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
            )}
        </div>
    );
}
