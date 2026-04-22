// frontend/src/hooks/useForm.js
import { useState, useCallback } from 'react';

export function useForm(initialValues = {}, onSubmit) {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setValues(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    }, [errors]);

    const handleSubmit = useCallback(async (e) => {
        if (e) e.preventDefault();
        setIsSubmitting(true);

        try {
            await onSubmit(values);
        } catch (error) {
            console.error('Form submission error:', error);
            setErrors(prev => ({
                ...prev,
                submit: error.message
            }));
        } finally {
            setIsSubmitting(false);
        }
    }, [values, onSubmit]);

    const resetForm = useCallback(() => {
        setValues(initialValues);
        setErrors({});
    }, [initialValues]);

    const setFieldValue = useCallback((name, value) => {
        setValues(prev => ({
            ...prev,
            [name]: value
        }));
    }, []);

    return {
        values,
        errors,
        isSubmitting,
        handleChange,
        handleSubmit,
        resetForm,
        setValues,
        setFieldValue,
        setErrors
    };
}