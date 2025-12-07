'use client';

import React from 'react';
import MitarbeiterCards from '../_components/Mitarbeitercontrolling/MitarbeiterCards';
import MitarbeiterTable from '../_components/Mitarbeitercontrolling/MitarbeiterTable';
import Aufgabenverteilung from '../_components/Mitarbeitercontrolling/Aufgabenverteilung';
import SkillAuswertung from '../_components/Mitarbeitercontrolling/SkillAuswertung';

export default function Mitarbeitercontrolling() {
    return (
        <div className="w-full">
            <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">
                Mitarbeiter - Produktionsübersicht
            </h1>

            <MitarbeiterCards />
            <MitarbeiterTable />
            <Aufgabenverteilung />
            <SkillAuswertung />
        </div>
    );
}
