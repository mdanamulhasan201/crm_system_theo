'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Check, Camera, CheckCircle2, ArrowRight, Clock, FileText, X } from 'lucide-react';
import { BsDash } from 'react-icons/bs';
import { Button } from '@/components/ui/button';
import { SHOE_STEPS, ProgressData } from '@/app/(dashboard)/dashboard/_components/Massschuhauftraeges/NewMasschuhau/MasschuProgressTable';
import { getMassschuheOrderById } from '@/apis/MassschuheAddedApis';

// Short names for progress indicator (matching the image design)
const STEP_SHORT_NAMES = [
    'Scan',           // Auftragserstellung
    'Leisten',        // Leistenerstellung
    'Bettung',        // Bettungserstellung
    'Halbprobe',      // Halbprobenerstellung
    'Schaft',         // Halbprobe durchführen
    'Schaft Prod.',   // Schaft fertigen
    'Boden',          // Bodenerstellen
    'Finish',         // Qualitätskontrolle
    'Abholen',        // Abholbereit
    'Geliefert'       // Ausgeführt
];

type OrderDetailData = ProgressData & {
    fertigungsweisung: {
        leisten: string;
        bettung: string;
        schaft: string;
        boden: string;
        sonderanpassungen: string;
        halbprobe: string;
        checkliste: string;
        anmerkungen: string;
    };
    zeitverlauf: Array<{
        step: string;
        stepIndex: number;
        duration: string;
        completed: boolean;
        isCurrent: boolean;
    }>;
};

function ProgressIndicator({ currentStepIndex }: { currentStepIndex: number }) {
    return (
        <div className="flex items-end">
            {SHOE_STEPS.map((step, index) => {
                const isCompleted = index < currentStepIndex;
                const isCurrent = index === currentStepIndex;

                return (
                    <React.Fragment key={index}>
                        {index > 0 && (
                            <span
                                className={`font-semibold mx-5 shrink-0 leading-none select-none mb-3 ${
                                    index <= currentStepIndex ? 'text-emerald-400' : 'text-gray-300'
                                }`}
                            >
                                <BsDash className='text-4xl'/>
                            </span>
                        )}
                        <div className="flex flex-col items-center shrink-0">
                            <div
                                title={step}
                                className={`
                                    flex items-center justify-center
                                    rounded-full shrink-0
                                    w-7 h-7 
                                    text-xs font-bold
                                    transition-all mb-2
                                    ${isCompleted
                                        ? 'bg-emerald-100 text-emerald-500'
                                        : isCurrent
                                            ? 'bg-emerald-600 text-white'
                                            : 'bg-gray-100 text-gray-400'
                                    }
                                `}
                            >
                                {isCompleted ? (
                                    <Check className="w-4 h-4" strokeWidth={2.5} />
                                ) : (
                                    <span className="leading-none">{index + 1}</span>
                                )}
                            </div>
                            <span className={`text-xs font-medium text-center leading-tight ${
                                isCurrent ? 'text-emerald-700 font-semibold' : 'text-gray-600'
                            }`}>
                                {STEP_SHORT_NAMES[index] || step}
                            </span>
                        </div>
                    </React.Fragment>
                );
            })}
        </div>
    );
}

function mapApiOrderToDetailData(apiOrder: any): OrderDetailData | null {
    if (!apiOrder?.id) return null;
    const steps = apiOrder.shoeOrderStep ?? [];
    const completedCount = steps.filter((s: any) => s.isCompleted).length;
    const currentStepIndex = Math.min(completedCount, SHOE_STEPS.length - 1);
    const lastStep = steps[steps.length - 1];
    const days = lastStep ? Math.floor((Date.now() - new Date(lastStep.createdAt).getTime()) / (24 * 60 * 60 * 1000)) : 0;
    const currentStepDisplay = apiOrder.status ? apiOrder.status.replace(/_/g, ' ') : SHOE_STEPS[currentStepIndex] ?? '-';
    const nextAction = currentStepIndex < SHOE_STEPS.length - 1 ? SHOE_STEPS[currentStepIndex + 1] : 'Abgeschlossen';

    const zeitverlauf = SHOE_STEPS.map((step, index) => {
        const isCompleted = index < currentStepIndex;
        const isCurrent = index === currentStepIndex;
        const stepData = steps[index];
        const duration = stepData?.createdAt
            ? `${Math.max(0, Math.floor((Date.now() - new Date(stepData.createdAt).getTime()) / (24 * 60 * 60 * 1000)))}d`
            : '0d';
        return {
            step,
            stepIndex: index,
            duration: isCompleted || isCurrent ? duration : '0d',
            completed: isCompleted,
            isCurrent,
        };
    });

    return {
        id: apiOrder.id,
        auftrag: {
            name: [apiOrder.customer?.vorname, apiOrder.customer?.nachname].filter(Boolean).join(' ') || '-',
            orderNumber: `#${apiOrder.orderNumber}`,
            product: 'Massschuhe',
            isUrgent: apiOrder.priority === 'Dringend' || apiOrder.priority === 'Urgent',
        },
        currentStep: currentStepDisplay,
        location: apiOrder.branch_location?.title || apiOrder.branch_location?.description || '-',
        createDate: apiOrder.createdAt ? new Date(apiOrder.createdAt).toLocaleDateString('de-DE') : '-',
        days,
        isOverdue: days > 14,
        currentStepIndex,
        nextAction,
        responsible: apiOrder.payment_status || undefined,
        notes: '',
        fertigungsweisung: {
            leisten: '',
            bettung: '',
            schaft: '',
            boden: '',
            sonderanpassungen: '',
            halbprobe: '',
            checkliste: '',
            anmerkungen: '',
        },
        zeitverlauf,
    };
}

export default function MassschuhauftraegePage() {
    const params = useParams();
    const id = params?.id as string;
    const [orderData, setOrderData] = useState<OrderDetailData | null>(null);
    const [loading, setLoading] = useState(true);
    const [notes, setNotes] = useState('');
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        if (!id) {
            setLoading(false);
            return;
        }
        setLoading(true);
        getMassschuheOrderById(id)
            .then((res) => {
                const data = res?.data ?? res;
                setOrderData(mapApiOrderToDetailData(data));
            })
            .catch(() => setOrderData(null))
            .finally(() => setLoading(false));
    }, [id]);

    useEffect(() => {
        if (orderData?.notes) {
            setNotes(orderData.notes);
        }
    }, [orderData]);

    const handleFileUpload = (files: File[]) => {
        setUploadedFiles((prev) => [...prev, ...files]);
    };

    const handleRemoveFile = (index: number) => {
        setUploadedFiles((prev) => {
            const newFiles = [...prev];
            const removedFile = newFiles[index];
            if (removedFile && removedFile.type.startsWith('image/')) {
                URL.revokeObjectURL(URL.createObjectURL(removedFile));
            }
            newFiles.splice(index, 1);
            return newFiles;
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center text-gray-500">Laden...</div>
            </div>
        );
    }
    if (!orderData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 mb-4">Auftrag nicht gefunden</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
           

            {/* Progress Bar */}
            <div className="bg-white border border-gray-200 px-4 py-4">
                <div className="overflow-x-auto">
                    <ProgressIndicator currentStepIndex={orderData.currentStepIndex} />
                </div>
            </div>

            {/* Main Content */}
            <div className="flex gap-6 mt-5">
                {/* Left Side - Main Content */}
                <div className="flex-1">
                    <div className="bg-white rounded-lg border border-red-200 p-6">
                        {/* Header Section with Step Icon and Info */}
                        <div className="mb-6 flex items-center gap-3">
                            {/* Circular Icon with Step Number */}
                            <div className="relative shrink-0">
                                {/* Red circle with step number */}
                                <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center ">
                                    <span className="text-white text-base font-bold">
                                        {orderData.currentStepIndex + 1}
                                    </span>
                                   
                                </div>
                            </div>
                            
                            {/* Step Info */}
                            <div className="flex-1">
                                <h2 className="text-xl font-bold text-gray-900 mb-1">{orderData.currentStep}</h2>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm text-gray-400">
                                        Verantwortlich: <span className="text-gray-400">{orderData.responsible}</span>
                                    </span>
                                    {orderData.isOverdue && (
                                        <span className="text-sm text-red-600 font-medium">
                                            • {orderData.days}d überfällig
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Instruction Text */}
                        <div className="mb-6 p-3 bg-gray-50 rounded-lg ">
                            <p className="text-sm text-gray-500">
                                Dieser Schritt wartet auf Bearbeitung. Laden Sie relevante Bilder hoch und fügen Sie Notizen hinzu.
                            </p>
                        </div>

                        {/* Bilder Section */}
                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-3">
                                <Camera className="w-5 h-5 text-gray-600" />
                                <h3 className="text-lg font-semibold text-gray-900">Bilder</h3>
                            </div>
                            
                            {/* File Upload Area */}
                            <div
                                className={`border-2 border-dashed rounded-lg p-12 flex flex-col items-center justify-center transition-colors cursor-pointer ${
                                    isDragging 
                                        ? 'border-emerald-500 bg-emerald-50' 
                                        : 'border-gray-300 hover:border-emerald-400'
                                }`}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    setIsDragging(true);
                                }}
                                onDragLeave={() => setIsDragging(false)}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    setIsDragging(false);
                                    const files = Array.from(e.dataTransfer.files);
                                    handleFileUpload(files);
                                }}
                                onClick={() => document.getElementById('file-upload')?.click()}
                            >
                                <input
                                    id="file-upload"
                                    type="file"
                                    multiple
                                    accept="image/*,.pdf,.doc,.docx"
                                    className="hidden"
                                    onChange={(e) => {
                                        if (e.target.files) {
                                            handleFileUpload(Array.from(e.target.files));
                                        }
                                    }}
                                />
                                <Camera className="w-10 h-10 text-gray-400 mb-3" />
                                <p className="text-gray-600 font-medium">Bilder hochladen</p>
                                <p className="text-xs text-gray-500 mt-1">Klicken Sie hier oder ziehen Sie Dateien hierher</p>
                            </div>

                            {/* Uploaded Files Preview */}
                            {uploadedFiles.length > 0 && (
                                <div className="mt-4 grid grid-cols-3 gap-4">
                                    {uploadedFiles.map((file, index) => (
                                        <div key={index} className="relative group">
                                            {file.type.startsWith('image/') ? (
                                                <div className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                                                    <img
                                                        src={URL.createObjectURL(file)}
                                                        alt={file.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRemoveFile(index);
                                                        }}
                                                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="relative aspect-square rounded-lg border border-gray-200 bg-gray-50 flex flex-col items-center justify-center p-2">
                                                    <FileText className="w-8 h-8 text-gray-400 mb-1" />
                                                    <p className="text-xs text-gray-600 text-center truncate w-full">
                                                        {file.name}
                                                    </p>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRemoveFile(index);
                                                        }}
                                                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Notiz Section */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Notiz</h3>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Anmerkungen..."
                                className="w-full min-h-[120px] p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                            />
                        </div>

                        {/* Complete Button */}
                        <Button
                            className="w-fit bg-emerald-600 hover:bg-emerald-700 text-white py-4 text-sm cursor-pointer flex items-center justify-center gap-2"
                        >
                            <CheckCircle2 className="w-5 h-5" />
                            Schritt abschließen & weiterleiten
                            <ArrowRight className="w-5 h-5" />
                        </Button>
                    </div>
                </div>

                {/* Right Side - Sidebar */}
                <div className="w-96 space-y-6">
                    {/* Fertigungsweisung */}
                    <div className="bg-white rounded-lg border border-green-200 p-6">
                        <div className="flex items-center justify-between border-b pb-4 mb-4">
                            <div className="flex items-center gap-2 ">
                                <div className="w-6 h-6 bg-emerald-600 rounded flex items-center justify-center">
                                    <FileText className="w-4 h-4 text-white" />
                                </div>
                                <h3 className="text-sm font-semibold text-gray-900">Fertigungsweisung</h3>
                            </div>
                            <button className="flex cursor-pointer  gap-1 text-xs text-gray-600 hover:text-gray-900">
                                <FileText className="w-4 h-4" />
                                PDF
                            </button>
                        </div>
                        <div className="space-y-3 text-xs">
                            <div>
                                <div className="font-semibold  text-gray-600 mb-1">LEISTEN:</div>
                                <div className="text-gray-700">{orderData.fertigungsweisung.leisten}</div>
                            </div>
                            <div>
                                <div className="font-semibold text-gray-600 mb-1">BETTUNG:</div>
                                <div className="text-gray-700">{orderData.fertigungsweisung.bettung}</div>
                            </div>
                            <div>
                                <div className="font-semibold text-gray-600 mb-1">SCHAFT:</div>
                                <div className="text-gray-700">{orderData.fertigungsweisung.schaft}</div>
                            </div>
                            <div>
                                <div className="font-semibold text-gray-600 mb-1">BODEN:</div>
                                <div className="text-gray-700">{orderData.fertigungsweisung.boden}</div>
                            </div>
                            <div>
                                <div className="font-semibold text-gray-600 mb-1">SONDERANPASSUNGEN:</div>
                                <div className="text-gray-700">{orderData.fertigungsweisung.sonderanpassungen}</div>
                            </div>
                            <div>
                                <div className="font-semibold text-gray-600 mb-1">HALBPROBE:</div>
                                <div className="text-gray-700">{orderData.fertigungsweisung.halbprobe}</div>
                            </div>
                            <div>
                                <button className="w-full p-2 bg-gray-100 hover:bg-gray-200 rounded text-left text-sm text-gray-700 transition-colors">
                                    {orderData.fertigungsweisung.checkliste}
                                </button>
                            </div>
                            <div>
                                <div className="font-semibold text-gray-600 mb-1">ANMERKUNGEN:</div>
                                <div className="text-gray-700">{orderData.fertigungsweisung.anmerkungen}</div>
                            </div>
                        </div>
                    </div>

                    {/* ZEITVERLAUF */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h3 className="text-sm font-semibold text-gray-500 mb-4">ZEITVERLAUF</h3>
                        <div className="space-y-2">
                            {orderData.zeitverlauf
                                .filter((item) => item.completed || item.isCurrent) // Only show completed and current steps
                                .map((item, index) => {
                                    const stepIndex = (item as any).stepIndex ?? orderData.zeitverlauf.findIndex(v => v.step === item.step);
                                    return (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between"
                                        >
                                            {/* Step Name - Left aligned */}
                                            <span className={`text-sm font-medium ${
                                                item.isCurrent ? 'text-emerald-700 font-semibold' : 'text-gray-700'
                                            }`}>
                                                {STEP_SHORT_NAMES[stepIndex] || item.step}
                                            </span>
                                            
                                            {/* Duration and Icon - Right aligned */}
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-semibold text-gray-900">
                                                    {item.duration}
                                                </span>
                                                
                                                {/* Icon - Immediately right of duration */}
                                                {item.completed ? (
                                                    <div className="w-5 h-5 bg-emerald-600 rounded-full flex items-center justify-center shrink-0">
                                                        <Check className="w-3 h-3 text-white" strokeWidth={3} />
                                                    </div>
                                                ) : item.isCurrent ? (
                                                    <div className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center shrink-0">
                                                        <Clock className="w-3 h-3 text-gray-600" />
                                                    </div>
                                                ) : null}
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
