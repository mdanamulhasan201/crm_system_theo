export type OptionDef = {
    id: string
    label: string
  }
  
  export type GroupDef = {
    id: string
    question: string
    options: OptionDef[]
    fieldType?: "checkbox" | "select" | "text" // Added fieldType to distinguish field types
  }
  
  export type GroupDef2 = {
    id: string
    question: string
    options: OptionDef[]
    fieldType?: "checkbox" | "select" | "text"
    subOptions?: {
      [key: string]: Array<{ id: string; label: string; price: number }>
    }
  }
  
  export type SelectedState = {
    [groupId: string]: string | null
  }
  
  export type OptionInputsState = {
    [groupId: string]: {
      [optionId: string]: string[]
    }
  }
  
  export type TextAreasState = {
    [key: string]: string
  }