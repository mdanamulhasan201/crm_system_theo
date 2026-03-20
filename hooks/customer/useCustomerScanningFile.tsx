'use client'
import { useState, useCallback } from 'react';
import { addNewScannerFile } from '@/apis/customerApis';
import toast from 'react-hot-toast';

interface FilePreview {
    fieldName: string;
    preview: string;
    file: File;
}

interface UseCustomerScanningFileReturn {
    filePreviews: FilePreview[];
    isSubmitting: boolean;
    handleFileUpload: (fieldName: string, event: React.ChangeEvent<HTMLInputElement>) => File | null;
    setFileDirectly: (fieldName: string, file: File) => void;
    removeFile: (fieldName: string) => void;
    submitScanningFile: (customerId: string, data: any) => Promise<boolean>;
    resetForm: () => void;
    getFileIcon: (fieldName: string) => 'image' | '3d' | 'csv';
    getFileLabel: (fieldName: string) => string;
    getFileAccept: (fieldName: string) => string;
    getFileFields: () => string[];
    getThreeDModelFields: () => string[];
}

export const useCustomerScanningFile = (): UseCustomerScanningFileReturn => {
    const [filePreviews, setFilePreviews] = useState<FilePreview[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFileUpload = (fieldName: string, event: React.ChangeEvent<HTMLInputElement>): File | null => {
        const file = event.target.files?.[0];
        if (!file) return null;

        // Remove existing preview for this field
        setFilePreviews(prev => prev.filter(p => p.fieldName !== fieldName));

        // Create preview for image files
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const preview = e.target?.result as string;
                setFilePreviews(prev => [...prev, { fieldName, preview, file }]);
            };
            reader.readAsDataURL(file);
        } else {
            // For non-image files, just store the file without preview
            setFilePreviews(prev => [...prev, { fieldName, preview: '', file }]);
        }

        return file;
    };

    const setFileDirectly = (fieldName: string, file: File) => {
        setFilePreviews(prev => prev.filter(p => p.fieldName !== fieldName));
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const preview = e.target?.result as string;
                setFilePreviews(prev => [...prev, { fieldName, preview, file }]);
            };
            reader.readAsDataURL(file);
        } else {
            setFilePreviews(prev => [...prev, { fieldName, preview: '', file }]);
        }
    };

    const removeFile = (fieldName: string) => {
        setFilePreviews(prev => prev.filter(p => p.fieldName !== fieldName));
    };

    const submitScanningFile = async (customerId: string, data: any): Promise<boolean> => {
        setIsSubmitting(true);
        try {
            const formData = new FormData();

            // Add all files to form data
            filePreviews.forEach(({ fieldName, file }) => {
                formData.append(fieldName, file);
            });

            // Add any additional data
            Object.keys(data).forEach(key => {
                if (data[key] !== undefined && data[key] !== '') {
                    formData.append(key, data[key]);
                }
            });

            await addNewScannerFile(customerId, formData);
            toast.success('Scanning file uploaded successfully!');
            return true;
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || error.message || 'Failed to upload scanning file';
            toast.error(errorMessage);
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = useCallback(() => {
        setFilePreviews([]);
    }, []);

    const getFileIcon = (fieldName: string): 'image' | '3d' | 'csv' => {
        if (fieldName.includes('picture')) {
            return 'image';
        } else if (fieldName.includes('threed_model')) {
            return '3d';
        } else if (fieldName.includes('csv')) {
            return 'csv';
        }
        return 'image';
    };

    const getFileLabel = (fieldName: string): string => {
        const labels: Record<string, string> = {
            picture_10: 'Picture 10',
            picture_23: 'Picture 23',
            threed_model_left: '3D Model Left (.stl)',
            picture_17: 'Picture 17',
            picture_11: 'Picture 11',
            picture_24: 'Picture 24',
            threed_model_right: '3D Model Right (.stl)',
            picture_16: 'Picture 16',
            csvFile: 'CSV File'
        };
        return labels[fieldName] || fieldName;
    };

    const getFileAccept = (fieldName: string): string => {
        if (fieldName.includes('picture')) {
            return '.jpg,.jpeg,.png,.gif';
        } else if (fieldName.includes('threed_model')) {
            return '.stl,.obj';
        } else if (fieldName.includes('csv')) {
            return '.csv';
        }
        return '*';
    };

    const getFileFields = (): string[] => [
        'picture_10',
        'picture_11',
        'picture_16',
        'picture_17',
        'picture_23',
        'picture_24',
        'csvFile'
    ];

    const getThreeDModelFields = (): string[] => [
        'threed_model_left',
        'threed_model_right'
    ];

    return {
        filePreviews,
        isSubmitting,
        handleFileUpload,
        setFileDirectly,
        removeFile,
        submitScanningFile,
        resetForm,
        getFileIcon,
        getFileLabel,
        getFileAccept,
        getFileFields,
        getThreeDModelFields
    };
};
