import React from "react";
import { GroupDef } from "../../Types";
import { normalizeUnderscores } from "../../HelperFunctions";
import InlineLabelWithInputs from "./InlineLabelWithInputs";

type OptionInputsState = {
  [groupId: string]: {
    [optionId: string]: string[];
  };
};

interface OptionGroupProps {
  def: GroupDef;
  selected: string | null;
  onSelect: (optionId: string | null) => void;
  optionInputs: OptionInputsState;
  setOptionInputs: React.Dispatch<React.SetStateAction<OptionInputsState>>;
}

export default function OptionGroup({
  def,
  selected,
  onSelect,
  optionInputs,
  setOptionInputs,
}: OptionGroupProps) {
  const handleSelect = (optId: string) => {
    onSelect(optId);
  };

  const handleDoubleClick = () => {
    onSelect(null);
  };

  const getOptionInlineCount = (label: string) => {
    const norm = normalizeUnderscores(label);
    return Math.max(0, norm.split("___").length - 1);
  };

  React.useEffect(() => {
    def.options.forEach((opt) => {
      const placeholderCount = getOptionInlineCount(opt.label);
      if (placeholderCount > 0) {
        const current = optionInputs[def.id]?.[opt.id] ?? [];
        if (current.length !== placeholderCount) {
          setOptionInputs((prev) => {
            const prevGroup = prev[def.id] ?? {};
            const nextValues = Array.from(
              { length: placeholderCount },
              (_, i) => current[i] ?? "",
            );
            return {
              ...prev,
              [def.id]: {
                ...prevGroup,
                [opt.id]: nextValues,
              },
            };
          });
        }
      }
    });
  }, [def, optionInputs, setOptionInputs]);

  return (
    <div
      className="flex items-start mb-6"
      role="radiogroup"
      aria-label={def.question}
      onDoubleClick={handleDoubleClick}
    >
      <div className="text-base font-bold text-gray-800 mr-6 min-w-[200px]">
        {def.question}
      </div>
      <div className="flex flex-wrap items-center gap-4">
        {def.options.map((opt) => {
          const isChecked = selected === opt.id;
          const placeholderCount = getOptionInlineCount(opt.label);
          const inputsForOpt =
            optionInputs[def.id]?.[opt.id] ??
            Array.from({ length: placeholderCount }, () => "");

          const inputId = `opt-${def.id}-${opt.id}`;
          return (
            <div
              key={opt.id}
              className="flex items-center gap-2"
              onDoubleClick={(e) => {
                e.stopPropagation();
                onSelect(null);
              }}
            >
              <div className="relative flex items-center">
                <input
                  id={inputId}
                  type="checkbox"
                  className="sr-only"
                  checked={isChecked}
                  onChange={() => handleSelect(opt.id)}
                  aria-label={opt.label}
                />
                <div
                  className={`h-5 w-5 border-2 rounded cursor-pointer transition-all flex items-center justify-center ${
                    isChecked
                      ? "bg-green-500 border-green-500"
                      : "bg-white border-gray-300 hover:border-green-400"
                  }`}
                  onClick={() => handleSelect(opt.id)}
                >
                  {isChecked && (
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
              </div>
              {placeholderCount > 0 ? (
                <div
                  className="text-base text-gray-700 cursor-pointer"
                  onClick={() => handleSelect(opt.id)}
                  role="button"
                  aria-label={opt.label}
                >
                  <InlineLabelWithInputs
                    groupId={def.id}
                    option={opt}
                    values={inputsForOpt}
                    onChange={(idx, val) =>
                      setOptionInputs((prev) => ({
                        ...prev,
                        [def.id]: {
                          ...(prev[def.id] ?? {}),
                          [opt.id]: inputsForOpt.map((v, i) =>
                            i === idx ? val : v,
                          ),
                        },
                      }))
                    }
                  />
                </div>
              ) : (
                <label
                  htmlFor={inputId}
                  className="text-base text-gray-700 cursor-pointer"
                >
                  {opt.label}
                </label>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

