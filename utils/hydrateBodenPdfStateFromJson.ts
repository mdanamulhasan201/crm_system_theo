import type { SoleType } from '@/hooks/massschuhe/useSoleData';
import type { SelectedState } from '@/hooks/massschuhe/useBodenkonstruktionCalculations';
import type { OptionInputsState, TextAreasState } from '@/app/(dashboard)/dashboard/_components/Massschuhauftraeges/Details/Bodenkonstruktion/types';
import type {
    HeelWidthAdjustmentData,
    VorderkappeSideData,
    RahmenData,
    HinterkappeMusterSideData,
    HinterkappeSideData,
    BrandsohleSideData,
    SohlenversteifungData,
    SohlenaufbauData,
} from '@/app/(dashboard)/dashboard/_components/Massschuhauftraeges/Details/Bodenkonstruktion/FormFields';
import {
    defaultSohlenversteifungData,
    normalizeSohlenversteifungData,
    defaultSohlenaufbauData,
    normalizeSohlenaufbauData,
} from '@/app/(dashboard)/dashboard/_components/Massschuhauftraeges/Details/Bodenkonstruktion/FormFields';

const DEFAULT_SELECTED: SelectedState = {
    hinterkappe: 'kunststoff',
    sohlenversteifung: 'nein',
    verbindungsleder: 'ja',
    Konstruktionsart: 'geldakt',
};

export type HydratedBodenPdfState = {
    selected: SelectedState;
    optionInputs: OptionInputsState;
    textAreas: TextAreasState;
    heelWidthAdjustment: HeelWidthAdjustmentData | null;
    vorderkappeSide: VorderkappeSideData | null;
    rahmen: RahmenData | null;
    hinterkappeMusterSide: HinterkappeMusterSideData | null;
    hinterkappeSide: HinterkappeSideData | null;
    brandsohleSide: BrandsohleSideData | null;
    sohlenversteifung: SohlenversteifungData;
    sohlenaufbau: SohlenaufbauData;
    selectedSole: SoleType | null;
};

/** Same field mapping as BodenkonstruktionCustomerOrderView `applyPrefillData`, for PDFPopup props. */
export function hydrateBodenPdfStateFromJson(json: any, soleOptions: SoleType[]): HydratedBodenPdfState | null {
    if (!json || typeof json !== 'object') return null;

    const selectedData = json.selected ?? json.checklist_selected;
    const selected: SelectedState = {
        ...DEFAULT_SELECTED,
        ...(selectedData && typeof selectedData === 'object' ? selectedData : {}),
    };

    let sohlenversteifung = defaultSohlenversteifungData();
    if (json.sohlenversteifung_detail != null) {
        sohlenversteifung = normalizeSohlenversteifungData(json.sohlenversteifung_detail);
    } else if (json.form_data_v2?.sohlenversteifung != null) {
        sohlenversteifung = normalizeSohlenversteifungData(json.form_data_v2.sohlenversteifung);
    } else if (json.sohlenversteifung != null && typeof json.sohlenversteifung === 'object' && !Array.isArray(json.sohlenversteifung)) {
        sohlenversteifung = normalizeSohlenversteifungData(json.sohlenversteifung);
    }

    let sohlenaufbau = defaultSohlenaufbauData();
    if (json.sohlenaufbau_detail != null) {
        sohlenaufbau = normalizeSohlenaufbauData(json.sohlenaufbau_detail);
    } else if (json.form_data_v2?.sohlenaufbau != null) {
        sohlenaufbau = normalizeSohlenaufbauData(json.form_data_v2.sohlenaufbau);
    } else if (json.sohlenaufbau != null && typeof json.sohlenaufbau === 'object' && !Array.isArray(json.sohlenaufbau)) {
        sohlenaufbau = normalizeSohlenaufbauData(json.sohlenaufbau);
    }

    const optionInputs: OptionInputsState =
        json.optionInputs && typeof json.optionInputs === 'object' ? json.optionInputs : {};
    const textAreasData = json.textAreas ?? json.text_areas;
    const textAreas = {
        besondere_hinweise: '',
        ...(typeof textAreasData === 'object' && textAreasData ? textAreasData : {}),
    } as TextAreasState;

    const heelData =
        json.heelWidthAdjustment ??
        json.heel_width_adjustment ??
        json.form_data_v2?.absatz_abrollhilfe?.heel_width_adjustment ??
        null;

    const vorderkappeData = json.vorderkappeSide ?? json.form_data_v2?.vorderkappe ?? null;
    const rahmenData = json.rahmen ?? json.form_data_v2?.rahmen ?? null;
    const hinterkappeMusterData = json.hinterkappeMusterSide ?? json.form_data_v2?.hinterkappe_muster ?? null;
    const hinterkappeData = json.hinterkappeSide ?? json.form_data_v2?.hinterkappe ?? null;
    const brandsohleData = json.brandsohleSide ?? json.form_data_v2?.brandsohle ?? null;

    let selectedSole: SoleType | null = null;
    const soleId = json.selectedSoleId ?? json.selected_sole?.id ?? null;
    if (soleId != null && Array.isArray(soleOptions)) {
        selectedSole = soleOptions.find((s) => s.id === soleId) ?? null;
    }
    if (!selectedSole && json.selected_sole && typeof json.selected_sole === 'object') {
        const s = json.selected_sole as { id?: string; name?: string; image?: string; description?: string; des?: string };
        if (s.id && s.name) {
            selectedSole = {
                id: s.id,
                name: s.name,
                image: s.image ?? '',
                description: s.description ?? '',
                des: s.des,
            };
        }
    }

    return {
        selected,
        optionInputs,
        textAreas,
        heelWidthAdjustment: (heelData as HeelWidthAdjustmentData | null) ?? null,
        vorderkappeSide: (vorderkappeData as VorderkappeSideData | null) ?? null,
        rahmen: (rahmenData as RahmenData | null) ?? null,
        hinterkappeMusterSide: (hinterkappeMusterData as HinterkappeMusterSideData | null) ?? null,
        hinterkappeSide: (hinterkappeData as HinterkappeSideData | null) ?? null,
        brandsohleSide: (brandsohleData as BrandsohleSideData | null) ?? null,
        sohlenversteifung,
        sohlenaufbau,
        selectedSole,
    };
}
