// frontend/src/components/notes/TextRenderer/renderers/LinkRenderer.jsx
import React from 'react';
import styles from './LinkRenderer.module.css';

export default function LinkRenderer({ text = '' }) {
    if (!text) return null;

    const processLinks = (content) => {
        const urlPattern = /(https?:\/\/[^\s<]+?)(?=[\s.,!?;:)]|$)/g;
        const urls = [...content.matchAll(urlPattern)];
        if (urls.length === 0) return content;

        return content.replace(urlPattern, (url) =>
            `<a href="${url}" target="_blank" rel="noopener noreferrer" class="${styles.urlLink}">${url}</a>`
        );
    };

    try {
        const processedText = processLinks(text);
        if (processedText !== text) {
            return (
                <div
                    className={styles.linkContainer}
                    dangerouslySetInnerHTML={{ __html: processedText }}
                />
            );
        }
        return <div className={styles.linkContainer}>{text}</div>;
    } catch (error) {
        console.error('LinkRenderer error:', error);
        return <span className={styles.error}>Error processing links: {error.message}</span>;
    }
}
