export type OptionDef = {
    id: string
    label: string
    disabled?: boolean
  }
  
  export type GroupDef = {
    id: string
    question: string
    options: OptionDef[]
    fieldType?: "checkbox" | "select" | "text" | "textarea" | "section" // Added fieldType to distinguish field types
    placeholder?: string
  }
  
  export type GroupDef2 = {
    id: string
    question: string
    options: OptionDef[]
    fieldType?: "checkbox" | "select" | "text" | "heelWidthAdjustment"
    multiSelect?: boolean
    subOptions?: {
      [key: string]: Array<{ id: string; label: string; price: number }>
    }
  }
  
  export type SelectedState = {
    [groupId: string]: string | string[] | null
  }
  
  export type OptionInputsState = {
    [groupId: string]: {
      [optionId: string]: string[]
    }
  }
  
  export type TextAreasState = {
    [key: string]: string
  }