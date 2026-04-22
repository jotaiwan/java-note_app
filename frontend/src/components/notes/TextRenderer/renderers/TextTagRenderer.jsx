// frontend/src/components/notes/TextRenderer/renderers/TextTagRenderer.jsx
import React from 'react';
import styles from './TextTagRenderer.module.css';

export default function TextTagRenderer({ text = '' }) {
    if (!text || typeof text !== 'string') return null;

    const processAllTags = (content) => {
        let result = content;

        result = result.replace(
            /\{blockquote\}([\s\S]*?)\{\/blockquote\}/g,
            (match, innerContent) =>
                `<blockquote class="${styles.blockquote}">${innerContent}</blockquote>`
        );

        result = result.replace(
            /\{code\}([\s\S]*?)\{\/code\}/g,
            (match, innerContent) => {
                const cleanedCode = innerContent
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#039;');
                return `<pre class="${styles.codeBlock}"><code>${cleanedCode}</code></pre>`;
            }
        );

        result = result.replace(
            /\{strikethrough\}([\s\S]*?)\{\/strikethrough\}/g,
            (match, innerContent) =>
                `<del class="${styles.strikethrough}">${innerContent}</del>`
        );

        return result;
    };

    try {
        const processedText = processAllTags(text);
        const hasChanges = processedText !== text;

        if (hasChanges) {
            return (
                <div
                    className={styles.tagContainer}
                    dangerouslySetInnerHTML={{ __html: processedText }}
                    data-testid="text-tag-renderer"
                />
            );
        }

        if (text.includes('<') || text.includes('>') || text.includes('&')) {
            return (
                <div
                    className={styles.tagContainer}
                    dangerouslySetInnerHTML={{ __html: text }}
                />
            );
        }

        return <div className={styles.tagContainer}>{text}</div>;
    } catch (error) {
        console.error('TextTagRenderer error:', error);
        return (
            <div className={styles.errorContainer}>
                <div className={styles.errorTitle}>⚠️ Tag Processing Error</div>
                <div className={styles.errorMessage}>{error.message}</div>
                <div className={styles.originalText}>
                    <strong>Original text:</strong>
                    <pre>{text?.substring(0, 500) || 'No text'}</pre>
                </div>
            </div>
        );
    }
}
