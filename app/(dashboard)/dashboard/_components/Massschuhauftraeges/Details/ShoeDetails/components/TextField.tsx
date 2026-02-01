import React from "react";
import { GroupDef } from "../../Types";

interface TextFieldProps {
  def: GroupDef;
  selected: string | null;
  onSelect: (value: string) => void;
}

export default function TextField({ def, selected, onSelect }: TextFieldProps) {
  return (
    <div className="mb-6">
      <label className="block text-base font-bold text-gray-800 mb-2">
        {def.question}
      </label>
      <div className="flex items-center border border-gray-300 rounded-md bg-white overflow-hidden w-fit">
        <input
          type="number"
          className="w-24 px-3 py-2 border-0 bg-transparent text-gray-700 focus:outline-none focus:ring-0"
          placeholder="...................."
          value={selected || ""}
          onChange={(e) => onSelect(e.target.value)}
          aria-label={def.question}
          step="0.01"
          min="0"
        />
        <span className="text-base text-gray-700 px-3 py-2 bg-transparent border-l border-gray-300">
          mm
        </span>
      </div>
    </div>
  );
}

