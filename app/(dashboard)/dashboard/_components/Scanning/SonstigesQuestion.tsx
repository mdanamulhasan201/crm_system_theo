"use client";

import React, { useEffect } from "react";

export interface SonstigesQuestionProps {
    customer: any;
    onQuestionsLoaded?: (hasQuestions: boolean) => void;
}

export default function SonstigesQuestion({ customer, onQuestionsLoaded }: SonstigesQuestionProps) {
    // Since there are no questions for Sonstiges, immediately notify that there are no questions
    useEffect(() => {
        onQuestionsLoaded?.(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [customer?.id]);

    // Return null since there are no questions to display
    return null;
}