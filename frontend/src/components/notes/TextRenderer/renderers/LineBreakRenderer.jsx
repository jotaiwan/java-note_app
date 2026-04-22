// frontend/src/components/notes/TextRenderer/renderers/LineBreakRenderer.jsx
import React from 'react';
import styles from './LineBreakRenderer.module.css';

export default function LineBreakRenderer({ text = '', attachmentMap = {}, styles: parentStyles = {}, searchTerm = '' }) {
    if (!text || typeof text !== 'string') {
        return null;
    }

    // Highlight all occurrences of searchTerm in an HTML string (skips inside tags)
    const applySearchHighlight = (html, term) => {
        if (!term || !term.trim()) return html;
        const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${escaped})(?![^<]*>)`, 'gi');
        const highlightClass = parentStyles.searchHighlight || 'searchHighlight';
        return html.replace(regex, `<mark class="${highlightClass}">$1</mark>`);
    };

    // Process special tags and URLs first
    const processSpecialTags = (content) => {
        let processed = content;

        // Process code blocks - protect them from line break processing
        if (processed.includes('{code}')) {
            processed = processed.replace(
                /\{code\}([\s\S]*?)\{\/code\}/g,
                (match, inner) => {
                    // Trim the content to remove leading/trailing newlines and spaces
                    const trimmed = inner.trim();

                    const cleaned = trimmed
                        .replace(/&/g, '&amp;')
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;');

                    // Return as pre/code tag - this will be protected from line break processing
                    return `<pre class="${parentStyles.codeBlock || 'codeBlock'}"><code>${cleaned}</code></pre>`;
                }
            );
        }

        // Process blockquotes
        if (processed.includes('{blockquote}')) {
            processed = processed.replace(
                /\{blockquote\}([\s\S]*?)\{\/blockquote\}/g,
                (match, inner) => {
                    return `<blockquote class="${parentStyles.blockquote || 'blockquote'}">${inner}</blockquote>`;
                }
            );
        }

        // Process strikethrough
        if (processed.includes('{strikethrough}')) {
            processed = processed.replace(
                /\{strikethrough\}([\s\S]*?)\{\/strikethrough\}/g,
                (match, inner) => {
                    return `<del class="${parentStyles.strikethrough || 'strikethrough'}">${inner}</del>`;
                }
            );
        }

        // Process URLs
        const urlRegex = /(https?:\/\/[^\s<>"{}|\\^`[\]]+)/g;
        processed = processed.replace(urlRegex, (url) => {
            return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="${parentStyles.urlLink || 'urlLink'}">${url}</a>`;
        });

        return processed;
    };

    // Function to process line breaks while preserving pre/code blocks
    const processLineBreaksWithProtection = (content) => {
        // First, find and protect all pre/code blocks
        const blocks = [];
        let processedContent = content;
        let blockIndex = 0;

        // Protect <pre> blocks (which contain code)
        const preBlockRegex = /(<pre[^>]*>[\s\S]*?<\/pre>)/g;
        processedContent = processedContent.replace(preBlockRegex, (match) => {
            const placeholder = `__PRE_BLOCK_${blockIndex}__`;
            blocks.push({
                placeholder,
                html: match // Keep the original pre block unchanged
            });
            return placeholder;
        });

        // Now process line breaks in the remaining content
        const processLineBreaks = (text) => {
            // Handle literal newlines
            let normalized = text;

            if (text.includes('\\n\\n')) {
                normalized = normalized.replace(/\\n\\n/g, '\n\n');
            }

            if (text.includes('\\n')) {
                normalized = normalized.replace(/\\n/g, '\n');
            }

            normalized = normalized.replace(/\r\n/g, '\n');
            normalized = normalized.replace(/\r/g, '\n');

            const lines = normalized.split('\n');
            const result = [];
            let inParagraph = false;

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];

                // Check if this line contains a placeholder
                const hasPlaceholder = line.includes('__PRE_BLOCK_');

                const isEmpty = !hasPlaceholder && line.trim() === '';
                const nextLine = lines[i + 1];
                const nextHasPlaceholder = nextLine && nextLine.includes('__PRE_BLOCK_');
                const nextIsEmpty = !nextHasPlaceholder && nextLine && nextLine.trim() === '';

                if (hasPlaceholder) {
                    // This is a placeholder line - close any open paragraph first
                    if (inParagraph) {
                        result.push('</p>');
                        inParagraph = false;
                    }

                    // Add the placeholder as-is (it will be replaced with pre tag later)
                    result.push(line);

                    // Don't start a new paragraph immediately after placeholder
                    // The next non-empty line will start a new paragraph
                    continue;
                }

                if (isEmpty) {
                    // empty line = break to new paragraph
                    if (inParagraph) {
                        result.push('</p>');
                        inParagraph = false;
                    }

                    // add new paragraph if next line is not empty and not a placeholder
                    if (i < lines.length - 1 && !nextIsEmpty && !nextHasPlaceholder) {
                        result.push('<p>');
                        inParagraph = true;
                    }
                } else {
                    // not empty
                    if (!inParagraph) {
                        result.push('<p>');
                        inParagraph = true;
                    }

                    result.push(line);

                    // add <br/> if the next line is not empty and not a placeholder
                    if (i < lines.length - 1 && !nextIsEmpty && !nextHasPlaceholder) {
                        result.push('<br />');
                    }
                }
            }

            if (inParagraph) {
                result.push('</p>');
            }

            return result.join('');
        };

        // Apply line break processing to the content (which now has placeholders)
        let processed = processLineBreaks(processedContent);

        // Clean up any empty paragraphs that might have been created around placeholders
        processed = processed.replace(/<p>\s*<\/p>/g, '');

        // Restore the protected blocks
        blocks.forEach(({ placeholder, html }) => {
            processed = processed.replace(placeholder, html);
        });

        return processed;
    };

    try {
        // First process special tags
        const withSpecialTags = processSpecialTags(text);

        // Then process line breaks while preserving code blocks
        const htmlContent = processLineBreaksWithProtection(withSpecialTags);

        // Apply search highlight last (after all HTML is built)
        const highlightedContent = applySearchHighlight(htmlContent, searchTerm);

        return (
            <div
                className={styles.lineBreakContainer}
                dangerouslySetInnerHTML={{ __html: highlightedContent }}
                data-testid="line-break-renderer"
            />
        );
    } catch (error) {
        console.error('❌ LineBreakRenderer error:', error);
        return (
            <div className={styles.error}>
                Line break error: {error.message}
            </div>
        );
    }
}