'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { Check, Camera, CheckCircle2, ArrowRight, Clock, FileText, X, Loader2, ArrowLeft } from 'lucide-react';
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
import BettungserstellungStepFields, {
    defaultBettungStep3InputData,
    type BettungStep3InputData,
} from '@/app/(dashboard)/dashboard/_components/Massschuhauftraeges/NewMasschuhau/BettungserstellungStepFields';
import HalbprobenerstellungStepFields, { type HalbprobeDurchfuehrungValue } from '@/app/(dashboard)/dashboard/_components/Massschuhauftraeges/NewMasschuhau/HalbprobenerstellungStepFields';
import HalbprobeDurchfuehrungStepFields, { type ProbenergebnisValue, type SchafttypValue } from '@/app/(dashboard)/dashboard/_components/Massschuhauftraeges/NewMasschuhau/HalbprobeDurchfuehrungStepFields';
import * as MassschuheAddedApis from '@/apis/MassschuheAddedApis';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';

// Short names for progress indicator (matching the image design)
const STEP_SHORT_NAMES = [
    'Scan',           // Auftragserstellung
    'Leisten',        // Leistenerstellung
    'Bettung',        // Bettungserstellung
    'Halbprobenerstellung',      // Halbprobenerstellung
    'Halbprobe durchführen',         // Halbprobe durchführen
    'Schaft fertigen.',   // Schaft fertigen
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

// Convert step index to URL status param (e.g. "Halbprobe durchführen" -> "Halbprobe_durchführen")
function getStatusParamFromStepIndex(index: number): string {
    const step = SHOE_STEPS[index];
    return step ? step.replace(/\s+/g, '_') : 'Auftragserstellung';
}

// Same as MasschuProgressTable: auto_print = gray tick, manual = green tick. Steps are clickable to view that step's data.
function ProgressIndicator({
    currentStepIndex,
    stepsCompleted,
    stepsAutoPrint,
    onStepClick,
    orderId,
}: {
    currentStepIndex: number;
    stepsCompleted?: boolean[];
    stepsAutoPrint?: boolean[];
    onStepClick?: (index: number) => void;
    orderId?: string;
}) {
    return (
        <div className="flex items-end">
            {SHOE_STEPS.map((step, index) => {
                const isCompleted = stepsCompleted
                    ? stepsCompleted[index] === true
                    : index < currentStepIndex;
                const isAutoPrint = isCompleted && (stepsAutoPrint?.[index] === true);
                const isCurrent = index === currentStepIndex;
                // All steps clickable so user can view any step; current = the one selected (from URL)
                const isClickable = !!orderId && !!onStepClick;

                return (
                    <React.Fragment key={index}>
                        {index > 0 && (
                            <span
                                className={`font-semibold mx-5 shrink-0 leading-none select-none mb-3 ${isCompleted || isCurrent ? 'text-emerald-400' : 'text-gray-300'
                                    }`}
                            >
                                <BsDash className='text-4xl' />
                            </span>
                        )}
                        <div className="flex flex-col items-center shrink-0 py-2 px-2">
                            <button
                                type="button"
                                title={isClickable ? step : undefined}
                                onClick={() => isClickable && onStepClick(index)}
                                disabled={!isClickable}
                                className={`
                                    flex flex-col items-center shrink-0 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2
                                    ${isClickable ? 'cursor-pointer hover:opacity-90' : 'cursor-default'}
                                `}
                            >
                                <div
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
                                        ${isCurrent ? 'ring-2 ring-emerald-600 ring-offset-2' : ''}
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
                                <span className={`text-xs font-medium text-center leading-tight ${isCurrent ? 'text-emerald-700 font-semibold' : 'text-gray-600'
                                    }`}>
                                    {STEP_SHORT_NAMES[index] || step}
                                </span>
                            </button>
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

function mapStep3InputsFromApi(data: any): BettungStep3InputData {
    const step3 = data?.step3_json?.step3 ?? {};
    const raw = (key: string) => step3[key];
    const str = (key: string) => {
        const v = raw(key);
        if (v === true) return 'true';
        if (v === false) return 'false';
        return v != null ? String(v) : '';
    };

    return {
        notes: str('notes'),
        bettung_type: str('bettung_type'),
        zusaetzliche_notizen: str('zusätzliche_notizen'),
        material: str('material'),
        pelotte: str('pelotte'),
        versteifung: str('versteifung'),
        pelotte_hoehe_l: str('pelotte_hoehe_l'),
        pelotte_hoehe_r: str('pelotte_hoehe_r'),
        schicht1_starke: str('schicht1_starke'),
        schicht2_starke: str('schicht2_starke'),
        decksohle_starke: str('decksohle_starke'),
        versteifung_zone: str('versteifung_zone'),
        schicht1_material: str('schicht1_material'),
        schicht2_material: str('schicht2_material'),
        decksohle_material: str('decksohle_material'),
        versteifung_material: str('versteifung_material'),
    };
}

export default function MassschuhauftraegePage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user } = useAuth();
    const id = params?.id as string;
    const statusFromUrl = searchParams?.get('status') || 'Auftragserstellung';
    const activeStepIndex = getActiveStepIndexFromStatus(statusFromUrl);
    // Display name from auth: prefer employee/business name so we don't show generic "partner"
    const employeeDisplayName =
        user?.employeeName || user?.busnessName || user?.partner?.name || user?.name || 'Mitarbeiter';

    const [orderData, setOrderData] = useState<OrderDetailData | null>(null);
    const [shoeOrderStep, setShoeOrderStep] = useState<Array<{ status: string; isCompleted?: boolean; auto_print?: boolean }> | null>(null);
    const [loading, setLoading] = useState(true);
    const [notes, setNotes] = useState('');
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [stepFilesFromApi, setStepFilesFromApi] = useState<Array<{ id: string; fileName: string; fileUrl: string; fileType?: string }>>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [material, setMaterial] = useState('');
    const [leistentyp, setLeistentyp] = useState('');
    const [leistenfertigung, setLeistenfertigung] = useState<LeistenfertigungValue>('');
    const [thickness, setThickness] = useState('');
    const [bettungStep3Data, setBettungStep3Data] = useState<BettungStep3InputData>(defaultBettungStep3InputData());
    const [preparation_date, setPreparation_date] = useState('');
    const [anmerkungen_halbprobe, setAnmerkungen_halbprobe] = useState('');
    const [halbprobe_durchfuehrung, setHalbprobe_durchfuehrung] = useState<HalbprobeDurchfuehrungValue>('');
    const [checkliste_halbprobe, setCheckliste_halbprobe] = useState('');
    const [probenergebnis, setProbenergebnis] = useState<ProbenergebnisValue>('');
    const [schafttyp, setSchafttyp] = useState<SchafttypValue>('');
    const [fitting_date, setFitting_date] = useState('');
    const [adjustments, setAdjustments] = useState('');
    const [adjustmentsGrosseNacharbeit, setAdjustmentsGrosseNacharbeit] = useState('');
    const [schafttypInternNote, setSchafttypInternNote] = useState('');
    const [schafttypExternNote, setSchafttypExternNote] = useState('');
    const [bodenkonstruktionInternNote, setBodenkonstruktionInternNote] = useState('');
    const [bodenkonstruktionExternNote, setBodenkonstruktionExternNote] = useState('');
    const [deleteFileConfirmId, setDeleteFileConfirmId] = useState<string | null>(null);
    const [deletingFileId, setDeletingFileId] = useState<string | null>(null);
    // Completed-by from API for current step (partner or employee who completed this step)
    const [stepCompletedByPartner, setStepCompletedByPartner] = useState<{ name?: string; busnessName?: string } | null>(null);
    const [stepCompletedByEmployee, setStepCompletedByEmployee] = useState<{ employeeName?: string; accountName?: string } | null>(null);
    useEffect(() => {
        if (!id) {
            setLoading(false);
            setShoeOrderStep(null);
            return;
        }
        setLoading(true);
        MassschuheAddedApis.getMassschuheOrderById(id, statusFromUrl)
            .then((res: any) => {
                const noStepForStatus = typeof res?.message === 'string' && res.message.toLowerCase().includes('no step');
                if (res?.success === false && noStepForStatus) {
                    router.replace(`/dashboard/massschuhauftraege/${id}?status=Auftragserstellung`);
                    return;
                }
                const steps = res?.shoeOrderStep ?? null;
                setShoeOrderStep(Array.isArray(steps) ? steps : null);
                setOrderData(mapApiOrderToDetailData(res));
                const data = res?.data;
                if (data) {
                    setStepCompletedByPartner(data.partner ?? null);
                    setStepCompletedByEmployee(data.employee ?? null);
                    setNotes(data.notes != null ? String(data.notes) : '');
                    if (data.material != null && data.material !== '') setMaterial(String(data.material));
                    if (data.leistentyp != null && data.leistentyp !== '') setLeistentyp(String(data.leistentyp));
                    const lf = data.leistenfertigung;
                    if (lf === 'Extern' || lf === 'Über F1rst') setLeistenfertigung(lf);
                    if (data.thickness != null && data.thickness !== '') setThickness(String(data.thickness));
                    setBettungStep3Data(mapStep3InputsFromApi(data));
                    if (data.preparation_date) setPreparation_date(String(data.preparation_date).slice(0, 10));
                    if (data.anmerkungen_halbprobe != null && data.anmerkungen_halbprobe !== '') setAnmerkungen_halbprobe(String(data.anmerkungen_halbprobe));
                    if (data.checkliste_halbprobe != null) {
                        const ch = data.checkliste_halbprobe;
                        setCheckliste_halbprobe(Array.isArray(ch) ? JSON.stringify(ch) : String(ch));
                    } else if (data.Kleine_Nacharbeit != null) {
                        const kn = data.Kleine_Nacharbeit;
                        setCheckliste_halbprobe(Array.isArray(kn) ? JSON.stringify(kn) : String(kn));
                    } else {
                        setCheckliste_halbprobe('');
                    }
                    const hd = data.halbprobe_durchfuehrung;
                    const halfRequired = data.order?.half_sample_required;
                    if (hd === 'Intern fertigen' || hd === 'Extern fertigen' || hd === 'Überspringen') {
                        setHalbprobe_durchfuehrung(hd);
                    } else if (halfRequired === false) {
                        setHalbprobe_durchfuehrung('Überspringen');
                    }
                    if (data.probenergebnis === 'Gut' || data.probenergebnis === 'Druckstellen' || data.probenergebnis === 'Instabil' || data.probenergebnis === 'Kosmetisch') setProbenergebnis(data.probenergebnis);
                    else if (data.probenergebnis === 'Änderungen') setProbenergebnis('Druckstellen');
                    if (data.schafttyp === 'Intern' || data.schafttyp === 'Extern') setSchafttyp(data.schafttyp);
                    if (data.fitting_date) setFitting_date(String(data.fitting_date).slice(0, 10));
                    if (data.adjustments != null) {
                        if (data.probenergebnis === 'Gut') setAdjustments(String(data.adjustments));
                        else if (data.probenergebnis === 'Instabil') setAdjustmentsGrosseNacharbeit(String(data.adjustments));
                        else setAdjustments(String(data.adjustments));
                    }
                    if (data.customer_reviews != null) {
                        if (data.schafttyp === 'Intern') setSchafttypInternNote(String(data.customer_reviews));
                        else if (data.schafttyp === 'Extern') setSchafttypExternNote(String(data.customer_reviews));
                        else setSchafttypInternNote(String(data.customer_reviews));
                    }
                    if (data.schafttyp_intem_note != null) setSchafttypInternNote(String(data.schafttyp_intem_note));
                    if (data.schafttyp_extem_note != null) setSchafttypExternNote(String(data.schafttyp_extem_note));
                    if (data.bodenkonstruktion_intem_note != null) setBodenkonstruktionInternNote(String(data.bodenkonstruktion_intem_note));
                    if (data.bodenkonstruktion_extem_note != null) setBodenkonstruktionExternNote(String(data.bodenkonstruktion_extem_note));
                    if (data.feedback_status != null) {
                        const toProbenergebnis: Record<string, ProbenergebnisValue> = {
                            'Freigeben': 'Gut',
                            'Kleine_Nacharbeit': 'Druckstellen',
                            'Große_Nacharbeiten': 'Instabil',
                        };
                        const pe = toProbenergebnis[String(data.feedback_status)];
                        if (pe) setProbenergebnis(pe);
                    }
                    setStepFilesFromApi(Array.isArray(data.files) ? data.files.map((f: any) => ({
                        id: f.id || '',
                        fileName: f.fileName || 'Datei',
                        fileUrl: f.fileUrl || '',
                        fileType: f.fileType,
                    })) : []);
                } else {
                    setStepCompletedByPartner(null);
                    setStepCompletedByEmployee(null);
                    setNotes('');
                    setStepFilesFromApi([]);
                    setMaterial('');
                    setLeistentyp('');
                    setLeistenfertigung('');
                    setThickness('');
                    setBettungStep3Data(defaultBettungStep3InputData());
                    setPreparation_date('');
                    setAnmerkungen_halbprobe('');
                    setCheckliste_halbprobe('');
                    setHalbprobe_durchfuehrung('');
                    setProbenergebnis('');
                    setSchafttyp('');
                    setFitting_date('');
                    setAdjustments('');
                    setAdjustmentsGrosseNacharbeit('');
                    setSchafttypInternNote('');
                    setSchafttypExternNote('');
                    setBodenkonstruktionInternNote('');
                    setBodenkonstruktionExternNote('');
                }
                setLoading(false);
            })
            .catch(() => {
                setOrderData(null);
                setShoeOrderStep(null);
                setLoading(false);
            });
    }, [id, statusFromUrl, activeStepIndex, router]);


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

    // When Probenergebnis button changes: clear the other two fields so only active button's data goes in payload
    const handleProbenergebnisChange = (value: ProbenergebnisValue) => {
        setProbenergebnis(value);
        if (value === 'Gut') {
            setCheckliste_halbprobe('');
            setAdjustmentsGrosseNacharbeit('');
        } else if (value === 'Druckstellen') {
            setAdjustments('');
            setAdjustmentsGrosseNacharbeit('');
        } else if (value === 'Instabil') {
            setAdjustments('');
            setCheckliste_halbprobe('');
        }
    };

    const handleSkipStep4And5 = async () => {
        if (!id) return;
        try {
            const res: any = await MassschuheAddedApis.manageMassschuheOrderStep4and5(id, {});
            if (res?.success) {
                toast.success(res?.message || 'Schritte 4 und 5 wurden übersprungen.');
                const refetch: any = await MassschuheAddedApis.getMassschuheOrderById(id, statusFromUrl);
                const steps = refetch?.shoeOrderStep ?? null;
                setShoeOrderStep(Array.isArray(steps) ? steps : null);
                setOrderData(mapApiOrderToDetailData(refetch));
            } else if (res?.message) {
                toast(res.message);
            }
        } catch (error) {
            console.error(error);
            toast.error('Fehler beim Überspringen von Schritt 4 und 5.');
        }
    };

    const handleDeleteStepFile = async (fileId: string) => {
        if (!fileId) return;
        setDeletingFileId(fileId);
        try {
            await MassschuheAddedApis.deleteMassschuheOrderImage(fileId);
            setStepFilesFromApi((prev) => prev.filter((f) => f.id !== fileId));
            setDeleteFileConfirmId(null);
        } catch (err) {
            console.error(err);
        } finally {
            setDeletingFileId(null);
        }
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
            if (statusFromUrl === 'Bettungserstellung') {
                formData.append(
                    'step3_json',
                    JSON.stringify({
                        step3: {
                            notes: bettungStep3Data.notes,
                            bettung_type: bettungStep3Data.bettung_type,
                            zusätzliche_notizen: bettungStep3Data.zusaetzliche_notizen,
                            material: bettungStep3Data.material,
                            thickness: thickness || '',
                            pelotte: bettungStep3Data.pelotte === '' ? null : bettungStep3Data.pelotte === 'true',
                            versteifung: bettungStep3Data.versteifung === '' ? null : bettungStep3Data.versteifung === 'true',
                            pelotte_hoehe_l: bettungStep3Data.pelotte_hoehe_l,
                            pelotte_hoehe_r: bettungStep3Data.pelotte_hoehe_r,
                            schicht1_starke: bettungStep3Data.schicht1_starke,
                            schicht2_starke: bettungStep3Data.schicht2_starke,
                            decksohle_starke: bettungStep3Data.decksohle_starke,
                            versteifung_zone: bettungStep3Data.versteifung_zone,
                            schicht1_material: bettungStep3Data.schicht1_material,
                            schicht2_material: bettungStep3Data.schicht2_material,
                            decksohle_material: bettungStep3Data.decksohle_material,
                            versteifung_material: bettungStep3Data.versteifung_material,
                        },
                    })
                );
            }
            formData.append('preparation_date', preparation_date);
            formData.append('anmerkungen_halbprobe', anmerkungen_halbprobe);
            formData.append('halbprobe_durchfuehrung', halbprobe_durchfuehrung);
            if (statusFromUrl === 'Halbprobe_durchführen') {
                // feedback_status: Freigeben | Kleine_Nacharbeit | Große_Nacharbeiten
                const feedbackStatusMap: Record<string, string> = {
                    'Gut': 'Freigeben',
                    'Druckstellen': 'Kleine_Nacharbeit',
                    'Instabil': 'Große_Nacharbeiten',
                };
                if (probenergebnis && feedbackStatusMap[probenergebnis]) {
                    formData.append('feedback_status', feedbackStatusMap[probenergebnis]);
                }
                // feedback_notes: only plain text notes for Freigeben or Große Nacharbeiten. Never JSON.
                if (probenergebnis === 'Gut') formData.append('feedback_notes', adjustments);
                else if (probenergebnis === 'Instabil') formData.append('feedback_notes', adjustmentsGrosseNacharbeit);
                // Kleine_Nacharbeit: modal checklist data as JSON in payload key Kleine_Nacharbeit
                if (probenergebnis === 'Druckstellen' && checkliste_halbprobe) {
                    formData.append('Kleine_Nacharbeit', checkliste_halbprobe);
                }

                if (fitting_date) formData.append('fitting_date', fitting_date);
                if (schafttyp) formData.append('schafttyp', schafttyp);
                if (schafttypInternNote) formData.append('schafttyp_intem_note', schafttypInternNote);
                if (schafttypExternNote) formData.append('schafttyp_extem_note', schafttypExternNote);
                if (bodenkonstruktionInternNote) formData.append('bodenkonstruktion_intem_note', bodenkonstruktionInternNote);
                if (bodenkonstruktionExternNote) formData.append('bodenkonstruktion_extem_note', bodenkonstruktionExternNote);
            }
            const success = await MassschuheAddedApis.updateMassschuheOrderStatus(id, statusFromUrl, formData);
            if (success) {
                setUploadedFiles([]);
                // Refetch to get updated steps; then auto-activate next step in URL
                const res: any = await MassschuheAddedApis.getMassschuheOrderById(id, statusFromUrl);
                if (res?.success === false && typeof res?.message === 'string' && res.message.toLowerCase().includes('no step')) {
                    // After completing a step, advance to next step if any
                    const nextIndex = activeStepIndex + 1;
                    const nextStatus = nextIndex < SHOE_STEPS.length
                        ? getStatusParamFromStepIndex(nextIndex)
                        : 'Auftragserstellung';
                    router.replace(`/dashboard/massschuhauftraege/${id}?status=${encodeURIComponent(nextStatus)}`);
                    return;
                }
                const steps = res?.shoeOrderStep ?? null;
                setShoeOrderStep(Array.isArray(steps) ? steps : null);
                const updated = mapApiOrderToDetailData(res);
                setOrderData(updated);
                const data = res?.data;
                if (data) {
                    setNotes(data.notes != null ? String(data.notes) : '');
                    if (data.material != null && data.material !== '') setMaterial(String(data.material));
                    if (data.leistentyp != null && data.leistentyp !== '') setLeistentyp(String(data.leistentyp));
                    const lf = data.leistenfertigung;
                    if (lf === 'Extern' || lf === 'Über F1rst') setLeistenfertigung(lf);
                    if (data.thickness != null && data.thickness !== '') setThickness(String(data.thickness));
                    if (data.preparation_date) setPreparation_date(String(data.preparation_date).slice(0, 10));
                    if (data.anmerkungen_halbprobe != null && data.anmerkungen_halbprobe !== '') setAnmerkungen_halbprobe(String(data.anmerkungen_halbprobe));
                    if (data.checkliste_halbprobe != null) {
                        const ch = data.checkliste_halbprobe;
                        setCheckliste_halbprobe(Array.isArray(ch) ? JSON.stringify(ch) : String(ch));
                    } else if (data.Kleine_Nacharbeit != null) {
                        const kn = data.Kleine_Nacharbeit;
                        setCheckliste_halbprobe(Array.isArray(kn) ? JSON.stringify(kn) : String(kn));
                    } else {
                        setCheckliste_halbprobe('');
                    }
                    const hd = data.halbprobe_durchfuehrung;
                    if (hd === 'Intern fertigen' || hd === 'Extern fertigen' || hd === 'Überspringen') setHalbprobe_durchfuehrung(hd);
                    if (data.probenergebnis === 'Gut' || data.probenergebnis === 'Druckstellen' || data.probenergebnis === 'Instabil' || data.probenergebnis === 'Kosmetisch') setProbenergebnis(data.probenergebnis);
                    else if (data.probenergebnis === 'Änderungen') setProbenergebnis('Druckstellen');
                    if (data.schafttyp === 'Intern' || data.schafttyp === 'Extern') setSchafttyp(data.schafttyp);
                    if (data.fitting_date) setFitting_date(String(data.fitting_date).slice(0, 10));
                    if (data.adjustments != null) {
                        if (data.probenergebnis === 'Gut') setAdjustments(String(data.adjustments));
                        else if (data.probenergebnis === 'Instabil') setAdjustmentsGrosseNacharbeit(String(data.adjustments));
                        else setAdjustments(String(data.adjustments));
                    }
                    if (data.customer_reviews != null) {
                        if (data.schafttyp === 'Intern') setSchafttypInternNote(String(data.customer_reviews));
                        else if (data.schafttyp === 'Extern') setSchafttypExternNote(String(data.customer_reviews));
                        else setSchafttypInternNote(String(data.customer_reviews));
                    }
                    if (data.schafttyp_intem_note != null) setSchafttypInternNote(String(data.schafttyp_intem_note));
                    if (data.schafttyp_extem_note != null) setSchafttypExternNote(String(data.schafttyp_extem_note));
                    if (data.bodenkonstruktion_intem_note != null) setBodenkonstruktionInternNote(String(data.bodenkonstruktion_intem_note));
                    if (data.bodenkonstruktion_extem_note != null) setBodenkonstruktionExternNote(String(data.bodenkonstruktion_extem_note));
                    if (data.feedback_status != null) {
                        const toPe: Record<string, ProbenergebnisValue> = {
                            'Freigeben': 'Gut',
                            'Kleine_Nacharbeit': 'Druckstellen',
                            'Große_Nacharbeiten': 'Instabil',
                        };
                        const pe = toPe[String(data.feedback_status)];
                        if (pe) setProbenergebnis(pe);
                    }
                    setStepFilesFromApi(Array.isArray(data.files) ? data.files.map((f: any) => ({
                        id: f.id || '',
                        fileName: f.fileName || 'Datei',
                        fileUrl: f.fileUrl || '',
                        fileType: f.fileType,
                    })) : []);
                } else {
                    setStepFilesFromApi([]);
                    setBettungStep3Data(defaultBettungStep3InputData());
                }
                // Auto-activate next step: navigate so the next step is shown (e.g. Auftragserstellung done → Leistenerstellung active)
                if (updated && updated.currentStepIndex < SHOE_STEPS.length) {
                    const nextStatus = getStatusParamFromStepIndex(updated.currentStepIndex);
                    router.push(`/dashboard/massschuhauftraege/${id}?status=${encodeURIComponent(nextStatus)}`);
                }
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

    // Status indicator: green + "Schritt wurde von Mitarbeiter X abgeschlossen" when step is completed (backend) or at least one image uploaded
    const isCurrentStepCompleted =
        stepsCompletedForProgress?.[activeStepIndex] === true ||
        stepFilesFromApi.length > 0 ||
        uploadedFiles.length > 0;

    // "Completed by" display from API: partner (busnessName/name) or employee (employeeName, accountName)
    const stepCompletedByDisplay = (() => {
        if (stepCompletedByPartner) {
            const bus = (stepCompletedByPartner.busnessName || '').trim();
            const name = (stepCompletedByPartner.name || '').trim();
            if (bus && name && bus !== name) return { primary: bus, secondary: name };
            return { primary: bus || name || '' };
        }
        if (stepCompletedByEmployee) {
            const en = (stepCompletedByEmployee.employeeName || '').trim();
            const ac = (stepCompletedByEmployee.accountName || '').trim();
            if (en && ac) return { primary: en, secondary: ac };
            return { primary: en || ac || 'Mitarbeiter' };
        }
        return { primary: employeeDisplayName };
    })() as { primary: string; secondary?: string };

    return (

        <>
            {/* back button need to be on the top left /dashboard/massschuhauftraege*/}
            <div className="pb-2">
                <Button className='cursor-pointer' variant="outline" size="icon" onClick={() => router.push('/dashboard/massschuhauftraege')}>
                    <ArrowLeft className="w-4 h-4" />
                </Button>
            </div>

            <div className="min-h-screen bg-gray-50">

                {/* Progress Bar – steps clickable to view that step's data; current = active step from URL */}
                <div className="bg-white border border-gray-200 px-4 py-4">
                    <div className="overflow-x-auto">
                        <ProgressIndicator
                            currentStepIndex={activeStepIndex}
                            stepsCompleted={stepsCompletedForProgress}
                            stepsAutoPrint={stepsAutoPrintForProgress}
                            orderId={id}
                            onStepClick={(index) => {
                                const status = getStatusParamFromStepIndex(index);
                                router.push(`/dashboard/massschuhauftraege/${id}?status=${encodeURIComponent(status)}`);
                            }}
                        />
                    </div>
                </div>




                {/* Main Content */}
                <div className="flex flex-col lg:flex-row gap-6 mt-5 w-full">
                    <div className="flex-1 w-full lg:w-8/12">
                        <div className="bg-white rounded-lg border border-red-200 p-6">
                            {loading ? (
                                <div className="p-6 space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse shrink-0" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-6 bg-gray-200 rounded w-48 animate-pulse" />
                                            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
                                        </div>
                                    </div>
                                    <div className="h-14 bg-gray-100 rounded-lg animate-pulse" />
                                    <div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
                                            <div className="h-5 bg-gray-200 rounded w-16 animate-pulse" />
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                            {[1, 2, 3].map((i) => (
                                                <div key={i} className="aspect-square bg-gray-200 rounded-lg animate-pulse" />
                                            ))}
                                        </div>
                                        <div className="mt-4 h-32 border-2 border-dashed border-gray-200 rounded-lg animate-pulse" />
                                    </div>
                                    <div>
                                        <div className="h-5 bg-gray-200 rounded w-12 mb-3 animate-pulse" />
                                        <div className="h-28 bg-gray-100 rounded-lg animate-pulse" />
                                    </div>
                                    <div className="h-11 bg-gray-200 rounded w-56 animate-pulse" />
                                </div>
                            ) : (
                                <>
                                    {/* Header: step number circle (green when completed, red when waiting) + title + status */}
                                    <div className="mb-6 flex items-center gap-3">
                                        <div className="relative shrink-0">
                                            <div
                                                className={`w-10 h-10 rounded-full flex items-center justify-center ${isCurrentStepCompleted ? 'bg-emerald-600' : 'bg-red-600'
                                                    }`}
                                            >
                                                {isCurrentStepCompleted ? (
                                                    <Check className="w-6 h-6 text-white" />
                                                ) : (
                                                    <span className="text-white text-base font-bold">
                                                        {activeStepIndex + 1}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <h2 className="text-xl font-bold text-gray-900 mb-1">
                                                {activeStepIndex === 7 ? 'Qualitätskontrolle/Enddokumentation' : SHOE_STEPS[activeStepIndex]}
                                            </h2>
                                            <div className="flex items-center gap-3 flex-wrap">
                                                {isCurrentStepCompleted ? (
                                                    <span className="text-sm font-medium text-emerald-700">
                                                        Schritt wurde von{' '}
                                                        {stepCompletedByDisplay.secondary != null ? (
                                                            <>
                                                                {stepCompletedByDisplay.primary}
                                                                <span className="ml-1 text-xs font-normal text-emerald-600/90">
                                                                    ({stepCompletedByDisplay.secondary})
                                                                </span>
                                                            </>
                                                        ) : (
                                                            stepCompletedByDisplay.primary
                                                        )}
                                                    </span>
                                                ) : (
                                                    <>
                                                        <span className="text-sm text-gray-400">
                                                            Verantwortlich: <span className="text-gray-400">{orderData?.responsible ?? '–'}</span>
                                                        </span>
                                                        {orderData?.isOverdue && (
                                                            <span className="text-sm text-red-600 font-medium">
                                                                • {orderData.days}d überfällig
                                                            </span>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Instruction: only show "waiting for processing" when not completed; completed message is in header only */}
                                    {!isCurrentStepCompleted && (
                                        <div className="mb-6 p-3 bg-gray-50 rounded-lg ">
                                            <p className="text-sm text-gray-500">
                                                {activeStepIndex === 2
                                                    ? 'Dieser Schritt wartet auf Bearbeitung.'
                                                    : 'Dieser Schritt wartet auf Bearbeitung. Laden Sie relevante Bilder hoch und fügen Sie Notizen hinzu.'}
                                            </p>
                                        </div>
                                    )}



                                    {/* Bilder Section */}
                                    <div className="mb-6">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Camera className="w-5 h-5 text-gray-600" />
                                            <h3 className="text-lg font-semibold text-gray-900">Bilder</h3>
                                        </div>

                                        {/* Existing files for this step (from API) – visible in real time, with delete */}
                                        {stepFilesFromApi.length > 0 && (
                                            <div className="mb-4">
                                                <p className="text-sm font-medium text-gray-700 mb-2">Vorhandene Dateien (dieser Schritt)</p>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                                    {stepFilesFromApi.map((f) => {
                                                        const isImage = (f.fileType || '').startsWith('image/') || /\.(png|jpg|jpeg|gif|webp)$/i.test(f.fileName || '');
                                                        const isDeleting = deletingFileId === f.id;
                                                        return (
                                                            <div
                                                                key={f.id}
                                                                className="relative group rounded-lg border border-gray-200 bg-gray-50 overflow-hidden hover:border-emerald-400 hover:shadow-sm transition-all"
                                                            >
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setDeleteFileConfirmId(f.id);
                                                                    }}
                                                                    disabled={!!deletingFileId}
                                                                    className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-opacity disabled:opacity-50"
                                                                    aria-label="Datei löschen"
                                                                >
                                                                    {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                                                                </button>
                                                                <a
                                                                    href={f.fileUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="block"
                                                                >
                                                                    {isImage ? (
                                                                        <div className="aspect-square relative bg-gray-100">
                                                                            <img
                                                                                src={f.fileUrl}
                                                                                alt={f.fileName || 'Bild'}
                                                                                className="w-full h-full object-cover"
                                                                            />
                                                                        </div>
                                                                    ) : (
                                                                        <div className="aspect-square flex flex-col items-center justify-center p-3">
                                                                            <FileText className="h-8 w-8 text-gray-400 mb-1" />
                                                                            <span className="text-xs text-gray-600 text-center truncate w-full">{f.fileName}</span>
                                                                        </div>
                                                                    )}
                                                                    <p className="p-2 text-xs text-gray-600 truncate border-t border-gray-100" title={f.fileName}>
                                                                        {f.fileName}
                                                                    </p>
                                                                </a>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {/* Confirm delete step file modal */}
                                        <Dialog open={!!deleteFileConfirmId} onOpenChange={(open) => !open && setDeleteFileConfirmId(null)}>
                                            <DialogContent className="sm:max-w-md">
                                                <DialogHeader>
                                                    <DialogTitle>Datei löschen</DialogTitle>
                                                    <DialogDescription>
                                                        Möchten Sie diese Datei wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <DialogFooter>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() => setDeleteFileConfirmId(null)}
                                                        disabled={!!deletingFileId}
                                                    >
                                                        Abbrechen
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        className="bg-red-600 hover:bg-red-700"
                                                        disabled={!!deletingFileId}
                                                        onClick={() => deleteFileConfirmId && handleDeleteStepFile(deleteFileConfirmId)}
                                                    >
                                                        {deletingFileId ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Löschen'}
                                                    </Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>

                                        {/* File Upload Area */}
                                        <div
                                            className={`border-2 border-dashed rounded-lg p-12 flex flex-col items-center justify-center transition-colors cursor-pointer ${isDragging
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
                                    {activeStepIndex === 1 && (
                                        <LeistenerstellungStepFields
                                            material={material}
                                            leistentyp={leistentyp}
                                            leistenfertigung={leistenfertigung}
                                            onMaterialChange={setMaterial}
                                            onLeistentypChange={setLeistentyp}
                                            onLeistenfertigungChange={setLeistenfertigung}
                                        />
                                    )}

                                    {/* Step 3: Bettungserstellung – Step3 JSON inputs */}
                                    {activeStepIndex === 2 && (
                                        <BettungserstellungStepFields
                                            values={bettungStep3Data}
                                            onChange={setBettungStep3Data}
                                        />
                                    )}

                                    {/* Step 4: Halbprobenerstellung – Vorbereitungsdatum, Anmerkungen, Halbprobe Durchführung, Checkliste */}
                                    {activeStepIndex === 3 && (
                                        <HalbprobenerstellungStepFields
                                            preparation_date={preparation_date}
                                            fitting_date={fitting_date || undefined}
                                            anmerkungen_halbprobe={anmerkungen_halbprobe}
                                            halbprobe_durchfuehrung={halbprobe_durchfuehrung}
                                            checkliste_halbprobe={checkliste_halbprobe}
                                            onPreparationDateChange={setPreparation_date}
                                            onFittingDateChange={setFitting_date}
                                            onAnmerkungenHalbprobeChange={setAnmerkungen_halbprobe}
                                            onHalbprobeDurchfuehrungChange={setHalbprobe_durchfuehrung}
                                            onChecklisteHalbprobeChange={setCheckliste_halbprobe}
                                            onSkipHalbprobe={handleSkipStep4And5}
                                        />
                                    )}

                                    {/* Step 5: Halbprobe durchführen – Probenergebnis & Schafttyp */}
                                    {activeStepIndex === 4 && (
                                        <HalbprobeDurchfuehrungStepFields
                                            orderId={id}
                                            stepStatus="Halbprobe_durchführen"
                                            probenergebnis={probenergebnis}
                                            schafttyp={schafttyp}
                                            fitting_date={fitting_date}
                                            adjustments={adjustments}
                                            adjustmentsGrosseNacharbeit={adjustmentsGrosseNacharbeit}
                                            schafttypInternNote={schafttypInternNote}
                                            schafttypExternNote={schafttypExternNote}
                                            bodenkonstruktionInternNote={bodenkonstruktionInternNote}
                                            bodenkonstruktionExternNote={bodenkonstruktionExternNote}
                                            checklisteHalbprobe={checkliste_halbprobe}
                                            onProbenergebnisChange={handleProbenergebnisChange}
                                            onSchafttypChange={setSchafttyp}
                                            onFittingDateChange={setFitting_date}
                                            onAdjustmentsChange={setAdjustments}
                                            onAdjustmentsGrosseNacharbeitChange={setAdjustmentsGrosseNacharbeit}
                                            onSchafttypInternNoteChange={setSchafttypInternNote}
                                            onSchafttypExternNoteChange={setSchafttypExternNote}
                                            onBodenkonstruktionInternNoteChange={setBodenkonstruktionInternNote}
                                            onBodenkonstruktionExternNoteChange={setBodenkonstruktionExternNote}
                                            onChecklisteHalbprobeChange={setCheckliste_halbprobe}
                                        />
                                    )}

                                    {/* Complete Button – always enabled so user can re-submit or complete any step */}
                                    <Button
                                        type="button"
                                        disabled={submitting}
                                        onClick={() => setConfirmOpen(true)}
                                        className="w-fit bg-emerald-600 hover:bg-emerald-700 text-white py-4 text-sm cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
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
                                                    className="bg-[#61A178] hover:bg-[#4A8A5F]"
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

                    {/* Right Side - Sidebar: refetches per step when status changes */}
                    <div className="w-full lg:w-4/12">
                        <FertigungsweisungSidebar orderId={id} statusParam={statusFromUrl} />
                    </div>
                </div>
            </div>

        </>

    );
}
