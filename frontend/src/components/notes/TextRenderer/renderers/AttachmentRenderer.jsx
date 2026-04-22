// AttachmentRenderer Component
// Renders attachment markers in the text as clickable links
// Supports both image and file attachments

import React from 'react';
import styles from './AttachmentRenderer.module.css';

/**
* AttachmentRenderer component
* Transforms attachment markers like [screenshot_xxx] or [file_xxx] into clickable links
*
* @param {Object} props
* @param {string} props.text - Text containing attachment markers
* @returns {JSX.Element}
*/
export default function AttachmentRenderer({ text }) {
if (!text) return null;

// console.log('🔗 AttachmentRenderer processing:', text.substring(0, 100));

/**
* Process attachment markers in text
* Supports formats: [screenshot_xxx], [file_xxx], [attachment_xxx]
*/
const processAttachmentMarkers = () => {
let processed = text;

// Process screenshot markers: [screenshot_xxx]
processed = processed.replace(
/\[screenshot_([^\]]+)\]/g,
(match, id) => {
return `<a href="#attachment-${id}" class="${styles.attachmentLink}" data-attachment="${id}">${match}</a>`;
}
);

// Process file markers: [file_xxx]
processed = processed.replace(
/\[file_([^\]]+)\]/g,
(match, id) => {
return `<a href="#attachment-${id}" class="${styles.attachmentLink}" data-attachment="${id}">${match}</a>`;
}
);

// Process general attachment markers: [attachment_xxx]
processed = processed.replace(
/\[attachment_([^\]]+)\]/g,
(match, id) => {
return `<a href="#attachment-${id}" class="${styles.attachmentLink}" data-attachment="${id}">${match}</a>`;
}
);

return processed;
};

const processedHtml = processAttachmentMarkers();

return (
<span
    dangerouslySetInnerHTML={{ __html: processedHtml }}
    className={styles.attachmentRenderer} />
);
}