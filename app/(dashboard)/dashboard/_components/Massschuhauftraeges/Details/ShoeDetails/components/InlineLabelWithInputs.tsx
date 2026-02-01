import React from "react";
import { normalizeUnderscores } from "../../HelperFunctions";

type OptionDef = {
  id: string;
  label: string;
};

interface InlineLabelWithInputsProps {
  groupId: string;
  option: OptionDef;
  values: string[];
  onChange: (idx: number, val: string) => void;
}

export default function InlineLabelWithInputs({
  groupId,
  option,
  values,
  onChange,
}: InlineLabelWithInputsProps) {
  const normalized = normalizeUnderscores(option.label);
  const parts = normalized.split("___");

  const restrictNumber = (value: string): string => {
    const cleaned = value.replace(/[^\d.,]/g, "");
    if (cleaned === "") return "";

    const sepMatch = cleaned.match(/[.,]/);
    const sepIndex = sepMatch ? (sepMatch.index ?? -1) : -1;
    const intPartRaw = sepIndex >= 0 ? cleaned.slice(0, sepIndex) : cleaned;
    const intPart = intPartRaw.replace(/\D/g, "").slice(0, 2);
    if (sepIndex === -1) {
      return intPart;
    }
    const decPartRaw = cleaned.slice(sepIndex + 1);
    const decPart = decPartRaw.replace(/\D/g, "").slice(0, 2);

    return `${intPart}.${decPart}`;
  };

  const isNumericAt = (i: number): boolean => {
    if (groupId === "absatzhoehe") return true;
    const prev = parts[i] ?? "";
    const next = parts[i + 1] ?? "";
    if (/\bmm\b/i.test(prev) || /\bmm\b/i.test(next)) return true;
    return false;
  };

  return (
    <span>
      {parts.map((part, idx) => (
        <React.Fragment key={idx}>
          <span>{part}</span>
          {idx < parts.length - 1 &&
            (() => {
              const numeric = isNumericAt(idx);
              const val = values[idx] ?? "";
              return (
                <input
                  type={numeric ? "number" : "text"}
                  className={`inline-block mx-1 px-2 py-1 border border-gray-300 rounded-md bg-white text-gray-700 focus:ring-2 focus:ring-green-500 focus:border-transparent ${numeric ? "w-16" : "w-32"}`}
                  aria-label={`Eingabefeld ${idx + 1} für ${option.label}`}
                  value={val}
                  onChange={(e) =>
                    onChange(
                      idx,
                      numeric ? restrictNumber(e.target.value) : e.target.value,
                    )
                  }
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  onFocus={(e) => e.stopPropagation()}
                  inputMode={numeric ? "decimal" : undefined}
                  step={numeric ? "0.01" : undefined}
                  min={numeric ? 0 : undefined}
                  placeholder={
                    numeric ? "_ _ _" : "_ _ _ _ _ _ _ _ _ _ _ _ _ _ _"
                  }
                />
              );
            })()}
        </React.Fragment>
      ))}
    </span>
  );
}

