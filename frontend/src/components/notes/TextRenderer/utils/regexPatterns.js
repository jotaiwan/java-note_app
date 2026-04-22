// frontend/src/components/notes/TextRenderer/utils/regexPatterns.js
/**
 * Centralized regex patterns for text processing
 */

export const REGEX_PATTERNS = {
    // Tag patterns
    CODE_BLOCK: /\{code\}([\s\S]*?)\{\/code\}/g,
    BLOCKQUOTE: /\{blockquote\}([\s\S]*?)\{\/blockquote\}/g,
    STRIKETHROUGH: /\{strikethrough\}([\s\S]*?)\{\/strikethrough\}/g,
};

export const TAG_HANDLERS = {
    code: {
        pattern: REGEX_PATTERNS.CODE_BLOCK,
        wrapper: (content) => `<pre class="codeBlock"><code>${content}</code></pre>`,
        description: 'Code block'
    },
    blockquote: {
        pattern: REGEX_PATTERNS.BLOCKQUOTE,
        wrapper: (content) => `<blockquote class="blockquote">${content}</blockquote>`,
        description: 'Blockquote'
    },
    strikethrough: {
        pattern: REGEX_PATTERNS.STRIKETHROUGH,
        wrapper: (content) => `<del class="strikethrough">${content}</del>`,
        description: 'Strikethrough text'
    }
};

// 确保这些函数被导出
export function countPattern(text, pattern) {
    if (!text || typeof text !== 'string') return 0;
    const matches = text.match(pattern);
    return matches ? matches.length : 0;
}

export function unescapeHTML(text) {
    if (typeof text !== 'string') return text;
    return text
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'");
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

// console.log('🔧 Regex patterns module loaded');