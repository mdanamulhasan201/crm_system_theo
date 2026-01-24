'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'

interface MessageType {
  id: string
  label: string
  vorschau: boolean
  whatsapp: boolean
  email: boolean
}

// Message templates for each message type
const messageTemplates: Record<string, string> = {
  bewertungsanfrage: `Guten Tag {{Vorname}},

wenn Sie möchten, freuen wir uns über eine kurze Rückmeldung zu Ihrer Versorgung bei uns.

Ihr Feedback hilft uns sehr, unsere Qualität weiter zu verbessern.

Vielen Dank und alles Gute.`,

  abholbereit: `Guten Tag {{Vorname}},

Ihre {{Produkt}} sind ab {{Datum}} um {{Uhrzeit}} in unserer Filiale {{Filiale}} abholbereit.

Bitte bringen Sie — falls vorhanden — Ihre bisherigen Einlagen oder Schuhe zur Anpassung mit.

Wir freuen uns auf Sie.`,

  terminerinnerung: `Guten Tag {{Vorname}},

zur Erinnerung: Morgen um {{Uhrzeit}} haben Sie Ihren Termin bei uns in der Filiale {{Filiale}}.

Falls Sie den Termin verschieben möchten, geben Sie uns bitte kurz Bescheid.`,

  terminbestaetigung: `Vielen Dank {{Vorname}},

Ihr Termin am {{Datum}} um {{Uhrzeit}} in unserer Filiale {{Filiale}} ist bestätigt.

Falls sich etwas ändert, melden Sie sich gerne jederzeit.`,

  terminCheckliste: `Kleiner Hinweis für Ihren Termin morgen:

Bitte bringen Sie — falls vorhanden — Ihre bisherigen Einlagen, Schuhe oder ärztliche Unterlagen mit.

Vielen Dank.`,

  verpassterTermin: `Guten Tag {{Vorname}},

wir haben gesehen, dass Sie Ihren heutigen Termin leider nicht wahrnehmen konnten.

Falls Sie einen neuen Termin benötigen, geben Sie uns gerne kurz Bescheid — wir finden sicher eine passende Lösung.`,

  nachkontrolle: `Guten Tag {{Vorname}},

kurze Nachfrage: Sind Sie mit Ihrer aktuellen Versorgung weiterhin zufrieden, oder gibt es etwas, das wir für Sie anpassen können?`,

  erinnerungVersorgung: `Guten Tag {{Vorname}},

als Hinweis: Ihre Einlagen sind nun seit etwa einem Jahr in Verwendung.

Falls Sie eine Kontrolle oder Erneuerung wünschen, geben Sie uns gerne kurz Bescheid.`,
}

export default function AutomatisierteNachrichten() {
  const [searchName, setSearchName] = useState('')
  const [searchBirthDate, setSearchBirthDate] = useState('')
  const [searchCustomerNumber, setSearchCustomerNumber] = useState('')
  const [displayText, setDisplayText] = useState('')

  const [messageTypes, setMessageTypes] = useState<MessageType[]>([
    { id: 'bewertungsanfrage', label: 'Bewertungsanfrage', vorschau: false, whatsapp: false, email: false },
    { id: 'abholbereit', label: 'Abholbereit', vorschau: false, whatsapp: false, email: false },
    { id: 'terminerinnerung', label: 'Terminerinnerung', vorschau: false, whatsapp: false, email: false },
    { id: 'terminbestaetigung', label: 'Terminbestätigung', vorschau: false, whatsapp: false, email: false },
    { id: 'terminCheckliste', label: 'Termin-Checkliste', vorschau: false, whatsapp: false, email: false },
    { id: 'verpassterTermin', label: 'Verpasster Termin', vorschau: false, whatsapp: false, email: false },
    { id: 'nachkontrolle', label: 'Nachkontrolle', vorschau: false, whatsapp: false, email: false },
    { id: 'erinnerungVersorgung', label: 'Erinnerung Versorgung', vorschau: false, whatsapp: false, email: false },
  ])

  const handleCheckboxChange = (messageId: string, field: 'vorschau' | 'whatsapp' | 'email') => {
    setMessageTypes((prev) =>
      prev.map((msg) => {
        if (msg.id === messageId) {
          const newValue = !msg[field]

          // Update the display text when any checkbox for this message is checked/unchecked
          if (newValue) {
            // Show the text for this message type
            setDisplayText(messageTemplates[messageId] || '')
          } else {
            // Check if any other checkbox for this message is still checked
            const willHaveOtherChecked =
              (field !== 'vorschau' && msg.vorschau) ||
              (field !== 'whatsapp' && msg.whatsapp) ||
              (field !== 'email' && msg.email)

            // If no checkboxes will be checked for this message, clear the text
            if (!willHaveOtherChecked) {
              setDisplayText('')
            }
          }

          return { ...msg, [field]: newValue }
        }

        // Uncheck all checkboxes for other message types (only one message type can be active at a time)
        if (msg.id !== messageId) {
          return { ...msg, vorschau: false, whatsapp: false, email: false }
        }

        return msg
      })
    )
  }

  const handleSearch = () => {
    console.log('Searching for:', { searchName, searchBirthDate, searchCustomerNumber })
    // Search functionality will be implemented later
  }

  const handleSend = () => {
    console.log('Sending messages...')
    // Send functionality will be implemented later
  }

  return (
    <div className='p-4 md:p-6 lg:p-8'>
      {/* Header */}
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-gray-900'>Automatisierte Nachrichten</h1>
      </div>

      {/* Customer Search Section */}
      <div className='bg-white rounded-lg shadow-md p-6 mb-6'>
        <h2 className='text-xl font-semibold text-gray-900 mb-4'>Kundensuche</h2>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
          <Input
            placeholder='Name'
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className='border border-gray-300 rounded-md'
          />
          <Input
            placeholder='Geburtsdatum'
            value={searchBirthDate}
            onChange={(e) => setSearchBirthDate(e.target.value)}
            className='border border-gray-300 rounded-md'
          />
          <Input
            placeholder='Kundennummer'
            value={searchCustomerNumber}
            onChange={(e) => setSearchCustomerNumber(e.target.value)}
            className='border border-gray-300 rounded-md'
          />
        </div>
        <div className='flex justify-end'>
          <Button
            onClick={handleSearch}
            className='bg-[#61A07B] hover:bg-[#528c68] text-white cursor-pointer'
          >
            Suchen
          </Button>
        </div>
      </div>

      {/* Message Types Table */}
      <div className='bg-white rounded-lg shadow-md p-6 mb-6'>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead>
              <tr className='border-b border-gray-300'>
                <th className='text-left p-4 font-semibold text-gray-900'></th>
                <th className='text-center p-4 font-semibold text-gray-900'>Vorschau</th>
                <th className='text-center p-4 font-semibold text-gray-900'>Whats App</th>
                <th className='text-center p-4 font-semibold text-gray-900'>Email</th>
              </tr>
            </thead>
            <tbody>
              {messageTypes.map((messageType) => (
                <tr key={messageType.id} className='border-b border-gray-200 hover:bg-gray-50'>
                  <td className='p-4 text-gray-700'>{messageType.label}</td>
                  <td className='p-4 text-center'>
                    <div className='flex justify-center'>
                      <Checkbox
                        checked={messageType.vorschau}
                        onChange={() => handleCheckboxChange(messageType.id, 'vorschau')}
                        className='border-gray-400 checked:bg-[#61A07B] checked:border-[#61A07B]'
                      />
                    </div>
                  </td>
                  <td className='p-4 text-center'>
                    <div className='flex justify-center'>
                      <Checkbox
                        checked={messageType.whatsapp}
                        onChange={() => handleCheckboxChange(messageType.id, 'whatsapp')}
                        className='border-gray-400 checked:bg-[#61A07B] checked:border-[#61A07B]'
                      />
                    </div>
                  </td>
                  <td className='p-4 text-center'>
                    <div className='flex justify-center'>
                      <Checkbox
                        checked={messageType.email}
                        onChange={() => handleCheckboxChange(messageType.id, 'email')}
                        className='border-gray-400 checked:bg-[#61A07B] checked:border-[#61A07B]'
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Text Area */}
        <div className='mt-6'>
          <label className='block text-sm font-medium text-gray-700 mb-2'>Text:</label>
          <textarea
            value={displayText}
            onChange={(e) => setDisplayText(e.target.value)}
            className='w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#61A07B] focus:border-transparent min-h-[150px]'
            placeholder='Wählen Sie eine Vorschau aus, um den Text anzuzeigen...'
          />
        </div>

        {/* Send Button */}
        <div className='flex justify-center mt-6'>
          <Button
            onClick={handleSend}
            className='bg-[#61A07B] hover:bg-[#528c68] text-white cursor-pointer px-12'
          >
            SENDEN
          </Button>
        </div>
      </div>
    </div>
  )
}
