import React from 'react'

const diagnosisOptions = [
    { value: '', label: 'Keine Diagnose auswählen' },
    { value: 'PLANTARFASZIITIS', label: 'Plantarfasziitis' },
    { value: 'FERSENSPORN', label: 'Fersensporn' },
    { value: 'SPREIZFUSS', label: 'Spreizfuß' },
    { value: 'SENKFUSS', label: 'Senkfuß' },
    { value: 'PLATTFUSS', label: 'Plattfuß' },
    { value: 'HOHLFUSS', label: 'Hohlfuß' },
    { value: 'KNICKFUSS', label: 'Knickfuß' },
    { value: 'KNICK_SENKFUSS', label: 'Knick-Senkfuß' },
    { value: 'HALLUX_VALGUS', label: 'Hallux valgus' },
    { value: 'HALLUX_RIGIDUS', label: 'Hallux rigidus' },
    { value: 'HAMMERZEHEN_KRALLENZEHEN', label: 'Hammerzehen / Krallenzehen' },
    { value: 'MORTON_NEUROM', label: 'Morton-Neurom' },
    { value: 'FUSSARTHROSE', label: 'Fußarthrose' },
    { value: 'STRESSFRAKTUREN_IM_FUSS', label: 'Stressfrakturen im Fußbereich' },
    { value: 'DIABETISCHES_FUSSSYNDROM', label: 'Diabetisches Fußsyndrom' },
]

type DiagnosisSelectorProps = {
    value: string
    onChange: (value: string) => void
}

export default function DiagnosisSelector({ value, onChange }: DiagnosisSelectorProps) {
    return (
        <div>
            <label className="font-bold mb-1 block">Diagnose (Optional)</label>
            <select
                name="diagnosis"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="border p-2 rounded w-full"
            >
                {diagnosisOptions.map(option => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    )
}

