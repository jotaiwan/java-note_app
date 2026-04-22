// frontend/src/components/notes/TextRenderer/renderers/index.js
/**
 * Central export for all text renderers
 * Import from here to get all available renderers
 */

export { default as LineBreakRenderer } from './LineBreakRenderer';
export { default as TextTagRenderer } from './TextTagRenderer';
export { default as LinkRenderer } from './LinkRenderer';
export { default as ScreenshotRenderer } from './ScreenshotRenderer';

// Future renderers can be added here:
// export { default as BoldRenderer } from './BoldRenderer';
// export { default as ItalicRenderer } from './ItalicRenderer';