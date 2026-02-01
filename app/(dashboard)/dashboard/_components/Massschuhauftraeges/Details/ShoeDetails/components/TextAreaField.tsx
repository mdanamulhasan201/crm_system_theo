import React from "react";
import { GroupDef } from "../../Types";

interface TextAreaFieldProps {
  def: GroupDef;
  value: string;
  onChange: (value: string) => void;
}

export default function TextAreaField({ def, value, onChange }: TextAreaFieldProps) {
  return (
    <div className="mb-6">
      <label className="block text-base font-bold text-gray-800 mb-2">
        {def.question}
      </label>
      <textarea
        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:ring-2 focus:ring-green-500 focus:border-transparent min-h-[100px]"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={def.placeholder || def.question}
        aria-label={def.question}
      />
    </div>
  );
}

