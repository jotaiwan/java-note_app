// frontend/src/hooks/useDropdown.js
import { useState, useRef, useCallback, useEffect } from 'react';

export function useDropdown(initialState = false, onStateChange) {
    const [isOpen, setIsOpen] = useState(initialState);
    const [isHovered, setIsHovered] = useState(false);
    const [isClicked, setIsClicked] = useState(false);
    const [isContentHovered, setIsContentHovered] = useState(false);

    const timeoutRef = useRef(null);
    const dropdownRef = useRef(null);
    const triggerRef = useRef(null);

    // Clear timeout on cleanup
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    // Handle click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
                triggerRef.current && !triggerRef.current.contains(event.target)) {
                closeDropdown();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const openDropdown = useCallback(() => {
        setIsOpen(true);
        if (onStateChange) onStateChange(true);
    }, [onStateChange]);

    const closeDropdown = useCallback(() => {
        setIsOpen(false);
        setIsClicked(false);
        setIsContentHovered(false);
        if (onStateChange) onStateChange(false);
    }, [onStateChange]);

    const toggleDropdown = useCallback((e) => {
        if (e) e.stopPropagation();
        const newState = !isOpen;
        setIsOpen(newState);
        setIsClicked(newState);

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        if (onStateChange) {
            onStateChange(newState);
        }
    }, [isOpen, onStateChange]);

    const handleMouseEnter = useCallback(() => {
        setIsHovered(true);
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        if (!isClicked) {
            openDropdown();
        }
    }, [isClicked, openDropdown]);

    const handleMouseLeave = useCallback(() => {
        setIsHovered(false);
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
            if (!isContentHovered && !isClicked) {
                closeDropdown();
            }
        }, 150);
    }, [isContentHovered, isClicked, closeDropdown]);

    const handleContentMouseEnter = useCallback(() => {
        setIsContentHovered(true);
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    }, []);

    const handleContentMouseLeave = useCallback(() => {
        setIsContentHovered(false);
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
            if (!isHovered && !isClicked) {
                closeDropdown();
            }
        }, 150);
    }, [isHovered, isClicked, closeDropdown]);

    return {
        // State
        isOpen,
        isHovered,
        isClicked,
        isContentHovered,

        // Refs
        dropdownRef,
        triggerRef,
        timeoutRef,

        // Actions
        openDropdown,
        closeDropdown,
        toggleDropdown,
        handleMouseEnter,
        handleMouseLeave,
        handleContentMouseEnter,
        handleContentMouseLeave,

        // State setters (if needed externally)
        setIsOpen,
        setIsHovered,
        setIsClicked,
        setIsContentHovered
    };
}