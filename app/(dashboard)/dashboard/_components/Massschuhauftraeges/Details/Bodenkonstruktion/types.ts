export type OptionDef = {
    id: string
    label: string
    disabled?: boolean
}

export type OptionInputsState = {
    [groupId: string]: {
        [optionId: string]: string[]
    }
}

export type TextAreasState = {
    [key: string]: string
}

