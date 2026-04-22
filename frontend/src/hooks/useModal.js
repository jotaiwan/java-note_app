// frontend/src/hooks/useModal.js
import { useState, useCallback } from 'react';

export function useModal(initialState = false) {
    const [isOpen, setIsOpen] = useState(initialState);
    const [modalData, setModalData] = useState(null);

    const openModal = useCallback((data = null) => {
        setIsOpen(true);
        if (data) setModalData(data);
    }, []);

    const closeModal = useCallback(() => {
        setIsOpen(false);
        setModalData(null);
    }, []);

    const toggleModal = useCallback(() => {
        setIsOpen(prev => !prev);
    }, []);

    return {
        isOpen,
        modalData,
        openModal,
        closeModal,
        toggleModal,
        setModalData
    };
}