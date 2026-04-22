// frontend/src/hooks/useCopyToClipboard.js
import { useCallback } from 'react';

export function useCopyToClipboard() {
    const copyToClipboard = useCallback((text, options = {}) => {
        const cleanedText = String(text).replace(/^["']|["']$/g, '');
        const { showToast = true, message = '✅ Copied to clipboard!' } = options;

        return navigator.clipboard.writeText(cleanedText).then(() => {
            if (showToast) {
                // Create and show toast with custom message
                const toast = document.createElement('div');
                toast.textContent = message;
                toast.style.cssText = `
                    position: fixed; top: 20px; right: 20px;
                    background: #28a745; color: white; padding: 10px 20px;
                    border-radius: 5px; z-index: 10000;
                    animation: fadeInOut 2s ease;
                `;

                const style = document.createElement('style');
                style.textContent = `
                    @keyframes fadeInOut {
                        0% { opacity: 0; transform: translateY(-20px); }
                        15% { opacity: 1; transform: translateY(0); }
                        85% { opacity: 1; transform: translateY(0); }
                        100% { opacity: 0; transform: translateY(-20px); }
                    }
                `;

                document.head.appendChild(style);
                document.body.appendChild(toast);

                setTimeout(() => {
                    toast.remove();
                    style.remove();
                }, 2000);
            }

            return true;
        }).catch(err => {
            console.error('Copy failed:', err);
            alert('Failed to copy to clipboard');
            return false;
        });
    }, []);

    return { copyToClipboard };
}