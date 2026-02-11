"use client";

import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
    createEinlage,
    getAllEinlagen,
    getEinlageById,
    updateEinlage,
    deleteEinlage
} from '@/apis/einlagenApis';

interface Einlage {
    id?: string;
    name: string;
    description?: string;
    price: number;
    image?: string;
}

interface EinlageFormData {
    id?: string;
    name: string;
    description: string;
    price: number;
    image?: string;
    imageFile?: File;
}

export const useEinlagen = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [einlagen, setEinlagen] = useState<Einlage[]>([]);

    // Create einlage
    const create = useCallback(async (data: EinlageFormData) => {
        setIsLoading(true);
        setError(null);
        try {
            // Validate required fields
            if (!data.name || !data.name.trim()) {
                const errorMessage = 'EINLAGE ist erforderlich';
                setError(errorMessage);
                toast.error(errorMessage);
                throw new Error(errorMessage);
            }

            // Price is optional, default to 0 if not provided or invalid
            const price = data.price !== undefined && data.price !== null ? data.price : 0;
            if (price < 0) {
                const errorMessage = 'Preis muss eine gültige Zahl sein (0 oder größer)';
                setError(errorMessage);
                toast.error(errorMessage);
                throw new Error(errorMessage);
            }

            const formData = new FormData();
            formData.append('name', data.name.trim());
            formData.append('price', price.toString());

            if (data.description) {
                formData.append('description', data.description);
            }

            // Handle image - File or data URL (optional)
            if (data.imageFile instanceof File) {
                formData.append('image', data.imageFile);
            } else if (data.image && typeof data.image === 'string' && data.image.startsWith('data:')) {
                // Convert data URL to blob
                const response = await fetch(data.image);
                const blob = await response.blob();
                formData.append('image', blob, 'image.png');
            } else if (data.image && typeof data.image === 'string' && data.image.startsWith('http')) {
                // If it's an existing URL, we might need to fetch it or send the URL
                // For now, let's fetch it and convert to blob
                try {
                    const response = await fetch(data.image);
                    const blob = await response.blob();
                    formData.append('image', blob, 'image.png');
                } catch (fetchError) {
                    // If fetch fails, send the URL as a string
                    formData.append('image', data.image);
                }
            }

            const response = await createEinlage(formData);
            toast.success('Einlage erfolgreich erstellt!');
            return response;
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || 'Fehler beim Erstellen der Einlage';
            setError(errorMessage);
            toast.error(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Get all einlagen
    const getAll = useCallback(async (page: number = 1, limit: number = 10) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await getAllEinlagen(page, limit);
            setEinlagen(response.data || []);
            return response;
        } catch (err: any) {
            const message = err?.response?.data?.message || err?.message || 'Fehler beim Laden der Einlagen';
            setError(message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Get einlage by id
    const getById = useCallback(async (id: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await getEinlageById(id);
            return response;
        } catch (err: any) {
            const message = err?.response?.data?.message || err?.message || 'Fehler beim Laden der Einlage';
            setError(message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Update einlage
    const update = useCallback(async (data: EinlageFormData) => {
        if (!data.id) {
            throw new Error('Einlage ID ist erforderlich für die Aktualisierung');
        }

        setIsLoading(true);
        setError(null);
        try {
            // Validate required fields
            if (!data.name || !data.name.trim()) {
                const errorMessage = 'EINLAGE ist erforderlich';
                setError(errorMessage);
                toast.error(errorMessage);
                throw new Error(errorMessage);
            }

            // Price is optional, default to 0 if not provided or invalid
            const price = data.price !== undefined && data.price !== null ? data.price : 0;
            if (price < 0) {
                const errorMessage = 'Preis muss eine gültige Zahl sein (0 oder größer)';
                setError(errorMessage);
                toast.error(errorMessage);
                throw new Error(errorMessage);
            }

            const formData = new FormData();
            formData.append('name', data.name.trim());
            formData.append('price', price.toString());

            if (data.description) {
                formData.append('description', data.description);
            }

            // Handle image - File or data URL
            // For update, image might be optional if keeping existing one
            if (data.imageFile instanceof File) {
                formData.append('image', data.imageFile);
            } else if (data.image && typeof data.image === 'string' && data.image.startsWith('data:')) {
                // Convert data URL to blob
                const response = await fetch(data.image);
                const blob = await response.blob();
                formData.append('image', blob, 'image.png');
            } else if (data.image && typeof data.image === 'string' && data.image.startsWith('http')) {
                // If it's an existing URL, fetch it and convert to blob
                try {
                    const response = await fetch(data.image);
                    const blob = await response.blob();
                    formData.append('image', blob, 'image.png');
                } catch (fetchError) {
                    // If fetch fails, send the URL as a string
                    formData.append('image', data.image);
                }
            }

            const response = await updateEinlage(data.id, formData);
            toast.success('Einlage erfolgreich aktualisiert!');
            return response;
        } catch (err: any) {
            const message = err?.response?.data?.message || err?.message || 'Fehler beim Aktualisieren der Einlage';
            setError(message);
            toast.error(message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Delete einlage
    const remove = useCallback(async (id: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await deleteEinlage(id);
            toast.success('Einlage erfolgreich gelöscht!');
            return response;
        } catch (err: any) {
            const message = err?.response?.data?.message || err?.message || 'Fehler beim Löschen der Einlage';
            setError(message);
            toast.error(message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Delete multiple einlagen
    const removeMultiple = useCallback(async (ids: string[]) => {
        setIsLoading(true);
        setError(null);
        try {
            const deletePromises = ids.map(id => deleteEinlage(id));
            await Promise.all(deletePromises);
            toast.success(`${ids.length} Einlage(n) erfolgreich gelöscht!`);
        } catch (err: any) {
            const message = err?.response?.data?.message || err?.message || 'Fehler beim Löschen der Einlagen';
            setError(message);
            toast.error(message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        create,
        getAll,
        getById,
        update,
        remove,
        removeMultiple,
        einlagen,
        isLoading,
        error,
        clearError,
    };
};
