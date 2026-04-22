// frontend/src/hooks/useImageUpload.js
import { useState, useCallback, useEffect, useRef } from 'react';

export function useImageUpload() {
    const [images, setImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const imagePreviewsRef = useRef(imagePreviews); // 使用 ref 來追踪

    // 同步 ref
    useEffect(() => {
        imagePreviewsRef.current = imagePreviews;
    }, [imagePreviews]);

    // Generate filename for saving (with timestamp)
    const generateFilename = useCallback((index) => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const milliseconds = String(now.getMilliseconds()).padStart(3, '0');

        return `screenshot_${year}${month}${day}_${hours}${minutes}${seconds}_${milliseconds}.png`;
    }, []);

    // Generate display name from filename (remove .png extension)
    const getDisplayName = useCallback((filename) => {
        return filename.replace(/\.png$/i, '');
    }, []);

    // Handle image paste
    const handleImagePaste = useCallback((event, onImageAdded) => {
        const items = event.clipboardData?.items;
        if (!items) return false;

        for (const item of items) {
            if (item.type.indexOf('image') !== -1) {
                event.preventDefault();
                const file = item.getAsFile();
                if (!file) continue;

                // Generate unique filename with timestamp
                const filename = generateFilename(images.length + 1);
                const displayName = getDisplayName(filename);
                const now = new Date();

                // Create new File object with timestamp filename
                const newFile = new File([file], filename, {
                    type: 'image/png',
                    lastModified: Date.now()
                });

                // Create image preview
                const previewUrl = URL.createObjectURL(newFile);

                const newImage = {
                    id: Date.now() + Math.random(),
                    url: previewUrl,
                    name: filename,
                    displayName: displayName,
                    file: newFile,
                    index: images.length + 1,
                    time: now.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                    }),
                    size: Math.round(newFile.size / 1024)
                };

                // Update state
                setImagePreviews(prev => [...prev, newImage]);
                setImages(prev => [...prev, newFile]);

                if (onImageAdded) {
                    onImageAdded(newImage);
                }

                return true;
            }
        }
        return false;
    }, [images.length, generateFilename, getDisplayName]);

    // Add image from file
    const addImage = useCallback((file, onImageAdded) => {
        const filename = generateFilename(images.length + 1);
        const displayName = getDisplayName(filename);
        const now = new Date();

        const newFile = new File([file], filename, {
            type: file.type,
            lastModified: Date.now()
        });

        const previewUrl = URL.createObjectURL(newFile);

        const newImage = {
            id: Date.now() + Math.random(),
            url: previewUrl,
            name: filename,
            displayName: displayName,
            file: newFile,
            index: images.length + 1,
            time: now.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            }),
            size: Math.round(newFile.size / 1024)
        };

        setImagePreviews(prev => [...prev, newImage]);
        setImages(prev => [...prev, newFile]);

        if (onImageAdded) {
            onImageAdded(newImage);
        }

        return newImage;
    }, [images.length, generateFilename, getDisplayName]);

    // Remove image
    const removeImage = useCallback((imageId) => {
        setImagePreviews(prev => {
            const imageToRemove = prev.find(img => img.id === imageId);
            if (!imageToRemove) return prev;

            // Release URL
            URL.revokeObjectURL(imageToRemove.url);

            const filteredPreviews = prev.filter(img => img.id !== imageId);

            // Update indices for remaining images
            const updatedPreviews = filteredPreviews.map((img, idx) => ({
                ...img,
                index: idx + 1
            }));

            // Update images list
            setImages(updatedPreviews.map(img => img.file));

            return updatedPreviews;
        });
    }, []);

    // Clear all images
    const clearImages = useCallback(() => {
        // 使用 ref 而不是 state，避免依賴循環
        imagePreviewsRef.current.forEach(img => {
            if (img.url && img.url.startsWith('blob:')) {
                URL.revokeObjectURL(img.url);
            }
        });
        setImages([]);
        setImagePreviews([]);
    }, []); // 空的依賴數組

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            imagePreviewsRef.current.forEach(img => {
                if (img.url && img.url.startsWith('blob:')) {
                    URL.revokeObjectURL(img.url);
                }
            });
        };
    }, []); // 空的依賴數組

    return {
        images,
        imagePreviews,
        handleImagePaste,
        addImage,
        removeImage,
        clearImages,
        imageCount: images.length
    };
}