import type { GroupDef, GroupDef2 } from "./Types";

export const GROUPS: GroupDef[] = [
  {
    id: "bettungskonfigurator_header",
    question: "Bettungskonfigurator",
    fieldType: "section",
    options: [],
  },
  {
    id: "bettung",
    question: "Soll die Bettung neutral oder korrigierend erstellt werden?",
    options: [
      { id: "neutral", label: "Neutral" },
      { id: "korrigierend", label: "Korrigierend" },
    ],
  },
  {
    id: "bettungsdicke",
    question: "Bettungsdicke",
    options: [
      { id: "min5", label: "Min. 5mm" },
      { id: "min7", label: "Min. 7mm" },
      { id: "min10", label: "Min. 10mm" },
    ],
  },
  {
    id: "shore",
    question: "Härtegrad (Shore):",
    options: [
      { id: "a30", label: "A30 (Weich)" },
      { id: "a40", label: "A40 (Mittel)" },
      { id: "mix", label: "A30 Vorfuß A50 Rückfuß (+1,99€)" },
      { id: "diabetes", label: "A65/25/20 (Diabetesbettung) (+3,99€)" },
    ],
  },
  {
    id: "fersenschale",
    question: "Fersenschale:",
    options: [
      { id: "leicht", label: "Leichte Fersenschale (Standard)" },
      { id: "keine", label: "Keine Fersenschale" },
      { id: "hoch", label: "Hohe Fersenschale(+9,99€)" },
    ],
  },
  {
    id: "laengsgewoelbe",
    question: "Längsgewölbestütze:",
    options: [
      { id: "mittel", label: "Mittel" },
      { id: "leicht", label: "Leicht" },
      { id: "stark", label: "Stark" },
      { id: "scan", label: "Nach Fußscan" },
    ],
  },
  {
    id: "pelotte",
    question: "Soll eine Pelotte oder Querpelotte eingesetzt werden?",
    options: [
      { id: "keine", label: "Keine" },
      { id: "pelotte", label: "Ja, Pelotte" },
      { id: "quer15", label: "Ja, Querpelotte 1-5" },
      { id: "quer25", label: "Ja, Querpelotte 2-5" },
    ],
  },
  {
    id: "fussstellung",
    question: "Korrektur der Fußstellung (Innen-Aussenranderhöhung):",
    options: [
      { id: "keine", label: "Keine" },
      { id: "innen", label: "Innenranderhöhung" },
      { id: "aussen", label: "Aussenranderhöhung" },
    ],
  },
  {
    id: "zehenelemente",
    question: "Zehenelemente",
    options: [
      { id: "nein", label: "Nein" },
      { id: "ja_folgende", label: "Ja, bei folgenden Zehen: ___________" },
    ],
  },
  {
    id: "korrektur_bereich",
    question: "Wenn eine Korrektur nötig ist: In welchem Bereich?",
    fieldType: "textarea",
    placeholder: "Wenn eine Korrektur nötig ist: In welchem Bereich?",
    options: [],
  },
  {
    id: "fussproblem_bettung",
    question: "Gibt es ein spezielles Fußproblem, das wir bei der Fertigung unbedingt berücksichtigen müssen?",
    fieldType: "textarea",
    placeholder: "z. B. Verkürzung – bitte Seite & Höhe angeben, Spitzfuß – Korrekturhöhe, Knickfuß, Spreizfuß usw.",
    options: [],
  },
  {
    id: "vertiefungen",
    question: "Vertiefungen / Aussparungen",
    options: [
      { id: "plantarfaszie", label: "Plantarfaszie" },
      { id: "fersensporn", label: "Fersensporn" },
      { id: "fersenpolster", label: "Fersenpolster" },
      { id: "metatarsal", label: "Metatarsalköpfchen" },
      { id: "zehenbeeren", label: "Zehenbeeren" },
      { id: "erster_strahl", label: "Erster Strahl" },
    ],
  },
  {
    id: "zusatzkorrekturen",
    question: "Zusatzkorrekturen",
    options: [
      { id: "absatz", label: "Absatzerhöhung (mm: ___) (+2,99€)" },
      {
        id: "beinlaenge",
        label: "Beinlängendifferenz (Seite: ___, mm: ___) (9,99€)",
      },
    ],
  },
  {
    id: "finish",
    question: "Oberfläche Finish:",
    options: [
      { id: "standard", label: "Standard" },
      { id: "premium", label: "Premium (+3,99€)" },
    ],
  },
  {
    id: "ueberzug",
    question: "Überzug",
    options: [
      { id: "ja", label: "Ja (+4,99€)" },
      {
        id: "nein_vorhanden",
        label: "Nein, vorhandene Stärke: ___ mm (exakt eintragen, wichtig für Passform)",
      },
    ],
  },
  {
    id: "bettung_wuensche",
    question: "Hast du sonstige Anmerkungen oder Wünsche zu der Bettung.",
    fieldType: "textarea",
    placeholder: "Haben Sie sonstige Anmerkungen oder Wünsche zur Bettung?",
    options: [],
  },
  {
    id: "leistenkonfigurator_header",
    question: "Leistenkonfigurator",
    fieldType: "section",
    options: [],
  },
  {
    id: "leisten_platzhalter",
    question: "Soll der Leisten mit oder ohne Platzhalter für die Bettung gefertigt werden?",
    options: [
      {
        id: "ohne",
        label: "Ohne Platzhalter (Bettung wird auf Leisten gefertigt)",
      },
      { id: "mit", label: "Mit Platzhalter (Bettung wird gefräst)" },
    ],
  },
  {
    id: "schuhleisten_typ",
    question: "Schuhleisten-Typ",
    options: [
      { id: "halbschuh", label: "Halbschuh" },
      { id: "knoechel", label: "Knöchelhoch (+8,00€)" },
    ],
  },
  {
    id: "leisten_material",
    question: "Material des Leisten:",
    options: [
      { id: "kunststoff", label: "Kunststoff (Standard)" },
      { id: "buchenholz", label: "Buchenholz (+30,00€)" },
    ],
  },
  {
    id: "gleiche_laenge",
    question: "Sollen beide Leisten die gleiche Länge haben?",
    options: [
      { id: "ja", label: "Ja, Standard" },
      { id: "nein", label: "Nein" },
    ],
  },
  {
    id: "absatzhoehe",
    question: "Absatzhöhe",
    options: [
      { id: "5cm", label: "5cm" },
      { id: "10cm", label: "10cm" },
      { id: "15cm", label: "15cm" },
      { id: "20cm", label: "20cm" },
    ],
  },
  {
    id: "abrollhilfe",
    question: "Abrollhilfe",
    options: [
      { id: "standard", label: "Standard" },
      { id: "mittelfuss", label: "Verbesserte Mittelfußrolle" },
      { id: "ballen", label: "Verbesserte Ballenrolle" },
    ],
  },
  {
    id: "fussproblem_leisten",
    question: "Gibt es spezielle Fußprobleme, die wir bei der Fertigung unbedingt berücksichtigen müssen?",
    fieldType: "textarea",
    placeholder: "Textfield",
    options: [],
  },
  {
    id: "leisten_wuensche",
    question: "Hast du sonstige Anmerkungen oder Wünsche zum Leisten.",
    fieldType: "textarea",
    placeholder: "Textfield",
    options: [],
  },
]


export const shoe = {
  id: "1",
  name: "Halbprobenerstellung",
  brand: "Kunde: Brugger Theo",
  price: 249.99,
  imageUrl: "/shoe.png",
  description: "Comfortable running shoes with maximum cushioning.",
}

export const shoe2 = {
  id: "2",
  name: "Bodenkonstruktion",
  brand: "Kunde: Brugger Theo",
  price: 249.99,
  imageUrl: "/placeholder2.svg",
  description: "Custom sole construction service.",
}
 


export const GROUPS2: GroupDef2[] = [
  {
    id: "hinterkappe",
    question: "Hinterkappe",
    fieldType: "select",
    options: [
      { id: "kunststoff", label: "Kunststoff Standard (0 €)" },
      { id: "leder", label: "Leder" },
      { id: "ohne", label: "Ohne Hinterkappe (0 €)" },
    ],
    subOptions: {
      leder: [
        { id: "leder_duenn", label: "Leder Dünn (+5 €)", price: 5 },
        { id: "leder_normal", label: "Leder Normal (+8 €)", price: 8 },
        { id: "leder_stark", label: "Leder Stark (+10 €)", price: 10 },
      ],
    },
  },
  {
    id: "Konstruktionsart",
    question: "Konstruktionsart",
    fieldType: "checkbox",
    options: [
      { id: "geldakt", label: "Geklebt" },
      { id: "reimmargandritt", label: "Rahmengenäht (Maschine) (+30 € Aufpreis)" },
    ],
  },
  {
    id: "brandsohle",
    question: "Brandsohle",
    fieldType: "checkbox",
    options: [
      { id: "standard", label: "Standard mit mitlaufendem Kork von 3mm (+4,99€)" },
      { id: "leder", label: "Leder (+7,99€)" },
      { id: "diabetes", label: "Diabetes/Versteift (+9,99€)" },

    ],
  },
 
  {
    id: "farbauswahl",
    question: "Farbauswahl Bodenkonstruktion",
    fieldType: "checkbox",
    options: [
      { id: "produktion", label: "Nach Produktfoto" },
      { id: "personal", label: "Nach Personal (passendstes)" },
      { id: "eigene", label: "Eigene Angabe" },
    ],
  },
  {
    id: "schlemmaterial",
    question: "Sohlenmaterial",
    fieldType: "checkbox",
    options: [
      { id: "eva95", label: "EVA Shore 58 (Lunalight)" },
      { id: "eva93", label: "EVA Shore 53 (AL)" },
      { id: "eva30", label: "EVA Shore 30 (SLW)" },
      { id: "leder", label: "Leder" },
    ],
  },
  {
    id: "absatzhoehe",
    question: "Absatz Höhe (Am besten wie bei Leisten beachtet)",
    fieldType: "text", // Changed to text field type
    options: [{ id: "mm", label: "mm" }],
  },

  {
    id: "abrollhilfe",
    question: "Abrollhilfe (Rolle)",
    fieldType: "checkbox",
    options: [
      { id: "keine", label: "Keine" },
      { id: "mittelfussrolle", label: "Mittelfußrolle" },
      { id: "abzezzolle", label: "Absatzrolle" },
      { id: "beilemdie", label: "Ballenrolle" },
    ],
  },
  {
    id: "absatzform",
    question: "Absatz Form (Achtung bitte auch Sohle beachten ob möglich)",
    fieldType: "checkbox",
    options: [
      { id: "Keilabsatz", label: "Keilabsatz" },
      { id: "Stegkeil", label: "Stegkeil" },
      { id: "Absatzkeil", label: "Absatzkeil" },
    ],
  },
  {
    id: "laufkohle",
    question: "Laufsohle / Profil / Art",
    fieldType: "select", // Changed to select field type
    options: [
      { id: "select1", label: "Ganze Sohle – Standard" },
      { id: "select2", label: "Ganze Sohle – Mit mehr Profil" },
      { id: "select3", label: "Halbe Sohle – Standard" },
      { id: "select4", label: "Halbe Sohle – Mit mehr Profil" },
      { id: "select5", label: "Spezialsystem (z. B. Vibram): " },
      { id: "laufsohle_lose_beilegen", label: "Laufsohle lose beilegen (-10€)" },
    ],
  },
  {
    id: "schlenstaerke",
    question: "Sohlenstärke",
    fieldType: "checkbox",
    options: [
      { id: "4mm", label: "4 mm" },
      { id: "6mm", label: "6 mm" },
    ],
  },
]