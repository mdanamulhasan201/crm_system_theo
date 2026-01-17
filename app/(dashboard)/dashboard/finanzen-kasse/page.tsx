'use client'
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Calendar, Download, TrendingUp, TrendingDown, DollarSign, AlertTriangle, Check, X, Receipt } from 'lucide-react'
import { FiCreditCard } from 'react-icons/fi'
import { BsCashStack } from 'react-icons/bs'
import TagesabschlussDialog from '../_components/Finanzen/TagesabschlussDialog'
import TagesabschlussConfirmDialog from '../_components/Finanzen/TagesabschlussConfirmDialog'
import TagesdetailsDialog from '../_components/Finanzen/TagesdetailsDialog'

interface Transaction {
    id: string
    date: string
    time: string
    user: string
    amount: string
    status: 'OK' | 'Differenz'
    difference?: string
}

interface Expense {
    id: string
    description: string
    amount: string
    date: string
    time: string
}

const mockTransactions: Transaction[] = [
    {
        id: '1',
        date: 'Mo, 06.01.',
        time: '18:30',
        user: 'Max Mustermann',
        amount: '1.000,00',
        status: 'OK'
    },
    {
        id: '2',
        date: 'So, 05.01.',
        time: '18:45',
        user: 'Julia Meyer',
        amount: '730,00',
        status: 'Differenz',
        difference: '-5,00'
    }
]

export default function FinanzenKassePage() {
    const [activeTab, setActiveTab] = useState<'kassenmanagement' | 'einnahmen'>('kassenmanagement')
    const [showInitialBalanceDialog, setShowInitialBalanceDialog] = useState(false)
    const [showTagesabschlussDialog, setShowTagesabschlussDialog] = useState(false)
    const [showTagesabschlussConfirmDialog, setShowTagesabschlussConfirmDialog] = useState(false)
    const [showTagesdetailsDialog, setShowTagesdetailsDialog] = useState(false)
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
    const [initialBalance, setInitialBalance] = useState('0,00')
    const [initialBalanceNote, setInitialBalanceNote] = useState('')
    const [hasInitialBalance, setHasInitialBalance] = useState(false)
    const [filterType, setFilterType] = useState<'von' | 'bis' | 'alle'>('alle')
    
    // Statistics
    const stats = {
        todayTotal: '100,00',
        cashIncome: '100,00',
        cardIncome: '0,00',
        outstandingPayments: '1.075,00'
    }

    const cashBalance = {
        initialBalance: hasInitialBalance ? initialBalance : '0,00',
        cashIncome: '100,00',
        cashExpenses: '0,00',
        targetBalance: hasInitialBalance ? '100,00' : '0,00'
    }

    const todayExpenses: Expense[] = []

    const handleSetInitialBalance = () => {
        setHasInitialBalance(true)
        setShowInitialBalanceDialog(false)
    }

    const handleTagesabschlussConfirm = () => {
        // Close the first dialog and open the confirmation dialog
        setShowTagesabschlussDialog(false)
        setTimeout(() => {
            setShowTagesabschlussConfirmDialog(true)
        }, 100)
    }

    const handleBackToTagesabschluss = () => {
        // Go back from confirmation to the main tagesabschluss dialog
        setShowTagesabschlussConfirmDialog(false)
        setTimeout(() => {
            setShowTagesabschlussDialog(true)
        }, 100)
    }

    const handleFinalConfirm = () => {
        // Handle final confirmation logic here
        setShowTagesabschlussConfirmDialog(false)
        // You can add logic like saving the data, showing success message, etc.
    }

    const handleTransactionClick = (transaction: Transaction) => {
        setSelectedTransaction(transaction)
        setShowTagesdetailsDialog(true)
    }

    const getTagesdetailsData = () => {
        if (!selectedTransaction) return null

        return {
            date: selectedTransaction.date,
            time: selectedTransaction.time,
            user: selectedTransaction.user,
            cashAmount: '380,00',
            cardAmount: '250,00',
            totalRevenue: '730,00',
            cashExpenses: '-50,00',
            difference: selectedTransaction.difference || '-5,00',
            notes: '5€ Differenz - Wechselgeld-Fehler',
        }
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Finanzen & Kasse</h1>
                    <p className="text-sm text-gray-600 mt-1">Kassenmanagement, Tagesabschlüsse und Einnahmenübersicht</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2">
                        <Download className="w-4 h-4" />
                        Export
                    </Button>
                    <Button
                        className="gap-2 bg-[#61A175] hover:bg-[#4f8a61]"
                        onClick={() => setShowTagesabschlussDialog(true)}
                    >
                        <Calendar className="w-4 h-4" />
                        Tagesabschluss
                    </Button>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600">Heute Gesamt</p>
                        <TrendingUp className="w-5 h-5 text-gray-400" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{stats.todayTotal} €</p>
                    <p className="text-xs text-gray-500 mt-1">Brutto-Einnahmen heute</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600">Bar-Einnahmen</p>
                        <BsCashStack className="w-5 h-5 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-green-600">↗ {stats.cashIncome} €</p>
                    <p className="text-xs text-gray-500 mt-1">Barzahlungen heute</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600">Karten-Einnahmen</p>
                        <FiCreditCard className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-blue-600">{stats.cardIncome} €</p>
                    <p className="text-xs text-gray-500 mt-1">Kartenzahlungen heute</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600">Offene Beträge</p>
                        <AlertTriangle className="w-5 h-5 text-orange-500" />
                    </div>
                    <p className="text-2xl font-bold text-orange-500">{stats.outstandingPayments} €</p>
                    <p className="text-xs text-gray-500 mt-1">Ausstehende Zahlungen</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-t-lg border-b border-gray-200 mb-0">
                <div className="flex">
                    <button
                        onClick={() => setActiveTab('kassenmanagement')}
                        className={`px-6 py-3 text-sm font-medium transition-colors ${
                            activeTab === 'kassenmanagement'
                                ? 'text-[#61A175] border-b-2 border-[#61A175]'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        Kassenmanagement
                    </button>
                    <button
                        onClick={() => setActiveTab('einnahmen')}
                        className={`px-6 py-3 text-sm font-medium transition-colors ${
                            activeTab === 'einnahmen'
                                ? 'text-[#61A175] border-b-2 border-[#61A175]'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        Einnahmen
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="bg-white rounded-b-lg shadow-sm border border-t-0 border-gray-200 p-6">
                {activeTab === 'kassenmanagement' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Section - Initial Balance Warning & Cash Balance */}
                        <div className="space-y-6">
                            {/* Warning */}
                            {!hasInitialBalance && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <div className="flex items-start gap-3 mb-4">
                                        <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                                        <div>
                                            <h3 className="text-sm font-semibold text-red-900">Anfangsbestand erforderlich</h3>
                                            <p className="text-xs text-red-700 mt-1">
                                                Der Kassenanfangsbestand muss gesetzt werden, bevor Bargeld-Transaktionen gebucht werden können.
                                            </p>
                                        </div>
                                    </div>
                                    <Button 
                                        onClick={() => setShowInitialBalanceDialog(true)}
                                        className="w-full bg-red-600 hover:bg-red-700 text-white gap-2"
                                    >
                                        <DollarSign className="w-4 h-4" />
                                        Anfangsbestand setzen
                                    </Button>
                                </div>
                            )}

                            {/* Cash Balance */}
                            <div className="border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-4">
                                    <BsCashStack className="w-5 h-5 text-gray-700" />
                                    <h3 className="text-lg font-semibold text-gray-900">Kassensaldo</h3>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                        <div className="flex items-center gap-2">
                                            <DollarSign className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm text-gray-600">Anfangsbestand</span>
                                        </div>
                                        <span className="text-sm font-medium text-gray-900">{cashBalance.initialBalance} €</span>
                                    </div>

                                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                        <div className="flex items-center gap-2">
                                            <TrendingUp className="w-4 h-4 text-green-600" />
                                            <span className="text-sm text-gray-600">Bar-Einnahmen</span>
                                        </div>
                                        <span className="text-sm font-medium text-green-600">+{cashBalance.cashIncome} €</span>
                                    </div>

                                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                        <div className="flex items-center gap-2">
                                            <TrendingDown className="w-4 h-4 text-red-600" />
                                            <span className="text-sm text-gray-600">Bar-Ausgaben</span>
                                        </div>
                                        <span className="text-sm font-medium text-red-600">-{cashBalance.cashExpenses} €</span>
                                    </div>

                                    <div className="flex items-center justify-between py-3 bg-[#61A175]/10 rounded-lg px-3 mt-3">
                                        <div className="flex items-center gap-2">
                                            <DollarSign className="w-5 h-5 text-[#61A175]" />
                                            <span className="text-sm font-semibold text-gray-900">Soll-Bestand</span>
                                        </div>
                                        <span className="text-lg font-bold text-[#61A175]">{cashBalance.targetBalance} €</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Middle Section - Today's Expenses */}
                        <div className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-4">
                                <TrendingDown className="w-5 h-5 text-red-600" />
                                <h3 className="text-lg font-semibold text-gray-900">Heutige Ausgaben</h3>
                            </div>

                            {todayExpenses.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                        <TrendingDown className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <p className="text-sm text-gray-500">Keine Ausgaben heute</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {todayExpenses.map(expense => (
                                        <div key={expense.id} className="p-3 border border-gray-200 rounded-lg">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-900">{expense.description}</span>
                                                <span className="text-sm font-bold text-red-600">-{expense.amount} €</span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">{expense.date} {expense.time}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Right Section - Closing History */}
                        <div className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-gray-700" />
                                    <h3 className="text-lg font-semibold text-gray-900">Abschluss-Historie</h3>
                                </div>
                                <Button variant="outline" size="sm" className="gap-2">
                                    <Download className="w-4 h-4" />
                                    Export
                                </Button>
                            </div>

                            {/* Filter Buttons */}
                            <div className="flex gap-2 mb-4">
                                <button
                                    onClick={() => setFilterType('von')}
                                    className={`px-3 py-1.5 text-xs font-medium rounded border transition-colors ${
                                        filterType === 'von'
                                            ? 'bg-gray-100 border-gray-300 text-gray-900'
                                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                    }`}
                                >
                                    Von
                                </button>
                                <button
                                    onClick={() => setFilterType('bis')}
                                    className={`px-3 py-1.5 text-xs font-medium rounded border transition-colors ${
                                        filterType === 'bis'
                                            ? 'bg-gray-100 border-gray-300 text-gray-900'
                                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                    }`}
                                >
                                    Bis
                                </button>
                                <button
                                    onClick={() => setFilterType('alle')}
                                    className={`px-3 py-1.5 text-xs font-medium rounded border transition-colors ${
                                        filterType === 'alle'
                                            ? 'bg-gray-100 border-gray-300 text-gray-900'
                                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                    }`}
                                >
                                    Alle
                                </button>
                            </div>

                            {/* Transaction List */}
                            <div className="space-y-2">
                                {mockTransactions.map(transaction => (
                                    <div
                                        key={transaction.id}
                                        className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                                        onClick={() => handleTransactionClick(transaction)}
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Calendar className="w-3 h-3 text-gray-400" />
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {transaction.date}
                                                    </span>
                                                    <span className="text-xs text-gray-500">{transaction.time}</span>
                                                </div>
                                                <p className="text-xs text-gray-600">von {transaction.user}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-bold text-gray-900">{transaction.amount} €</p>
                                                {transaction.status === 'OK' ? (
                                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600">
                                                        <Check className="w-3 h-3" />
                                                        OK
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600">
                                                        <X className="w-3 h-3" />
                                                        {transaction.difference} €
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'einnahmen' && (
                    <div className="text-center py-12 text-gray-500">
                        Einnahmen-Übersicht kommt bald...
                    </div>
                )}
            </div>

            {/* Initial Balance Dialog */}
            <Dialog open={showInitialBalanceDialog} onOpenChange={setShowInitialBalanceDialog}>
                <DialogContent className="sm:max-w-[540px]">
                    <DialogHeader className="pb-3">
                        <div className="flex items-center gap-2">
                            <Receipt className="w-5 h-5 text-gray-700" />
                            <DialogTitle className="text-lg font-bold text-gray-900">
                                Kassenanfangsbestand setzen
                            </DialogTitle>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                            Geben Sie den gezählten Bargeldbestand zu Beginn des Tages ein.
                        </p>
                    </DialogHeader>
                    <div className="space-y-4 py-3">
                        <div>
                            <label className="text-sm font-semibold text-gray-900 mb-2 block">
                                Betrag *
                            </label>
                            <div className="relative">
                                <Input
                                    type="text"
                                    value={initialBalance}
                                    onChange={(e) => setInitialBalance(e.target.value)}
                                    placeholder="0,00"
                                    className="text-right pr-8"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                                    €
                                </span>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-gray-900 mb-2 block">
                                Notiz (optional)
                            </label>
                            <Textarea
                                value={initialBalanceNote}
                                onChange={(e) => setInitialBalanceNote(e.target.value)}
                                placeholder="z.B. Gezählt von Max Mustermann..."
                                className="min-h-[80px] resize-none"
                            />
                        </div>
                        <div className="flex gap-2 justify-end pt-2">
                            <Button
                                variant="outline"
                                onClick={() => setShowInitialBalanceDialog(false)}
                            >
                                Abbrechen
                            </Button>
                            <Button
                                className="bg-[#61A175] hover:bg-[#4f8a61] text-white gap-2"
                                onClick={handleSetInitialBalance}
                            >
                                <Check className="w-4 h-4" />
                                Bestätigen
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Tagesabschluss Dialog */}
            <TagesabschlussDialog
                isOpen={showTagesabschlussDialog}
                onClose={() => setShowTagesabschlussDialog(false)}
                onConfirm={handleTagesabschlussConfirm}
            />

            {/* Tagesabschluss Confirmation Dialog */}
            <TagesabschlussConfirmDialog
                isOpen={showTagesabschlussConfirmDialog}
                onClose={() => setShowTagesabschlussConfirmDialog(false)}
                onBack={handleBackToTagesabschluss}
                onConfirm={handleFinalConfirm}
            />

            {/* Tagesdetails Dialog */}
            <TagesdetailsDialog
                isOpen={showTagesdetailsDialog}
                onClose={() => setShowTagesdetailsDialog(false)}
                transaction={getTagesdetailsData()}
            />
        </div>
    )
}
