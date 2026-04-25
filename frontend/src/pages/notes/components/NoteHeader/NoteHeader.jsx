import React, { useState, useRef, useEffect, useCallback } from 'react';
import styles from './NoteHeader.module.css';
import { EmojiPicker } from '../../../../components/emoji';
import NoteMenu from '../NoteMenu/NoteMenu';
import StockTicker from '../../../../components/stockTicker';
import { useRunningEnv } from '../../../../hooks/useRunningEnv'; // Add this import

// Import your hooks
import { useForm } from '../../../../hooks/useForm';
import { useCopyToClipboard } from '../../../../hooks/useCopyToClipboard';

export default function NoteHeader({
    onSearch,
    onAddClick,
    onOpenSqlPreview,
    onMenuClick,
    onClearSearch,
    triggerTerm = '',
    onTriggerConsumed
}) {
    const { values, handleChange, resetForm } = useForm({
        searchTerm: ''
    });

    // Add environment detection
    const { runningEnv, isLoading: envLoading, isDocker, isShell } = useRunningEnv();

    // 2. State for file upload
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    // 3. Use copy to clipboard hook
    const { isCopied, copyToClipboard } = useCopyToClipboard();

    // 4. Track if search is from submit or from debounce
    const [isSearching, setIsSearching] = useState(false);
    const prevInputRef = useRef('');

    // 5. When triggerTerm changes to a non-empty value (from recent searches),
    //    run the search immediately WITHOUT touching the input box.
    const prevTriggerRef = useRef('');
    useEffect(() => {
        if (triggerTerm && triggerTerm !== prevTriggerRef.current) {
            prevTriggerRef.current = triggerTerm;
            if (onSearch) {
                setIsSearching(true);
                Promise.resolve(onSearch(triggerTerm)).finally(() => {
                    setIsSearching(false);
                    prevTriggerRef.current = '';
                    if (onTriggerConsumed) onTriggerConsumed();
                });
            }
        }
    }, [triggerTerm, onSearch, onTriggerConsumed]);

    // 6. Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Ctrl+I to trigger import
            if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
                e.preventDefault();
                fileInputRef.current?.click();
            }

            // Escape to clear search
            if (e.key === 'Escape' && values.searchTerm) {
                handleClear();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [values.searchTerm]);

    // Debounced search effect
    useEffect(() => {
        const current = values.searchTerm;
        const timer = setTimeout(() => {
            if (!current.trim() && prevInputRef.current && onSearch) {
                prevInputRef.current = '';
                onSearch('');
                setIsSearching(false);
            }
        }, 300);

        if (current.trim()) {
            prevInputRef.current = current;
        }

        return () => clearTimeout(timer);
    }, [values.searchTerm, onSearch]);

    // File handling functions
    const handleFileSelect = useCallback(async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const validExtensions = ['.txt', '.csv'];
        const extension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));

        if (!validExtensions.includes(extension)) {
            alert('Please select a .txt or .csv file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('File too large. Maximum size is 5MB');
            return;
        }

        setSelectedFile(file);
        event.target.value = '';
    }, []);

    const handleGenerateSQL = useCallback(async () => {
        if (!selectedFile) {
            alert('Please select a file first');
            return;
        }

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('sqlFile', selectedFile);

            const response = await fetch('/api/generate-sql/notes', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
                onOpenSqlPreview({
                    fileInfo: result.data.fileInfo,
                    parsedData: result.data.parsedData,
                    sqlStatements: result.data.sqlStatements,
                    summary: result.data.summary
                });
                setSelectedFile(null);
            } else {
                alert(`Error: ${result.error || 'Failed to generate SQL'}`);
            }
        } catch (error) {
            console.error('Error generating SQL:', error);
            alert(`Failed to generate SQL: ${error.message}`);
        } finally {
            setIsUploading(false);
        }
    }, [selectedFile, onOpenSqlPreview]);

    const handleCancelFile = useCallback(() => {
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, []);

    const handleImportClick = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const copyFileInfo = useCallback(() => {
        if (selectedFile) {
            const fileInfo = `File: ${selectedFile.name}, Size: ${Math.round(selectedFile.size / 1024)}KB`;
            copyToClipboard(fileInfo);
        }
    }, [selectedFile, copyToClipboard]);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        if (onSearch && values.searchTerm.trim()) {
            setIsSearching(true);
            try {
                await onSearch(values.searchTerm.trim());
                prevInputRef.current = '';
                resetForm();
            } finally {
                setIsSearching(false);
            }
        }
    }, [values.searchTerm, onSearch, resetForm]);

    const handleClear = useCallback(() => {
        resetForm();
        setIsSearching(false);
        if (onClearSearch) {
            onClearSearch();
        } else if (onSearch) {
            onSearch('');
        }
    }, [resetForm, onClearSearch, onSearch]);

    const handleInputChange = useCallback((e) => {
        handleChange(e);
    }, [handleChange]);

    const handleEmojiSelect = useCallback((_emoji) => {
        // Optional: add emoji to search
    }, []);

    // Get environment icon and text
    const getEnvDisplay = () => {
        if (envLoading) {
            return { icon: '⏳', text: 'Detecting...', color: '#888' };
        }
        if (isDocker) {
            return { icon: '🐳', text: 'Docker', color: '#2496ED' };
        }
        if (isShell) {
            return { icon: '🖥️', text: 'Shell', color: '#4CAF50' };
        }
        return { icon: '❓', text: 'Unknown', color: '#888' };
    };

    const envDisplay = getEnvDisplay();

    return (
        <div className={styles.header}>
            {/* Hidden file input */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".txt,.csv"
                style={{ display: 'none' }}
            />

            <div className={styles.searchSection}>
                <NoteMenu onMenuClick={onMenuClick} />

                <div className={styles.stockTickerContainer}>
                    <StockTicker symbols={['TRIP']} source="finnhub" />
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.searchContainer}>
                        <input
                            type="text"
                            name="searchTerm"
                            placeholder="Search note content or ticket number..."
                            value={values.searchTerm}
                            onChange={handleInputChange}
                            className={styles.input}
                            aria-label="Search notes"
                        />
                        <div className={styles.buttons}>
                            <button
                                type="submit"
                                className={styles.searchBtn}
                                title="Search"
                                aria-label="Search"
                                disabled={isSearching}
                            >
                                {isSearching ? '⏳' : '🔍'}
                            </button>
                            <button
                                type="button"
                                onClick={handleClear}
                                className={styles.clearBtn}
                                title="Clear search"
                                aria-label="Clear search"
                                disabled={!values.searchTerm.trim()}
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* File selection area */}
            {selectedFile && (
                <div className={styles.fileSelection}>
                    <span className={styles.fileName}>
                        📄 {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                        {isCopied && <span style={{ marginLeft: '8px', color: 'green' }}>✓ Copied!</span>}
                    </span>
                    <div className={styles.fileActions}>
                        <button
                            onClick={copyFileInfo}
                            className={styles.copyBtn}
                            title="Copy file info to clipboard"
                        >
                            📋
                        </button>
                        <button
                            onClick={handleGenerateSQL}
                            className={styles.generateBtn}
                            disabled={isUploading}
                        >
                            {isUploading ? 'Generating...' : 'Generate SQL'}
                        </button>
                        <button
                            onClick={handleCancelFile}
                            className={styles.cancelBtn}
                            disabled={isUploading}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Tech stack badges with environment indicator */}
            <div className={styles.techBadges}>
                <span className={styles.techBadge} style={{ background: '#e76f00', color: '#fff' }}>
                    <svg width="14" height="14" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
                        <path d="M11.2 24.5s-1.2.7.86.94c2.5.28 3.78.24 6.53-.27 0 0 .72.45 1.73.84-6.15 2.64-13.93-.15-9.12-1.51zM10.4 21.1s-1.35 1 .71 1.21c2.67.28 4.78.3 8.43-.4 0 0 .5.51 1.28.79-7.47 2.18-15.8.17-10.42-1.6z" />
                        <path d="M17.7 14.9c1.52 1.75-.4 3.33-.4 3.33s3.86-2 2.09-4.49c-1.65-2.34-2.92-3.5 3.94-7.5 0 0-10.77 2.69-5.63 8.66z" />
                        <path d="M26.3 27.2s.89.73-.98 1.3c-3.55 1.07-14.77 1.4-17.89.04-1.12-.49 1-1.16 1.67-1.3.7-.15 1.1-.12 1.1-.12-1.26-.89-8.16 1.75-3.5 2.5 12.69 2.06 23.14-.93 19.6-2.42zM11.8 17.5s-5.78 1.37-2.05 1.87c1.58.22 4.73.17 7.67-.08 2.4-.21 4.81-.65 4.81-.65s-.85.36-1.46.78c-5.9 1.55-17.3.83-14.02-.76 2.77-1.35 5.05-1.16 5.05-1.16zM23.3 23.3c6-3.11 3.22-6.1 1.29-5.7-.47.1-.68.19-.68.19s.17-.27.5-.39c3.74-1.31 6.62 3.88-1.24 5.94 0 0 .09-.08.13-.04z" />
                        <path d="M19.4 2s3.3 3.3-3.13 8.37c-5.15 4.07-1.18 6.39 0 9.04-3.01-2.71-5.21-5.1-3.73-7.33C14.54 9.14 20.8 7.5 19.4 2z" />
                        <path d="M12.4 29.9c5.76.37 14.62-.2 14.83-2.93 0 0-.4 1.03-4.76 1.85-4.92.92-11 .81-14.6.22 0 0 .74.61 4.53.86z" />
                    </svg>
                    Java
                </span>
                <span className={styles.techBadge} style={{ background: '#149eca', color: '#fff' }}>
                    <svg width="14" height="14" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
                        <path d="M14.314 3l-2.3 4.285L9.715 3H2l12 22L26 3z" />
                    </svg>
                    React
                </span>
                {/* Add environment badge */}
                <span
                    className={styles.techBadge}
                    style={{
                        background: envDisplay.color,
                        color: '#fff',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                    }}
                    title={`Running in ${envDisplay.text} environment`}
                >
                    <span>{envDisplay.icon}</span>
                    <span>{envDisplay.text}</span>
                </span>
            </div>

            {/* Right side buttons */}
            <div className={styles.rightButtons}>
                <div className={styles.emojiButtonWrapper}>
                    <EmojiPicker
                        onSelect={handleEmojiSelect}
                        position="bottom-left"
                    />
                </div>

                <button
                    onClick={handleImportClick}
                    className={styles.importButton}
                    title="Import notes from file"
                    disabled={isUploading}
                >
                    <span className={styles.importIcon}>📁</span>
                    <span className={styles.importText}>Import</span>
                </button>

                <button
                    onClick={onAddClick}
                    className={styles.addButton}
                    title="Add new note"
                >
                    <span className={styles.plusIcon}>+</span>
                    <span className={styles.addText}>Add Note</span>
                </button>
            </div>
        </div>
    );
}