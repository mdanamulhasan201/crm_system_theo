import Image from 'next/image';
import React from 'react';

const customer = {
    name: 'Theo Brugger',
    appointedDate: '13.02.2025',
    location: 'Bozen',
    notes: 'dfgsdf',
};

const formFields = [
    { id: 'name', label: 'Name', placeholder: 'Name' },
    { id: 'birth', label: 'Geburtsdatum', placeholder: 'Geburtsdatum' },
    { id: 'customer', label: 'Kundennummer', placeholder: 'Kundennummer' },
];

export default function CustomerSearch() {
    return (
        <section className="space-y-6 mt-10 h-full">
            <h1 className="text-center text-3xl font-semibold text-slate-900">
                Auftragssuche
            </h1>

            <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 rounded-lg bg-white  md:items-center md:gap-4">
                {formFields.map((field) => (
                    <label key={field.id} className="flex-1">
                        <span className="sr-only">{field.label}</span>
                        <input
                            type="text"
                            placeholder={field.placeholder}
                            className="w-full rounded-2xl border border-[#d7e4ef] px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#61A175] focus:ring-2 focus:ring-[#61A175]/30"
                        />
                    </label>
                ))}
                <button
                    type="button"
                    className="rounded-lg bg-[#61A175] px-8 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-[#61A175]/80 cursor-pointer"
                >
                    Suchen
                </button>
            </form>

            <div className="flex flex-col lg:flex-row gap-6 bg-white w-full mt-10">

                {/* Customer Information */}
                <div className="rounded-3xl border border-[#e2eef2] p-6 text-center w-full lg:w-4/12">
                    <div className="mx-auto mb-4 h-20 w-20 overflow-hidden rounded-full border-4 border-emerald-100">
                        <Image
                            src="/images/customer.png"
                            width={80}
                            height={80}
                            alt={customer.name}
                            className="h-full w-full object-cover"
                        />
                    </div>
                    <h2 className="text-xl font-semibold text-slate-900 mb-2">
                        {customer.name}
                    </h2>
                    <p className="text-sm text-slate-500">
                        Beauftragt am{' '}
                        <span className="font-semibold text-slate-700">
                            {customer.appointedDate}
                        </span>
                    </p>
                    <p className="text-sm text-slate-500">
                        Ort:{' '}
                        <span className="font-semibold text-slate-700">
                            {customer.location}
                        </span>
                    </p>

                    <div className="mt-6 space-y-3">
                        <button className="w-full rounded-xl bg-[#61A175] py-3 text-sm font-semibold text-white transition hover:bg-[#61A175]/80 cursor-pointer">
                            Scan ansehen
                        </button>
                        <button className="w-full rounded-xl border border-[#61A175] py-3 text-sm font-semibold text-[#61A175] transition hover:bg-[#61A175]/10 cursor-pointer">
                            Kundendaten ansehen
                        </button>
                    </div>
                </div>

                {/* Order Information */}
                <div className="flex flex-col gap-4 w-full lg:w-8/12">
                    <div className="flex flex-col gap-2 text-sm text-slate-800 sm:flex-row  sm:gap-4">
                        <button className="text-left underline underline-offset-4 hover:text-[#61A175] cursor-pointer">
                            Ärztliche Diagnose öffnen
                        </button>
                        <button className="text-left underline underline-offset-4 hover:text-[#61A175] cursor-pointer">
                            Diagnose
                        </button>
                    </div>

                    <div>
                        <p className="text-base font-semibold text-slate-700">
                            Notizen:
                        </p>
                        <textarea
                            defaultValue={customer.notes}
                            className="mt-2 h-40 w-full resize-none rounded-2xl border border-[#d7e4ef] px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#61A175] focus:ring-2 focus:ring-[#61A175]/30"
                        />
                    </div>


                    <div className="flex flex-col xl:flex-row justify-between items-center gap-4">

                        <div>
                            <p className="text-sm text-slate-500">
                                Wenn eine Korrektur nötig ist: In welchem Bereich?
                            </p>
                            <button className="mt-2 text-sm underline underline-offset-4 hover:text-[#61A175] cursor-pointer">
                                Ärztliche Diagnose öffnen
                            </button>
                        </div>

                        <div className="flex sm:flex-col md:flex-row gap-4">
                            <button className="rounded-xl bg-[#61A175] px-10 py-3 text-sm font-semibold uppercase  text-white transition hover:bg-[#61A175]/80 cursor-pointer">
                                Standard
                            </button>
                            <button className="rounded-xl border border-[#61A175] px-10 py-3 text-sm font-semibold uppercase text-[#61A175] transition hover:bg-[#61A175]/10 cursor-pointer">
                                Expressauftrag
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
