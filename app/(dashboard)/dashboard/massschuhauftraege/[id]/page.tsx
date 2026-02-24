'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { Check, Camera, CheckCircle2, ArrowRight, Clock, FileText, X } from 'lucide-react';
import { BsDash } from 'react-icons/bs';
import { Button } from '@/components/ui/button';
import { SHOE_STEPS, ProgressData } from '@/app/(dashboard)/dashboard/_components/Massschuhauftraeges/NewMasschuhau/MasschuProgressTable';
import FertigungsweisungSidebar from '@/app/(dashboard)/dashboard/_components/Massschuhauftraeges/NewMasschuhau/FertigungsweisungSidebar';
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

// activeStepIndex = which step is shown as current on this page (from URL status)
function mapApiOrderToDetailData(apiOrder: any, activeStepIndex: number): OrderDetailData | null {
    if (!apiOrder?.id) return null;
    const steps = apiOrder.shoeOrderStep ?? [];
    const lastStep = steps[steps.length - 1];
    const days = lastStep ? Math.floor((Date.now() - new Date(lastStep.createdAt).getTime()) / (24 * 60 * 60 * 1000)) : 0;
    const currentStepDisplay = SHOE_STEPS[activeStepIndex] ?? (apiOrder.status ? apiOrder.status.replace(/_/g, ' ') : '-');
    const nextAction = activeStepIndex < SHOE_STEPS.length - 1 ? SHOE_STEPS[activeStepIndex + 1] : 'Abgeschlossen';

    const zeitverlauf = SHOE_STEPS.map((step, index) => {
        const isCompleted = index < activeStepIndex;
        const isCurrent = index === activeStepIndex;
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
        currentStepIndex: activeStepIndex,
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

// Resolve status from URL to step index (0-9). Status can be "Auftragserstellung" or "Halbprobe_durchführen" etc.
function getActiveStepIndexFromStatus(statusParam: string | null): number {
    if (!statusParam) return 0;
    const normalized = statusParam.replace(/_/g, ' ');
    const idx = SHOE_STEPS.findIndex((s) => s === normalized);
    return idx >= 0 ? idx : 0;
}

export default function MassschuhauftraegePage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const id = params?.id as string;
    const statusFromUrl = searchParams?.get('status') || 'Auftragserstellung';
    const activeStepIndex = getActiveStepIndexFromStatus(statusFromUrl);

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
        getMassschuheOrderById(id, statusFromUrl)
            .then((res: any) => {
                if (res?.success === false && typeof res?.message === 'string' && res.message.toLowerCase().includes('no step')) {
                    router.replace(`/dashboard/massschuhauftraege/${id}?status=Auftragserstellung`);
                    return;
                }
                const data = res?.data ?? res;
                setOrderData(mapApiOrderToDetailData(data, activeStepIndex));
                setLoading(false);
            })
            .catch(() => {
                setOrderData(null);
                setLoading(false);
            });
    }, [id, statusFromUrl, activeStepIndex, router]);

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

    const currentStepForProgress = orderData ? orderData.currentStepIndex : activeStepIndex;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Progress Bar - active step from URL status when no order data */}
            <div className="bg-white border border-gray-200 px-4 py-4">
                <div className="overflow-x-auto">
                    <ProgressIndicator currentStepIndex={currentStepForProgress} />
                </div>
            </div>

            {/* Main Content */}
            <div className="flex gap-6 mt-5">
                <div className="flex-1">
                    <div className="bg-white rounded-lg border border-red-200 p-6">
                        {loading ? (
                            <div className="py-16 flex items-center justify-center">
                                <p className="text-gray-500">Laden...</p>
                            </div>
                        ) : (
                            <>
                        {/* Header: step number from URL when no order, else from order */}
                        <div className="mb-6 flex items-center gap-3">
                            <div className="relative shrink-0">
                                <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center ">
                                    <span className="text-white text-base font-bold">
                                        {(orderData?.currentStepIndex ?? activeStepIndex) + 1}
                                    </span>
                                </div>
                            </div>
                            <div className="flex-1">
                                <h2 className="text-xl font-bold text-gray-900 mb-1">
                                    {orderData?.currentStep ?? SHOE_STEPS[activeStepIndex]}
                                </h2>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm text-gray-400">
                                        Verantwortlich: <span className="text-gray-400">{orderData?.responsible ?? '–'}</span>
                                    </span>
                                    {orderData?.isOverdue && (
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
                            </>
                        )}
                    </div>
                </div>

                {/* Right Side - Sidebar */}
                <FertigungsweisungSidebar orderId={id} />
            </div>
        </div>
    );
}
