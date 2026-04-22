// TextRenderer Component
// Renders note text with support for special tags, links, and attachment placeholders
// Handles: blockquote, code, strikethrough, URLs, and attachment markers

import React, { useEffect, useRef } from 'react';
import LineBreakRenderer from './renderers/LineBreakRenderer';
import styles from './TextRenderer.module.css';

export default function TextRenderer({ text = '', attachments = [], searchTerm = '' }) {
    const containerRef = useRef(null);

    // Build filename -> attachment ID map
    const attachmentMap = {};
    attachments.forEach(att => {
        if (att.fileName) {
            const fullFilename = att.fileName.split('/').pop();
            const timestampMatch = fullFilename.match(/(\d{8}_\d{6}_\d+)/);
            if (timestampMatch) {
                attachmentMap[timestampMatch[1]] = att.id;
            }
            // Also map full filename (without extension) as fallback
            attachmentMap[fullFilename.replace(/\.[^/.]+$/, '')] = att.id;
        }
    });

    useEffect(() => {
        const handleAttachmentClick = (e) => {
            let target = e.target;
            while (target && target !== e.currentTarget) {
                if (target.dataset?.attachment && target.getAttribute('href')?.startsWith('#')) {
                    e.preventDefault();
                    const attachmentId = target.dataset.attachment;
                    const element = document.getElementById(`attachment-${attachmentId}`);
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        element.classList.add(styles.highlighted);
                        setTimeout(() => element.classList.remove(styles.highlighted), 3000);
                    }
                    return;
                }
                target = target.parentNode;
            }
        };

        const container = containerRef.current;
        if (container) {
            container.addEventListener('click', handleAttachmentClick);
            return () => container.removeEventListener('click', handleAttachmentClick);
        }
    }, []);

    if (!text) {
        return <div className={styles.emptyText}>No content</div>;
    }

    const processTextSequentially = () => {
        let processed = text;

        const toLink = (match, filename) => {
            const id = attachmentMap[filename];
            const href = id
                ? `/api/notes/attachments/${id}`
                : `/api/notes/attachments/${filename}`;
            return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="${styles.attachmentLink}" data-attachment="${filename}">${match}</a>`;
        };

        processed = processed.replace(/\[screenshot_([^\]]+)\]/g, toLink);
        processed = processed.replace(/\[file_([^\]]+)\]/g, toLink);
        processed = processed.replace(/\[attachment_([^\]]+)\]/g, toLink);

        if (processed.includes('{code}')) {
            processed = processed.replace(/\{code\}([\s\S]*?)\{\/code\}/g,
                (match, inner) => `{code}${inner.trim()}{/code}`);
        }
        if (processed.includes('{blockquote}')) {
            processed = processed.replace(/\{blockquote\}([\s\S]*?)\{\/blockquote\}/g,
                (match, inner) => `{blockquote}${inner.trim()}{/blockquote}`);
        }
        if (processed.includes('{strikethrough}')) {
            processed = processed.replace(/\{strikethrough\}([\s\S]*?)\{\/strikethrough\}/g,
                (match, inner) => `{strikethrough}${inner.trim()}{/strikethrough}`);
        }

        return processed;
    };

    return (
        <div ref={containerRef} className={styles.textContainer}>
            <LineBreakRenderer
                text={processTextSequentially()}
                attachmentMap={attachmentMap}
                styles={styles}
                searchTerm={searchTerm}
            />
        </div>
    );
}
