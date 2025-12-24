'use client'
import React from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceDot, CartesianGrid } from 'recharts';

interface ChartData {
    date: string;
    value: number;
}

export default function LineChartComponent({ chartData }: { chartData: ChartData[] }) {
    if (!chartData || chartData.length === 0) {
        return (
            <div className="w-full h-[300px] flex items-center justify-center">
                <div className="text-lg text-gray-500">Keine Daten verfügbar</div>
            </div>
        );
    }

    // Find peak and dip (only for non-zero values)
    const nonZeroData = chartData.filter(d => d.value > 0);
    const maxPoint = nonZeroData.length > 0 ? nonZeroData.reduce((max, d) => d.value > max.value ? d : max, nonZeroData[0]) : null;
    const minPoint = nonZeroData.length > 0 ? nonZeroData.reduce((min, d) => d.value < min.value ? d : min, nonZeroData[0]) : null;

    // Custom tooltip formatter
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                    <p className="font-semibold text-gray-800">{`Zeitraum: ${label}`}</p>
                    <p className="text-blue-600 font-bold">{`Gesamtumsatz: ${payload[0].value.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`}</p>
                    <p className="text-gray-600 text-sm">{`3-Tage-Gesamt`}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="w-full min-w-[800px] md:min-w-0 py-4" style={{ minWidth: 800 }}>
            <ResponsiveContainer width="100%" height={400}>
                <LineChart
                    data={chartData}
                    margin={{ top: 30, right: 30, left: 30, bottom: 80 }}
                >
                    <CartesianGrid strokeDasharray="1 3" />
                    <XAxis
                        dataKey="date"
                        tick={{ fontSize: 11 }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        interval={0}
                    />
                    <YAxis
                        domain={[0, 'dataMax + 1000']}
                        tickFormatter={v => v.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'}
                        tick={{ fontSize: 12 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#61A175"
                        strokeWidth={3}
                        dot={{ r: 5, fill: '#61A175' }}
                        activeDot={{ r: 7, fill: '#f59e42' }}
                    />
                    {/* Highlight peak */}
                    {maxPoint && maxPoint.value > 0 && (
                        <ReferenceDot
                            x={maxPoint.date}
                            y={maxPoint.value}
                            r={8}
                            fill="#22c55e"
                            stroke="#fff"
                            strokeWidth={2}
                        />
                    )}
                    {/* Highlight dip */}
                    {minPoint && minPoint.value > 0 && (
                        <ReferenceDot
                            x={minPoint.date}
                            y={minPoint.value}
                            r={8}
                            fill="#ef4444"
                            stroke="#fff"
                            strokeWidth={2}
                        />
                    )}
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}
