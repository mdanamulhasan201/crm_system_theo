'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

import ProductImageUploadInfo from '@/components/CustomShafts/ProductImageUploadInfo';
import ProductCadCategoryFields from '@/components/CustomShafts/ProductCadCategoryFields';
import ProductConfiguration, {
    type ProductConfigurationHandle,
} from '@/components/CustomShafts/ProductConfiguration';
import ShaftPDFPopup, { type ShaftOrderDataForPDF } from '@/components/CustomShafts/ShaftPDFPopup';
import { buildUmfangmasseWithTitles } from '@/utils/customShoeOrderHelpers';
import {
    EMPTY_POLSTERUNG_MM,
    buildPolsterungTextPayload,
    type PolsterungMmFields,
} from '@/components/CustomShafts/polsterungPayload';
import type { LeatherColorAssignment } from '@/components/CustomShafts/LeatherColorSectionModal';
import type { ZipperPosition } from '@/components/CustomShafts/ZipperPlacementModal';

/** JSON payload for massschafterstellung */
export interface MassschafterstellungJson {
    productDescription?: string;
    cadModeling?: string;
    customCategory?: string;
    customCategoryPrice?: number | null;
    lederType?: string;
    lederfarbe?: string;
    numberOfLeatherColors?: string;
    leatherColors?: string[];
    leatherColorAssignments?: LeatherColorAssignment[];
    innenfutter?: string;
    schafthohe?: string;
    schafthoheLinks?: string;
    schafthoheRechts?: string;
    umfangBei14Links?: string;
    umfangBei16Links?: string;
    umfangBei18Links?: string;
    knoechelumfangLinks?: string;
    umfangBei14Rechts?: string;
    umfangBei16Rechts?: string;
    umfangBei18Rechts?: string;
    knoechelumfangRechts?: string;
    polsterung?: string[];
    polsterungText?: string;
    polsterungMm?: PolsterungMmFields;
    verstarkungen?: string[];
    verstarkungenText?: string;
    nahtfarbeOption?: string;
    customNahtfarbe?: string;
    nahtfarbe?: string;
    ziernahtVorhanden?: boolean;
    closureType?: string;
    verschlussart?: string;
    offenstandSchnuerungMm?: string;
    anzahlOesen?: string;
    anzahlHaken?: string;
    anzahlKlettstreifen?: string;
    breiteKlettstreifenMm?: string;
    passendenSchnursenkel?: boolean;
    osenEinsetzen?: boolean;
    zipperExtra?: boolean;
    zipperPosition?: ZipperPosition | null;
    additionalNotes?: string;
    // Legacy fields (backward compat)
    kategorie?: string;
    modelName?: string;
    anzahlLedertypen?: string;
    sonstigeNotizen?: string;
}

export interface SchafttypCustomModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialData?: MassschafterstellungJson | null;
    initialImageUrl?: string | null;
    onSubmit?: (payload: {
        imageFile?: File;
        linkerLeistenFile?: File | null;
        rechterLeistenFile?: File | null;
        zipperImageFile?: File | null;
        paintImageFile?: File | null;
        massschafterstellung_json: MassschafterstellungJson;
    }) => void | Promise<void>;
    /** If false, do not open PDF popup after successful save */
    enablePdfAfterSubmit?: boolean;
    /** Maßschuhauftrag step 5: hide CAD surcharge labels and keep hero without shop pricing */
    hideConfiguratorPrices?: boolean;
}

async function dataUrlToFile(dataUrl: string, fileName: string): Promise<File> {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    return new File([blob], fileName, { type: blob.type || 'image/jpeg' });
}

export default function SchafttypCustomModal({
    open,
    onOpenChange,
    initialData,
    initialImageUrl,
    onSubmit,
    enablePdfAfterSubmit = true,
    hideConfiguratorPrices = false,
}: SchafttypCustomModalProps) {
    const productConfigRef = useRef<ProductConfigurationHandle>(null);

    // 3D Leisten files
    const [linkerLeistenFile, setLinkerLeistenFile] = useState<File | null>(null);
    const [linkerLeistenFileName, setLinkerLeistenFileName] = useState('');
    const [rechterLeistenFile, setRechterLeistenFile] = useState<File | null>(null);
    const [rechterLeistenFileName, setRechterLeistenFileName] = useState('');

    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [cadModeling, setCadModeling] = useState<'1x' | '2x'>('1x');
    const [customCategory, setCustomCategory] = useState('');
    const [customCategoryPrice, setCustomCategoryPrice] = useState<number | null>(null);
    const [productDescription, setProductDescription] = useState('');
    const [lederType, setLederType] = useState('');
    const [lederfarbe, setLederfarbe] = useState('');
    const [numberOfLeatherColors, setNumberOfLeatherColors] = useState('');
    const [leatherColorAssignments, setLeatherColorAssignments] = useState<LeatherColorAssignment[]>([]);
    const [leatherColors, setLeatherColors] = useState<string[]>([]);
    const [innenfutter, setInnenfutter] = useState('');
    const [schafthohe, setSchafthohe] = useState('');
    const [schafthoheLinks, setSchafthoheLinks] = useState('');
    const [schafthoheRechts, setSchafthoheRechts] = useState('');
    const [umfangBei14Links, setUmfangBei14Links] = useState('');
    const [umfangBei16Links, setUmfangBei16Links] = useState('');
    const [umfangBei18Links, setUmfangBei18Links] = useState('');
    const [knoechelumfangLinks, setKnoechelumfangLinks] = useState('');
    const [umfangBei14Rechts, setUmfangBei14Rechts] = useState('');
    const [umfangBei16Rechts, setUmfangBei16Rechts] = useState('');
    const [umfangBei18Rechts, setUmfangBei18Rechts] = useState('');
    const [knoechelumfangRechts, setKnoechelumfangRechts] = useState('');
    const [polsterung, setPolsterung] = useState<string[]>(['Standard']);
    const [polsterungText, setPolsterungText] = useState('');
    const [polsterungMm, setPolsterungMm] = useState<PolsterungMmFields>(EMPTY_POLSTERUNG_MM);
    const [verstarkungen, setVerstarkungen] = useState<string[]>(['Standard']);
    const [verstarkungenText, setVerstarkungenText] = useState('');
    const [nahtfarbeOption, setNahtfarbeOption] = useState('default');
    const [customNahtfarbe, setCustomNahtfarbe] = useState('');
    const [ziernahtVorhanden, setZiernahtVorhanden] = useState<boolean | undefined>(undefined);
    const [closureType, setClosureType] = useState('Eyelets');
    const [offenstandSchnuerungMm, setOffenstandSchnuerungMm] = useState('');
    const [anzahlOesen, setAnzahlOesen] = useState('');
    const [anzahlHaken, setAnzahlHaken] = useState('');
    const [anzahlKlettstreifen, setAnzahlKlettstreifen] = useState('');
    const [breiteKlettstreifenMm, setBreiteKlettstreifenMm] = useState('');
    const [passendenSchnursenkel, setPassendenSchnursenkel] = useState<boolean | undefined>(undefined);
    const [osenEinsetzen, setOsenEinsetzen] = useState<boolean | undefined>(undefined);
    const [zipperExtra, setZipperExtra] = useState<boolean | undefined>(undefined);
    const [zipperPosition, setZipperPosition] = useState<ZipperPosition | null>(null);
    const [zipperImage, setZipperImage] = useState<string | null>(null);
    const [paintImage, setPaintImage] = useState<string | null>(null);
    const [additionalNotes, setAdditionalNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [showPDFPopup, setShowPDFPopup] = useState(false);
    const pendingJsonRef = useRef<MassschafterstellungJson | null>(null);

    const resetState = useCallback(() => {
        setLinkerLeistenFile(null);
        setLinkerLeistenFileName('');
        setRechterLeistenFile(null);
        setRechterLeistenFileName('');
        setUploadedImage(null);
        setCadModeling('1x');
        setCustomCategory('');
        setCustomCategoryPrice(null);
        setProductDescription('');
        setLederType('');
        setLederfarbe('');
        setNumberOfLeatherColors('');
        setLeatherColorAssignments([]);
        setLeatherColors([]);
        setInnenfutter('');
        setSchafthohe('');
        setSchafthoheLinks('');
        setSchafthoheRechts('');
        setUmfangBei14Links('');
        setUmfangBei16Links('');
        setUmfangBei18Links('');
        setKnoechelumfangLinks('');
        setUmfangBei14Rechts('');
        setUmfangBei16Rechts('');
        setUmfangBei18Rechts('');
        setKnoechelumfangRechts('');
        setPolsterung(['Standard']);
        setPolsterungText('');
        setPolsterungMm(EMPTY_POLSTERUNG_MM);
        setVerstarkungen(['Standard']);
        setVerstarkungenText('');
        setNahtfarbeOption('default');
        setCustomNahtfarbe('');
        setZiernahtVorhanden(undefined);
        setClosureType('Eyelets');
        setOffenstandSchnuerungMm('');
        setAnzahlOesen('');
        setAnzahlHaken('');
        setAnzahlKlettstreifen('');
        setBreiteKlettstreifenMm('');
        setPassendenSchnursenkel(undefined);
        setOsenEinsetzen(undefined);
        setZipperExtra(undefined);
        setZipperPosition(null);
        setZipperImage(null);
        setPaintImage(null);
        setAdditionalNotes('');
    }, []);

    useEffect(() => {
        if (!open) return;
        // Always reset 3D file selections on open (files can't be pre-populated from URLs)
        setLinkerLeistenFile(null);
        setLinkerLeistenFileName('');
        setRechterLeistenFile(null);
        setRechterLeistenFileName('');
        if (initialData) {
            setCadModeling((initialData.cadModeling as '1x' | '2x') || '1x');
            setCustomCategory(initialData.customCategory ?? initialData.kategorie ?? '');
            setCustomCategoryPrice(initialData.customCategoryPrice ?? null);
            setProductDescription(initialData.productDescription ?? initialData.modelName ?? '');
            setLederType(initialData.lederType ?? '');
            setLederfarbe(initialData.lederfarbe ?? initialData.anzahlLedertypen ?? '');
            setNumberOfLeatherColors(initialData.numberOfLeatherColors ?? '');
            setLeatherColorAssignments(initialData.leatherColorAssignments ?? []);
            setLeatherColors(initialData.leatherColors ?? []);
            setInnenfutter(initialData.innenfutter ?? '');
            setSchafthohe(initialData.schafthohe ?? '');
            setSchafthoheLinks(initialData.schafthoheLinks ?? '');
            setSchafthoheRechts(initialData.schafthoheRechts ?? '');
            setUmfangBei14Links(initialData.umfangBei14Links ?? '');
            setUmfangBei16Links(initialData.umfangBei16Links ?? '');
            setUmfangBei18Links(initialData.umfangBei18Links ?? '');
            setKnoechelumfangLinks(initialData.knoechelumfangLinks ?? '');
            setUmfangBei14Rechts(initialData.umfangBei14Rechts ?? '');
            setUmfangBei16Rechts(initialData.umfangBei16Rechts ?? '');
            setUmfangBei18Rechts(initialData.umfangBei18Rechts ?? '');
            setKnoechelumfangRechts(initialData.knoechelumfangRechts ?? '');
            setPolsterung(initialData.polsterung?.length ? initialData.polsterung : ['Standard']);
            setPolsterungText(initialData.polsterungText ?? '');
            setPolsterungMm(initialData.polsterungMm ?? EMPTY_POLSTERUNG_MM);
            setVerstarkungen(initialData.verstarkungen?.length ? initialData.verstarkungen : ['Standard']);
            setVerstarkungenText(initialData.verstarkungenText ?? '');
            setNahtfarbeOption(initialData.nahtfarbeOption ?? 'default');
            setCustomNahtfarbe(initialData.customNahtfarbe ?? '');
            setZiernahtVorhanden(initialData.ziernahtVorhanden);
            setClosureType(initialData.closureType ?? initialData.verschlussart ?? 'Eyelets');
            setOffenstandSchnuerungMm(initialData.offenstandSchnuerungMm ?? '');
            setAnzahlOesen(initialData.anzahlOesen ?? '');
            setAnzahlHaken(initialData.anzahlHaken ?? '');
            setAnzahlKlettstreifen(initialData.anzahlKlettstreifen ?? '');
            setBreiteKlettstreifenMm(initialData.breiteKlettstreifenMm ?? '');
            setPassendenSchnursenkel(initialData.passendenSchnursenkel);
            setOsenEinsetzen(initialData.osenEinsetzen);
            setZipperExtra(initialData.zipperExtra);
            setZipperPosition(initialData.zipperPosition ?? null);
            setAdditionalNotes(initialData.additionalNotes ?? initialData.sonstigeNotizen ?? '');
        } else {
            resetState();
        }
        setUploadedImage(initialImageUrl || null);
    }, [open, initialData, initialImageUrl, resetState]);

    const buildJson = (): MassschafterstellungJson => ({
        productDescription: productDescription.trim() || undefined,
        cadModeling,
        customCategory: customCategory || undefined,
        customCategoryPrice: customCategoryPrice ?? undefined,
        lederType: lederType || undefined,
        lederfarbe: lederfarbe || undefined,
        numberOfLeatherColors: numberOfLeatherColors || undefined,
        leatherColors: leatherColors.length ? leatherColors : undefined,
        leatherColorAssignments: leatherColorAssignments.length ? leatherColorAssignments : undefined,
        innenfutter: innenfutter || undefined,
        schafthohe: schafthohe || undefined,
        schafthoheLinks: schafthoheLinks || undefined,
        schafthoheRechts: schafthoheRechts || undefined,
        umfangBei14Links: umfangBei14Links || undefined,
        umfangBei16Links: umfangBei16Links || undefined,
        umfangBei18Links: umfangBei18Links || undefined,
        knoechelumfangLinks: knoechelumfangLinks || undefined,
        umfangBei14Rechts: umfangBei14Rechts || undefined,
        umfangBei16Rechts: umfangBei16Rechts || undefined,
        umfangBei18Rechts: umfangBei18Rechts || undefined,
        knoechelumfangRechts: knoechelumfangRechts || undefined,
        polsterung: polsterung.length ? polsterung : undefined,
        polsterungText: polsterungText || undefined,
        polsterungMm,
        verstarkungen: verstarkungen.length ? verstarkungen : undefined,
        verstarkungenText: verstarkungenText || undefined,
        nahtfarbeOption,
        customNahtfarbe: customNahtfarbe || undefined,
        nahtfarbe: nahtfarbeOption === 'custom' ? (customNahtfarbe?.trim() || '') : (nahtfarbeOption || 'default'),
        ziernahtVorhanden,
        closureType,
        verschlussart: closureType,
        offenstandSchnuerungMm: offenstandSchnuerungMm || undefined,
        anzahlOesen: anzahlOesen || undefined,
        anzahlHaken: anzahlHaken || undefined,
        anzahlKlettstreifen: anzahlKlettstreifen || undefined,
        breiteKlettstreifenMm: breiteKlettstreifenMm || undefined,
        passendenSchnursenkel,
        osenEinsetzen,
        zipperExtra,
        zipperPosition: zipperPosition ?? null,
        additionalNotes: additionalNotes.trim() || undefined,
    });

    // Step 1: save data → then open PDF popup for download
    const handleAbschliessen = async () => {
        const massschafterstellung_json = buildJson();
        pendingJsonRef.current = massschafterstellung_json;
        setSubmitting(true);
        try {
            let imageFile: File | undefined;
            if (uploadedImage && uploadedImage.startsWith('data:')) {
                imageFile = await dataUrlToFile(uploadedImage, 'custom_model.jpg');
            }
            let zipperImageFile: File | null = null;
            if (zipperImage && zipperImage.startsWith('data:')) {
                zipperImageFile = await dataUrlToFile(zipperImage, 'zipper_image.png');
            }
            let paintImageFile: File | null = null;
            if (paintImage && paintImage.startsWith('data:')) {
                paintImageFile = await dataUrlToFile(paintImage, 'paint_image.png');
            }
            const result = onSubmit?.({
                imageFile,
                linkerLeistenFile: linkerLeistenFile ?? null,
                rechterLeistenFile: rechterLeistenFile ?? null,
                zipperImageFile,
                paintImageFile,
                massschafterstellung_json,
            });
            if (result && typeof (result as Promise<unknown>).then === 'function') {
                await (result as Promise<void>);
            }
            // Save succeeded → optionally show PDF popup
            if (enablePdfAfterSubmit) {
                setShowPDFPopup(true);
            } else {
                onOpenChange(false);
            }
        } finally {
            setSubmitting(false);
        }
    };

    // Step 2: user closes / confirms PDF → close the main modal
    const handlePDFConfirm = () => {
        setShowPDFPopup(false);
        onOpenChange(false);
    };

    // Build ShaftConfiguration for PDF from current state
    const buildShaftConfiguration = () => {
        const polsterungTextForPdf = buildPolsterungTextPayload(
            polsterungText,
            polsterungMm,
            polsterung.includes('Erweitert')
        );
        const formatUmfang = (u14: string, u16: string, u18: string, kn: string) => {
            const parts: string[] = [];
            if (u14?.trim()) parts.push(`Umfang 14 cm: ${u14.trim()} cm`);
            if (u16?.trim()) parts.push(`Umfang 16 cm: ${u16.trim()} cm`);
            if (u18?.trim()) parts.push(`Umfang 18 cm: ${u18.trim()} cm`);
            if (kn?.trim()) parts.push(`Knöchelumfang: ${kn.trim()} cm`);
            return parts.join(', ');
        };
        return {
            customCategory,
            cadModeling,
            lederType,
            lederfarbe,
            numberOfLeatherColors,
            leatherColors,
            leatherColorAssignments,
            innenfutter,
            schafthohe,
            schafthoheLinks,
            schafthoheRechts,
            umfangmasseLinks: formatUmfang(umfangBei14Links, umfangBei16Links, umfangBei18Links, knoechelumfangLinks),
            umfangmasseRechts: formatUmfang(umfangBei14Rechts, umfangBei16Rechts, umfangBei18Rechts, knoechelumfangRechts),
            umfangmasseLinksDetailed: buildUmfangmasseWithTitles(knoechelumfangLinks, umfangBei14Links, umfangBei16Links, umfangBei18Links),
            umfangmasseRechtsDetailed: buildUmfangmasseWithTitles(knoechelumfangRechts, umfangBei14Rechts, umfangBei16Rechts, umfangBei18Rechts),
            polsterung,
            verstarkungen,
            polsterungText: polsterungTextForPdf,
            verstarkungenText,
            nahtfarbe: nahtfarbeOption === 'custom' ? (customNahtfarbe?.trim() || '') : (nahtfarbeOption || 'default'),
            nahtfarbeOption,
            ziernahtVorhanden,
            closureType,
            offenstandSchnuerungMm,
            anzahlOesen,
            anzahlHaken,
            anzahlKlettstreifen,
            breiteKlettstreifenMm,
            passendenSchnursenkel,
            osenEinsetzen,
            zipperExtra,
            zipperPosition,
            additionalNotes: additionalNotes.trim() || undefined,
        };
    };

    const pdfOrderData: ShaftOrderDataForPDF = {
        productName: productDescription.trim() || 'Maßschaft',
    };

    return (
        <>
        {showPDFPopup && (
            <ShaftPDFPopup
                isOpen={showPDFPopup}
                onClose={() => { setShowPDFPopup(false); onOpenChange(false); }}
                onConfirm={handlePDFConfirm}
                orderData={pdfOrderData}
                shaftImage={uploadedImage}
                shaftConfiguration={buildShaftConfiguration()}
                hideAbschliessen
            />
        )}
        <Dialog open={open && !showPDFPopup} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-6xl! h-[95vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-200 shrink-0 pr-12">
                    <DialogTitle className="text-lg font-bold text-gray-800">
                        Massschaftkonfigurator
                    </DialogTitle>
                </DialogHeader>

                <div className="overflow-y-auto flex-1 px-6 py-4">
                    <div className="relative w-full">
                        {/* Product image (full width) + CAD / Category */}
                        <ProductImageUploadInfo
                            uploadedImage={uploadedImage}
                            setUploadedImage={setUploadedImage}
                            productDescription={productDescription}
                            setProductDescription={setProductDescription}
                            basePrice={customCategoryPrice || 0}
                            hidePrice
                            hideTitle
                            footer={
                                <ProductCadCategoryFields
                                    layout="card"
                                    cadModeling={cadModeling}
                                    setCadModeling={setCadModeling}
                                    customCategory={customCategory}
                                    setCustomCategory={setCustomCategory}
                                    setCustomCategoryPrice={setCustomCategoryPrice}
                                    category={customCategory}
                                    allowCategoryEdit
                                    hideCadPriceSuffix={hideConfiguratorPrices}
                                />
                            }
                        />

                        {/* Full product configuration form */}
                        <ProductConfiguration
                            ref={productConfigRef}
                            hideCadAndCategory
                            hideShopPriceLabels={hideConfiguratorPrices}
                            cadModeling={cadModeling}
                            setCadModeling={setCadModeling}
                            customCategory={customCategory}
                            setCustomCategory={setCustomCategory}
                            customCategoryPrice={customCategoryPrice}
                            setCustomCategoryPrice={setCustomCategoryPrice}
                            nahtfarbeOption={nahtfarbeOption}
                            setNahtfarbeOption={setNahtfarbeOption}
                            customNahtfarbe={customNahtfarbe}
                            setCustomNahtfarbe={setCustomNahtfarbe}
                            ziernahtVorhanden={ziernahtVorhanden}
                            setZiernahtVorhanden={setZiernahtVorhanden}
                            passendenSchnursenkel={passendenSchnursenkel}
                            setPassendenSchnursenkel={setPassendenSchnursenkel}
                            osenEinsetzen={osenEinsetzen}
                            setOsenEinsetzen={setOsenEinsetzen}
                            zipperExtra={zipperExtra}
                            setZipperExtra={(v) => {
                                setZipperExtra(v);
                                if (v === false) setZipperPosition(null);
                            }}
                            zipperPosition={zipperPosition}
                            setZipperPosition={setZipperPosition}
                            closureType={closureType}
                            setClosureType={setClosureType}
                            offenstandSchnuerungMm={offenstandSchnuerungMm}
                            setOffenstandSchnuerungMm={setOffenstandSchnuerungMm}
                            anzahlOesen={anzahlOesen}
                            setAnzahlOesen={setAnzahlOesen}
                            anzahlHaken={anzahlHaken}
                            setAnzahlHaken={setAnzahlHaken}
                            anzahlKlettstreifen={anzahlKlettstreifen}
                            setAnzahlKlettstreifen={setAnzahlKlettstreifen}
                            breiteKlettstreifenMm={breiteKlettstreifenMm}
                            setBreiteKlettstreifenMm={setBreiteKlettstreifenMm}
                            lederType={lederType}
                            setLederType={setLederType}
                            lederfarbe={lederfarbe}
                            setLederfarbe={setLederfarbe}
                            innenfutter={innenfutter}
                            setInnenfutter={setInnenfutter}
                            schafthohe={schafthohe}
                            setSchafthohe={setSchafthohe}
                            schafthoheLinks={schafthoheLinks}
                            setSchafthoheLinks={setSchafthoheLinks}
                            schafthoheRechts={schafthoheRechts}
                            setSchafthoheRechts={setSchafthoheRechts}
                            umfangBei14Links={umfangBei14Links}
                            setUmfangBei14Links={setUmfangBei14Links}
                            umfangBei16Links={umfangBei16Links}
                            setUmfangBei16Links={setUmfangBei16Links}
                            umfangBei18Links={umfangBei18Links}
                            setUmfangBei18Links={setUmfangBei18Links}
                            knoechelumfangLinks={knoechelumfangLinks}
                            setKnoechelumfangLinks={setKnoechelumfangLinks}
                            umfangBei14Rechts={umfangBei14Rechts}
                            setUmfangBei14Rechts={setUmfangBei14Rechts}
                            umfangBei16Rechts={umfangBei16Rechts}
                            setUmfangBei16Rechts={setUmfangBei16Rechts}
                            umfangBei18Rechts={umfangBei18Rechts}
                            setUmfangBei18Rechts={setUmfangBei18Rechts}
                            knoechelumfangRechts={knoechelumfangRechts}
                            setKnoechelumfangRechts={setKnoechelumfangRechts}
                            polsterung={polsterung}
                            setPolsterung={setPolsterung}
                            polsterungMm={polsterungMm}
                            setPolsterungMm={setPolsterungMm}
                            verstarkungen={verstarkungen}
                            setVerstarkungen={setVerstarkungen}
                            polsterungText={polsterungText}
                            setPolsterungText={setPolsterungText}
                            verstarkungenText={verstarkungenText}
                            setVerstarkungenText={setVerstarkungenText}
                            numberOfLeatherColors={numberOfLeatherColors}
                            setNumberOfLeatherColors={setNumberOfLeatherColors}
                            leatherColorAssignments={leatherColorAssignments}
                            setLeatherColorAssignments={setLeatherColorAssignments}
                            leatherColors={leatherColors}
                            setLeatherColors={setLeatherColors}
                            shoeImage={uploadedImage || null}
                            onDeliveryChoiceRequired={() => {}}
                            onOrderComplete={() => { handleAbschliessen(); }}
                            category={customCategory}
                            allowCategoryEdit
                            zipperImage={zipperImage}
                            setZipperImage={setZipperImage}
                            paintImage={paintImage}
                            setPaintImage={setPaintImage}
                            additionalNotes={additionalNotes}
                            setAdditionalNotes={setAdditionalNotes}
                        />

                        {/* Submit button */}
                        <div className="mt-6">
                            <Button
                                type="button"
                                className="w-full bg-gray-900 hover:bg-gray-800 text-white"
                                onClick={handleAbschliessen}
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Wird gespeichert...
                                    </>
                                ) : (
                                    'Abschließen'
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
        </>
    );
}
