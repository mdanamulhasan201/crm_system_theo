import React, { useState, useRef } from 'react'
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
import { Textarea } from "@/components/ui/textarea"
import { postSuggestion } from '@/apis/suggestionsApis'
import toast from 'react-hot-toast'

interface ContactFormValues {
    category: string
    message: string
    images: FileList | null
}
export default function ContactPage() {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([])
    const fileInputRef = useRef<HTMLInputElement>(null)

    const form = useForm<ContactFormValues>({
        defaultValues: {
            category: '',
            message: "",
            images: null,
        },
        mode: "onBlur",
    })

    async function onSubmit(data: ContactFormValues) {
        try {
            // Create FormData for file upload
            const formData = new FormData()
            formData.append('category', data.category)
            formData.append('suggestion', data.message)
            
            // Append all selected images
            if (data.images && data.images.length > 0) {
                Array.from(data.images).forEach((file, index) => {
                    formData.append('images', file)
                })
            }

            const response = await postSuggestion(formData);
            // console.log('Success:', response);
            form.reset();
            setSelectedFiles([]);
            // Clear file input field
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            toast.success('Ihre Nachricht wurde erfolgreich gesendet!');

        } catch (error) {
            toast.error('Fehler beim Senden der Nachricht');
            // console.error('Submission error:', error);
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (files) {
            setSelectedFiles(Array.from(files))
            form.setValue('images', files)
        }
    }

    return (
        <div className="my-14">
            <h1 className="text-2xl font-bold mb-6 capitalize">VERBESSERUNGSVORSCHLAG/MODELLWUNSCH</h1>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" encType="multipart/form-data">
                    {form.formState.errors.root && (
                        <div className="text-red-500 text-sm mb-4">
                            {form.formState.errors.root.message}
                        </div>
                    )}

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

                    <FormField
                        control={form.control}
                        name="images"
                        render={({ field: { onChange, value, ref, ...field } }) => (
                            <FormItem>
                                <FormLabel>BILDER</FormLabel>
                                <FormControl>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        className={`w-full px-3 py-2 rounded-md border bg-transparent text-sm cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#5B8B7F] file:text-white hover:file:bg-[#4a7268] ${form.formState.errors.images ? "border-red-500" : "border border-gray-500"}`}
                                        onChange={(e) => {
                                            handleFileChange(e);
                                            onChange(e.target.files);
                                        }}
                                        {...field}
                                    />
                                </FormControl>
                                {selectedFiles.length > 0 && (
                                    <div className="mt-2 space-y-1">
                                        <p className="text-sm text-gray-600">Ausgewählte Dateien:</p>
                                        {selectedFiles.map((file, index) => (
                                            <p key={index} className="text-xs text-gray-500">
                                                {file.name} ({(file.size / 1024).toFixed(2)} KB)
                                            </p>
                                        ))}
                                    </div>
                                )}
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
