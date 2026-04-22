// frontend/src/hooks/useShortcutCommands.js
import { useEffect } from 'react';
import { shortcuts } from '../pages/notes/components/ShortcutCommands/shortcuts';

export function useShortcutCommands(onCommandCopy) {
    useEffect(() => {
        const handleKeyDown = (event) => {
            // Example: Ctrl+Shift+C to copy first command
            if (event.ctrlKey && event.shiftKey && event.key === 'C') {
                event.preventDefault();
                if (shortcuts.length > 0 && onCommandCopy) {
                    onCommandCopy(shortcuts[0].command);
                }
            }
            // Add more shortcuts as needed
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onCommandCopy]);
}