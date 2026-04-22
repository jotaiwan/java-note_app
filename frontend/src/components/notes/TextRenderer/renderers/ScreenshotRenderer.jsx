// frontend/src/components/notes/TextRenderer/renderers/ScreenshotRenderer.jsx
import React from 'react';

export default function ScreenshotRenderer({ text = '' }) {
    if (!text) return null;

    const processScreenshots = (content) => {
        const screenshotPattern = /\[(screenshot_[^\]]+)\]/g;
        const matches = [...content.matchAll(screenshotPattern)];
        if (matches.length === 0) return content;

        return content.replace(screenshotPattern, (fullMatch, screenshotName) => {
            const identifier = screenshotName.replace('screenshot_', '');
            return `<a href="#screenshot-${identifier}" class="imageLink" data-screenshot="${identifier}">[${screenshotName}]</a>`;
        });
    };

    try {
        const processedText = processScreenshots(text);
        if (processedText !== text) {
            return <div dangerouslySetInnerHTML={{ __html: processedText }} />;
        }
        return <>{text}</>;
    } catch (error) {
        console.error('ScreenshotRenderer error:', error);
        return <span>Error processing screenshot markers: {error.message}</span>;
    }
}
