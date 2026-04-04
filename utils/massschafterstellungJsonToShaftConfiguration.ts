import type { ShaftConfiguration } from '@/components/CustomShafts/shaftOrderConfiguration';
import type { MassschafterstellungJson } from '@/app/(dashboard)/dashboard/_components/Massschuhauftraeges/NewMasschuhau/SchafttypCustomModal';
import { buildUmfangmasseWithTitles } from '@/utils/customShoeOrderHelpers';
import { EMPTY_POLSTERUNG_MM, buildPolsterungTextPayload } from '@/components/CustomShafts/polsterungPayload';

/**
 * Maps saved Massschafterstellung JSON (API / track) to ShaftConfiguration for ShaftPDFPopup —
 * same layout as SchafttypCustomModal `buildShaftConfiguration`.
 */
export function massschafterstellungJsonToShaftConfiguration(j: MassschafterstellungJson): ShaftConfiguration {
    const polsterung = j.polsterung ?? [];
    const polsterungMm = j.polsterungMm ?? EMPTY_POLSTERUNG_MM;
    const polsterungTextForPdf = buildPolsterungTextPayload(
        j.polsterungText ?? '',
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
    const nahtfarbeOption = j.nahtfarbeOption;
    const customNahtfarbe = j.customNahtfarbe ?? '';
    return {
        customCategory: j.customCategory,
        cadModeling: j.cadModeling as '1x' | '2x' | undefined,
        lederType: j.lederType,
        lederfarbe: j.lederfarbe,
        numberOfLeatherColors: j.numberOfLeatherColors,
        leatherColors: j.leatherColors,
        leatherColorAssignments: j.leatherColorAssignments,
        innenfutter: j.innenfutter,
        schafthohe: j.schafthohe,
        schafthoheLinks: j.schafthoheLinks,
        schafthoheRechts: j.schafthoheRechts,
        umfangmasseLinks: formatUmfang(
            j.umfangBei14Links ?? '',
            j.umfangBei16Links ?? '',
            j.umfangBei18Links ?? '',
            j.knoechelumfangLinks ?? ''
        ),
        umfangmasseRechts: formatUmfang(
            j.umfangBei14Rechts ?? '',
            j.umfangBei16Rechts ?? '',
            j.umfangBei18Rechts ?? '',
            j.knoechelumfangRechts ?? ''
        ),
        umfangmasseLinksDetailed: buildUmfangmasseWithTitles(
            j.knoechelumfangLinks,
            j.umfangBei14Links,
            j.umfangBei16Links,
            j.umfangBei18Links
        ),
        umfangmasseRechtsDetailed: buildUmfangmasseWithTitles(
            j.knoechelumfangRechts,
            j.umfangBei14Rechts,
            j.umfangBei16Rechts,
            j.umfangBei18Rechts
        ),
        polsterung,
        verstarkungen: j.verstarkungen,
        polsterungText: polsterungTextForPdf,
        verstarkungenText: j.verstarkungenText,
        nahtfarbe:
            nahtfarbeOption === 'custom'
                ? (customNahtfarbe?.trim() || '')
                : nahtfarbeOption || j.nahtfarbe || 'default',
        nahtfarbeOption,
        ziernahtVorhanden: j.ziernahtVorhanden,
        closureType: j.closureType ?? j.verschlussart,
        offenstandSchnuerungMm: j.offenstandSchnuerungMm,
        anzahlOesen: j.anzahlOesen,
        anzahlHaken: j.anzahlHaken,
        anzahlKlettstreifen: j.anzahlKlettstreifen,
        breiteKlettstreifenMm: j.breiteKlettstreifenMm,
        passendenSchnursenkel: j.passendenSchnursenkel,
        osenEinsetzen: j.osenEinsetzen,
        zipperExtra: j.zipperExtra,
        zipperPosition: j.zipperPosition ?? null,
        additionalNotes: j.additionalNotes?.trim() || j.sonstigeNotizen?.trim() || undefined,
    };
}
