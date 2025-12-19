import React from 'react'
import { useForm } from 'react-hook-form'
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { postSuggestion } from '@/apis/suggestionsApis'
import toast from 'react-hot-toast'

interface ContactFormValues {
    name: string
    firma: string
    email: string
    telefon: string
    category: string
    message: string
}
export default function ContactPage() {
    const form = useForm<ContactFormValues>({
        defaultValues: {
            name: "",
            category: '',
            firma: "",
            email: "",
            telefon: "",
            message: "",
        },
        mode: "onBlur",
    })

    async function onSubmit(data: ContactFormValues) {
        try {
            const suggestionData = {
                name: data.name,
                email: data.email,
                phone: data.telefon,
                firma: data.firma,
                category: data.category,
                suggestion: data.message,
            };

            const response = await postSuggestion(suggestionData);
            // console.log('Success:', response);
            form.reset();
            toast.success('Ihre Nachricht wurde erfolgreich gesendet!');

        } catch (error) {
            // toast.error(error as string);
            // console.error('Submission error:', error);
        }
    }

    return (
        <div className="my-14">
            <h1 className="text-2xl font-bold mb-6 capitalize">VERBESSERUNGSVORSCHLAG/MODELLWUNSCH</h1>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    {form.formState.errors.root && (
                        <div className="text-red-500 text-sm mb-4">
                            {form.formState.errors.root.message}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="name"
                            rules={{ required: "Name ist erforderlich" }}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>NAME</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Ihr Name"
                                            {...field}
                                            className={form.formState.errors.name ? "border-red-500" : "border border-gray-500"}
                                        />
                                    </FormControl>
                                    <div className="min-h-[20px]">
                                        <FormMessage />
                                    </div>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="firma"
                            rules={{ required: "Firma ist erforderlich" }}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>FIRMA</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Ihre Firma"
                                            {...field}
                                            className={form.formState.errors.firma ? "border-red-500" : "border border-gray-500"}
                                        />
                                    </FormControl>
                                    <div className="min-h-[20px]">
                                        <FormMessage />
                                    </div>
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="email"
                            rules={{
                                
                                required: "E-Mail ist erforderlich",
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: "Ungültige E-Mail-Adresse"
                                }
                            }}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>E-MAIL</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="email"
                                            placeholder="Ihre E-Mail"
                                            {...field}
                                            className={form.formState.errors.email ? "border-red-500" : "border border-gray-500"}
                                        />
                                    </FormControl>
                                    <div className="min-h-[20px]">
                                        <FormMessage />
                                    </div>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="telefon"
                            rules={{
                                required: "Telefon ist erforderlich",
                                pattern: {
                                    value: /^[0-9+\-\s()]*$/,
                                    message: "Ungültige Telefonnummer"
                                }
                            }}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>TELEFON</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="tel"
                                            placeholder="Ihre Telefonnummer"
                                            {...field}
                                            className={form.formState.errors.telefon ? "border-red-500" : "border border-gray-500"}
                                        />
                                    </FormControl>
                                    <div className="min-h-[20px]">
                                        <FormMessage />
                                    </div>
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="category"
                        rules={{ required: "Kategorie ist erforderlich" }}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>KATEGORIE AUSWÄHLEN</FormLabel>
                                <FormControl>
                                    <select
                                        {...field}
                                        className={`w-full px-3 py-2 rounded-md border bg-transparent text-sm cursor-pointer ${form.formState.errors.category ? "border-red-500" : "border border-gray-500"}`}
                                    >
                                        <option value="">Kategorie auswählen</option>
                                        <option value="Allgemein">Allgemein</option>
                                        <option value="Kundenverwaltung">Kundenverwaltung</option>
                                        <option value="Einlagenaufträge">Einlagenaufträge</option>
                                        <option value="Maßschuh & Maßschäfte">Maßschuh & Maßschäfte</option>
                                        <option value="Produktverwaltung">Produktverwaltung</option>
                                        <option value="Sammelbestellungen">Sammelbestellungen</option>
                                        <option value="Terminkalender">Terminkalender</option>
                                        <option value="Mitarbeiterbereich">Mitarbeiterbereich</option>
                                        <option value="Design/UI">Design/UI</option>
                                        <option value="Technisches Problem">Technisches Problem</option>
                                        <option value="Sonstige">Sonstige</option>
                                    </select>
                                </FormControl>
                                <div className="min-h-[20px]">
                                    <FormMessage />
                                </div>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="message"
                        rules={{
                            required: "Nachricht ist erforderlich",
                            minLength: {
                                value: 10,
                                message: "Die Nachricht muss mindestens 10 Zeichen lang sein"
                            }
                        }}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>VERBESSERUNGSVORSCHLAG ODER MODELLWUNSCH...</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Ihre Nachricht"
                                        className={`min-h-[150px] ${form.formState.errors.message ? "border-red-500" : "border border-gray-500"}`}
                                        {...field}
                                    />
                                </FormControl>
                                <div className="min-h-[20px]">
                                    <FormMessage />
                                </div>
                            </FormItem>
                        )}
                    />

                    <div className='flex justify-center'>
                        <Button
                            type="submit"
                            className="px-14 cursor-pointer py-2 bg-[#5B8B7F] hover:bg-[#4a7268]"
                            disabled={form.formState.isSubmitting}
                        >
                            {form.formState.isSubmitting ? "WIRD GESENDET..." : "SENDEN"}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}
