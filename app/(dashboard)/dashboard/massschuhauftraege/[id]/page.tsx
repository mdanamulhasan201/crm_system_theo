'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { Check, Camera, CheckCircle2, ArrowRight, Clock, FileText, X, Loader2 } from 'lucide-react';
import { BsDash } from 'react-icons/bs';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { SHOE_STEPS, ProgressData } from '@/app/(dashboard)/dashboard/_components/Massschuhauftraeges/NewMasschuhau/MasschuProgressTable';
import FertigungsweisungSidebar from '@/app/(dashboard)/dashboard/_components/Massschuhauftraeges/NewMasschuhau/FertigungsweisungSidebar';
import LeistenerstellungStepFields, { type LeistenfertigungValue } from '@/app/(dashboard)/dashboard/_components/Massschuhauftraeges/NewMasschuhau/LeistenerstellungStepFields';
import BettungserstellungStepFields from '@/app/(dashboard)/dashboard/_components/Massschuhauftraeges/NewMasschuhau/BettungserstellungStepFields';
import HalbprobenerstellungStepFields, { type HalbprobeDurchfuehrungValue } from '@/app/(dashboard)/dashboard/_components/Massschuhauftraeges/NewMasschuhau/HalbprobenerstellungStepFields';
import * as MassschuheAddedApis from '@/apis/MassschuheAddedApis';

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
    stepsCompleted?: boolean[];
    stepsAutoPrint?: boolean[];
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

// Same as MasschuProgressTable: auto_print = gray tick, manual = green tick.
function ProgressIndicator({
    currentStepIndex,
    stepsCompleted,
    stepsAutoPrint,
}: {
    currentStepIndex: number;
    stepsCompleted?: boolean[];
    stepsAutoPrint?: boolean[];
}) {
    return (
        <div className="flex items-end">
            {SHOE_STEPS.map((step, index) => {
                const isCompleted = stepsCompleted
                    ? stepsCompleted[index] === true
                    : index < currentStepIndex;
                const isAutoPrint = isCompleted && (stepsAutoPrint?.[index] === true);
                const isCurrent = index === currentStepIndex;

                return (
                    <React.Fragment key={index}>
                        {index > 0 && (
                            <span
                                className={`font-semibold mx-5 shrink-0 leading-none select-none mb-3 ${
                                    isCompleted || isCurrent ? 'text-emerald-400' : 'text-gray-300'
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
                                        ? 'bg-emerald-100'
                                        : isCurrent
                                            ? 'bg-emerald-600 text-white'
                                            : 'bg-gray-100 text-gray-400'
                                    }
                                `}
                            >
                                {isCompleted ? (
                                    <Check
                                        className={`w-4 h-4 ${isAutoPrint ? 'text-gray-400' : 'text-emerald-500'}`}
                                        strokeWidth={2.5}
                                    />
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

// Map API response (with data + shoeOrderStep) to OrderDetailData. Progress comes from shoeOrderStep.
function mapApiOrderToDetailData(apiResponse: any): OrderDetailData | null {
    const order = apiResponse?.data ?? apiResponse;
    const shoeOrderStep = apiResponse?.shoeOrderStep ?? order?.shoeOrderStep;
    const orderId = order?.id ?? order?.orderId;
    if (!orderId) return null;

    const { currentStepIndex, stepsCompleted, stepsAutoPrint } = getProgressFromShoeOrderSteps(shoeOrderStep);
    const steps = shoeOrderStep ?? [];
    const lastStep = steps[steps.length - 1];
    const days = lastStep?.createdAt
        ? Math.floor((Date.now() - new Date(lastStep.createdAt).getTime()) / (24 * 60 * 60 * 1000))
        : 0;
    const currentStepDisplay = SHOE_STEPS[currentStepIndex] ?? (order.status ? order.status.replace(/_/g, ' ') : '-');
    const nextAction = currentStepIndex < SHOE_STEPS.length - 1 ? SHOE_STEPS[currentStepIndex + 1] : 'Abgeschlossen';

    const zeitverlauf = SHOE_STEPS.map((step, index) => {
        const isCompleted = stepsCompleted[index] === true;
        const isCurrent = index === currentStepIndex;
        const stepEntry = steps.find((s: any) => {
            const n = (s.status || '').trim().replace(/_/g, ' ');
            return SHOE_STEPS[index] === n;
        });
        const duration = stepEntry?.createdAt
            ? `${Math.max(0, Math.floor((Date.now() - new Date(stepEntry.createdAt).getTime()) / (24 * 60 * 60 * 1000)))}d`
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
        id: orderId,
        auftrag: {
            name: [order.customer?.vorname, order.customer?.nachname].filter(Boolean).join(' ') || '-',
            orderNumber: `#${order.orderNumber ?? ''}`,
            product: 'Massschuhe',
            isUrgent: order.priority === 'Dringend' || order.priority === 'Urgent',
        },
        currentStep: currentStepDisplay,
        location: order.branch_location?.title || order.branch_location?.description || '-',
        createDate: order.createdAt ? new Date(order.createdAt).toLocaleDateString('de-DE') : '-',
        days,
        isOverdue: days > 14,
        currentStepIndex,
        stepsCompleted,
        stepsAutoPrint,
        nextAction,
        responsible: order.payment_status || undefined,
        notes: order.notes ?? '',
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

// Derive current step index, per-step completed, and auto_print from shoeOrderStep (same logic as MasschuProgressTable).
function getProgressFromShoeOrderSteps(shoeOrderStep: Array<{ status: string; isCompleted?: boolean; auto_print?: boolean }> | null | undefined): {
    currentStepIndex: number;
    stepsCompleted: boolean[];
    stepsAutoPrint: boolean[];
} {
    const steps = shoeOrderStep ?? [];
    const stepsCompleted = new Array(SHOE_STEPS.length).fill(false);
    const stepsAutoPrint = new Array(SHOE_STEPS.length).fill(false);
    for (const s of steps) {
        const normalized = (s.status || '').trim().replace(/_/g, ' ');
        const idx = SHOE_STEPS.findIndex((step) => step === normalized);
        if (idx >= 0) {
            const done = s.isCompleted === true || s.auto_print === true;
            stepsCompleted[idx] = done;
            stepsAutoPrint[idx] = s.auto_print === true;
        }
    }
    let currentStepIndex = SHOE_STEPS.length;
    for (let i = 0; i < SHOE_STEPS.length; i++) {
        if (!stepsCompleted[i]) {
            currentStepIndex = i;
            break;
        }
    }
    return { currentStepIndex, stepsCompleted, stepsAutoPrint };
}

export default function MassschuhauftraegePage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const id = params?.id as string;
    const statusFromUrl = searchParams?.get('status') || 'Auftragserstellung';
    const activeStepIndex = getActiveStepIndexFromStatus(statusFromUrl);

    const [orderData, setOrderData] = useState<OrderDetailData | null>(null);
    const [shoeOrderStep, setShoeOrderStep] = useState<Array<{ status: string; isCompleted?: boolean; auto_print?: boolean }> | null>(null);
    const [loading, setLoading] = useState(true);
    const [notes, setNotes] = useState('');
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [material, setMaterial] = useState('');
    const [leistentyp, setLeistentyp] = useState('');
    const [leistenfertigung, setLeistenfertigung] = useState<LeistenfertigungValue>('');
    const [thickness, setThickness] = useState('');
    const [preparation_date, setPreparation_date] = useState('');
    const [anmerkungen_halbprobe, setAnmerkungen_halbprobe] = useState('');
    const [halbprobe_durchfuehrung, setHalbprobe_durchfuehrung] = useState<HalbprobeDurchfuehrungValue>('');
    const [checkliste_halbprobe, setCheckliste_halbprobe] = useState('');

    useEffect(() => {
        if (!id) {
            setLoading(false);
            setShoeOrderStep(null);
            return;
        }
        setLoading(true);
        MassschuheAddedApis.getMassschuheOrderById(id, statusFromUrl)
            .then((res: any) => {
                if (res?.success === false && typeof res?.message === 'string' && res.message.toLowerCase().includes('no step')) {
                    router.replace(`/dashboard/massschuhauftraege/${id}?status=Auftragserstellung`);
                    return;
                }
                const steps = res?.shoeOrderStep ?? null;
                setShoeOrderStep(Array.isArray(steps) ? steps : null);
                setOrderData(mapApiOrderToDetailData(res));
                const data = res?.data;
                if (data) {
                    if (data.material != null && data.material !== '') setMaterial(String(data.material));
                    if (data.leistentyp != null && data.leistentyp !== '') setLeistentyp(String(data.leistentyp));
                    const lf = data.leistenfertigung;
                    if (lf === 'Extern' || lf === 'Über F1rst') setLeistenfertigung(lf);
                    if (data.thickness != null && data.thickness !== '') setThickness(String(data.thickness));
                    if (data.preparation_date) setPreparation_date(String(data.preparation_date).slice(0, 10));
                    if (data.anmerkungen_halbprobe != null && data.anmerkungen_halbprobe !== '') setAnmerkungen_halbprobe(String(data.anmerkungen_halbprobe));
                    if (data.checkliste_halbprobe != null && data.checkliste_halbprobe !== '') setCheckliste_halbprobe(String(data.checkliste_halbprobe));
                    const hd = data.halbprobe_durchfuehrung;
                    if (hd === 'Intern fertigen' || hd === 'Extern fertigen' || hd === 'Überspringen') setHalbprobe_durchfuehrung(hd);
                }
                setLoading(false);
            })
            .catch(() => {
                setOrderData(null);
                setShoeOrderStep(null);
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

    const handleCompleteStep = async () => {
        if (!id) return;
        setConfirmOpen(false);
        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('notes', notes);
            uploadedFiles.forEach((file) => {
                formData.append('files', file);
            });
            formData.append('material', material);
            formData.append('leistentyp', leistentyp);
            formData.append('leistenfertigung', leistenfertigung);
            formData.append('thickness', thickness);
            formData.append('preparation_date', preparation_date);
            formData.append('checkliste_halbprobe', checkliste_halbprobe);
            formData.append('anmerkungen_halbprobe', anmerkungen_halbprobe);
            formData.append('halbprobe_durchfuehrung', halbprobe_durchfuehrung);
            const success = await MassschuheAddedApis.updateMassschuheOrderStatus(id, statusFromUrl, formData);
            if (success) {
                router.push('/dashboard/massschuhauftraege');
            }
        } catch (err: any) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    const progressFromSteps = shoeOrderStep ? getProgressFromShoeOrderSteps(shoeOrderStep) : null;
    const currentStepForProgress = orderData
        ? orderData.currentStepIndex
        : progressFromSteps
            ? progressFromSteps.currentStepIndex
            : activeStepIndex;
    const stepsCompletedForProgress = orderData?.stepsCompleted ?? progressFromSteps?.stepsCompleted;
    const stepsAutoPrintForProgress = orderData?.stepsAutoPrint ?? progressFromSteps?.stepsAutoPrint;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Progress Bar - from shoeOrderStep when order loaded, else from URL (auto_print = gray tick, manual = green) */}
            <div className="bg-white border border-gray-200 px-4 py-4">
                <div className="overflow-x-auto">
                    <ProgressIndicator
                        currentStepIndex={currentStepForProgress}
                        stepsCompleted={stepsCompletedForProgress}
                        stepsAutoPrint={stepsAutoPrintForProgress}
                    />
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

                        {/* Instruction Text – Step 3 (Bettungserstellung): only first line; other steps: full text */}
                        <div className="mb-6 p-3 bg-gray-50 rounded-lg ">
                            <p className="text-sm text-gray-500">
                                {(orderData?.currentStepIndex ?? activeStepIndex) === 2
                                    ? 'Dieser Schritt wartet auf Bearbeitung.'
                                    : 'Dieser Schritt wartet auf Bearbeitung. Laden Sie relevante Bilder hoch und fügen Sie Notizen hinzu.'}
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
                          {/* Step 2: Leistenerstellung – Material & Leistentyp (only when this step) */}
                          {(orderData?.currentStepIndex ?? activeStepIndex) === 1 && (
                            <LeistenerstellungStepFields
                                material={material}
                                leistentyp={leistentyp}
                                leistenfertigung={leistenfertigung}
                                onMaterialChange={setMaterial}
                                onLeistentypChange={setLeistentyp}
                                onLeistenfertigungChange={setLeistenfertigung}
                            />
                        )}

                        {/* Step 3: Bettungserstellung – Material & Dicke (only when this step) */}
                        {(orderData?.currentStepIndex ?? activeStepIndex) === 2 && (
                            <BettungserstellungStepFields
                                material={material}
                                thickness={thickness}
                                onMaterialChange={setMaterial}
                                onThicknessChange={setThickness}
                            />
                        )}

                        {/* Step 4: Halbprobenerstellung – Vorbereitungsdatum, Anmerkungen, Halbprobe Durchführung, Checkliste */}
                        {(orderData?.currentStepIndex ?? activeStepIndex) === 3 && (
                            <HalbprobenerstellungStepFields
                                preparation_date={preparation_date}
                                anmerkungen_halbprobe={anmerkungen_halbprobe}
                                halbprobe_durchfuehrung={halbprobe_durchfuehrung}
                                checkliste_halbprobe={checkliste_halbprobe}
                                onPreparationDateChange={setPreparation_date}
                                onAnmerkungenHalbprobeChange={setAnmerkungen_halbprobe}
                                onHalbprobeDurchfuehrungChange={setHalbprobe_durchfuehrung}
                                onChecklisteHalbprobeChange={setCheckliste_halbprobe}
                            />
                        )}

                        {/* Complete Button */}
                        <Button
                            type="button"
                            disabled={submitting}
                            onClick={() => setConfirmOpen(true)}
                            className="w-fit bg-emerald-600 hover:bg-emerald-700 text-white py-4 text-sm cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                            {submitting ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <CheckCircle2 className="w-5 h-5" />
                            )}
                            Schritt abschließen & weiterleiten
                            <ArrowRight className="w-5 h-5" />
                        </Button>

                        {/* Confirm Modal */}
                        <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Schritt abschließen</DialogTitle>
                                    <DialogDescription>
                                        Möchten Sie diesen Schritt wirklich abschließen und weiterleiten? Die Änderung wird gespeichert.
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter className="flex gap-2 sm:gap-0">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setConfirmOpen(false)}
                                        disabled={submitting}
                                    >
                                        Abbrechen
                                    </Button>
                                    <Button
                                        type="button"
                                        className="bg-emerald-600 hover:bg-emerald-700"
                                        onClick={handleCompleteStep}
                                        disabled={submitting}
                                    >
                                        {submitting ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            'Bestätigen'
                                        )}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
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
