import { GROUPS } from "../../ShoeData";

type OptionInputsState = {
  [groupId: string]: {
    [optionId: string]: string[];
  };
};

type SelectedState = {
  [groupId: string]: string | null;
};

type TextAreasState = {
  [key: string]: string;
};

/**
 * Get selected option label for a given group
 */
export const getSelectedOptionLabel = (
  groupId: string,
  selected: SelectedState
): string => {
  const selectedOptId = selected[groupId];
  if (!selectedOptId) return "";
  const group = GROUPS.find((g) => g.id === groupId);
  const option = group?.options.find((o) => o.id === selectedOptId);
  return option?.label || "";
};

/**
 * Get selected option with inline input values
 */
export const getSelectedOptionWithInputs = (
  groupId: string,
  selected: SelectedState,
  optionInputs: OptionInputsState
): string => {
  const selectedOptId = selected[groupId];
  if (!selectedOptId) return "";
  const group = GROUPS.find((g) => g.id === groupId);
  const option = group?.options.find((o) => o.id === selectedOptId);
  if (!option) return "";

  const inputs = optionInputs[groupId]?.[selectedOptId] || [];
  const inputsString = inputs.filter((i) => i.trim()).join(", ");

  if (inputsString) {
    // Replace placeholder underscores with actual input values
    let label = option.label;
    const placeholderCount = (label.match(/_{3,}/g) || []).length;
    if (placeholderCount > 0) {
      // Replace first placeholder with inputs
      label = label.replace(/_{3,}/, inputsString);
    } else {
      // Append inputs if no placeholder
      label = `${label} | ${inputsString}`;
    }
    return label;
  }
  return option.label;
};

/**
 * Prepare Halbprobenerstellung_json object with all configuration data
 */
export const prepareHalbprobenerstellungJson = (
  selected: SelectedState,
  textAreas: TextAreasState,
  optionInputs: OptionInputsState
) => {
  return {
    // Bettung section
    Bettung_korrigierend: getSelectedOptionLabel("bettung", selected) || null,
    Bettungsdicke: getSelectedOptionLabel("bettungsdicke", selected) || null,
    Haertegrad_Shore: getSelectedOptionLabel("shore", selected) || null,
    Fersenschale: getSelectedOptionLabel("fersenschale", selected) || null,
    Laengsgewölbestütze: getSelectedOptionLabel("laengsgewoelbe", selected) || null,
    Palotte_oder_Querpalotte: getSelectedOptionLabel("pelotte", selected) || null,
    Korrektur_der_Fußstellung: getSelectedOptionLabel("fussstellung", selected) || null,
    Zehenelemente_Details: getSelectedOptionWithInputs("zehenelemente", selected, optionInputs) || null,
    eine_korrektur_nötig_ist: textAreas["korrektur_bereich"] || null,
    Spezielles_Fußproblem: textAreas["fussproblem_bettung"] || null,
    Zusatzkorrektur_Absatzerhöhung: getSelectedOptionWithInputs("zusatzkorrekturen", selected, optionInputs) || null,
    Vertiefungen_Aussparungen: getSelectedOptionLabel("vertiefungen", selected) || null,
    Oberfläche_finish: getSelectedOptionLabel("finish", selected) || null,
    Überzug_Stärke: getSelectedOptionWithInputs("ueberzug", selected, optionInputs) || null,
    Anmerkungen_zur_Bettung: textAreas["bettung_wuensche"] || null,

    // Leisten section
    Leisten_mit_ohne_Platzhalter: getSelectedOptionLabel("leisten_platzhalter", selected) || null,
    Schuhleisten_Typ: getSelectedOptionLabel("schuhleisten_typ", selected) || null,
    Material_des_Leisten: getSelectedOptionLabel("leisten_material", selected) || null,
    Leisten_gleiche_Länge: getSelectedOptionLabel("gleiche_laenge", selected) || null,
    Absatzhöhe: getSelectedOptionLabel("absatzhoehe", selected) || null,
    Abrollhilfe: getSelectedOptionLabel("abrollhilfe", selected) || null,
    Spezielle_Fußprobleme_Leisten: textAreas["fussproblem_leisten"] || null,
    Anmerkungen_zum_Leisten: textAreas["leisten_wuensche"] || null,
  };
};

/**
 * Prepare FormData for Admin1 API submission
 * Structure:
 * - image3d_1 (File)
 * - image3d_2 (File)
 * - invoice (File)
 * - Halbprobenerstellung_json (JSON string)
 * - totalPrice (string)
 */
export const prepareFormDataForAdmin1 = (
  linkerLeistenFile: File | null,
  rechterLeistenFile: File | null,
  pdfFile: File | null,
  selected: SelectedState,
  textAreas: TextAreasState,
  optionInputs: OptionInputsState,
  grandTotal: number
): FormData => {
  const formData = new FormData();

  // 1. File uploads
  if (linkerLeistenFile) {
    formData.append("image3d_1", linkerLeistenFile);
  }
  if (rechterLeistenFile) {
    formData.append("image3d_2", rechterLeistenFile);
  }
  if (pdfFile) {
    formData.append("invoice", pdfFile);
  }

  // 2. Halbprobenerstellung_json - All configuration data in JSON format
  const halbprobenerstellungJson = prepareHalbprobenerstellungJson(
    selected,
    textAreas,
    optionInputs
  );
  formData.append("Halbprobenerstellung_json", JSON.stringify(halbprobenerstellungJson));

  // 3. Total price
  formData.append("totalPrice", grandTotal.toFixed(2));

  return formData;
};

