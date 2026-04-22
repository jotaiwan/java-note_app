// frontend/src/components/notes/TextRenderer/utils/htmlSanitizer.js
/**
 * HTML sanitization utilities for safe rendering.
 * Prevents XSS attacks and ensures clean HTML output.
 */

export function sanitizeHTML(html) {
    if (!html || typeof html !== 'string') return '';

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    const dangerousTags = ['script', 'iframe', 'object', 'embed', 'link', 'meta', 'style'];
    dangerousTags.forEach(tag => {
        tempDiv.querySelectorAll(tag).forEach(el => el.remove());
    });

    const dangerousAttributes = ['onclick', 'onload', 'onerror', 'onmouseover', 'href', 'src'];
    tempDiv.querySelectorAll('*').forEach(el => {
        dangerousAttributes.forEach(attr => {
            if (el.hasAttribute(attr)) {
                if (attr === 'href' || attr === 'src') {
                    if (!isSafeURL(el.getAttribute(attr))) el.removeAttribute(attr);
                } else {
                    el.removeAttribute(attr);
                }
            }
        });
    });

    return tempDiv.innerHTML;
}

function isSafeURL(url) {
    if (!url) return false;
    const safePatterns = [
        /^#/,
        /^https?:\/\//,
        /^\/\//,
        /^[a-zA-Z0-9\-._~:/?#[\]@!$&'()*+,;=]+$/,
    ];
    return safePatterns.some(pattern => pattern.test(url));
}

export function escapeHTML(text) {
    if (typeof text !== 'string') return text;
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
