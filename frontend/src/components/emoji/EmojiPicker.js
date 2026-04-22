// frontend/src/components/emoji/EmojiPicker.js
import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import styles from './EmojiPicker.module.css';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';

// EMOJI_LIST with paired formatting shortcuts
const EMOJI_LIST = [
    // Paired formatting tags
    "{code}{/code}",
    "{blockquote}{/blockquote}",
    "{strikethrough}{/strikethrough}",

    // Regular emojis
    "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇",
    "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚",
    "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🥸",
    "🤩", "🥳", "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "☹️",
    "😣", "😖", "😫", "😩", "🥺", "😢", "😭", "😤", "😠", "😡",
    "🤬", "🤯", "😳", "🥵", "🥶", "😱", "😨", "😰", "😥", "😓",
    "🤗", "🤔", "🤭", "🤫", "🤥", "😶", "😐", "😑", "😬", "🙄",
    "😯", "😦", "😧", "😮", "😲", "🥱", "😴", "🤤", "😪", "😵",
    "🤐", "🥴", "🤢", "🤮", "🤧", "😷", "🤒", "🤕", "🤑", "🤠",
    "👀", "🔍", "💥", "🔥", "⚠️", "✅", "🚨", "🆘", "0️⃣", "1️⃣",
    "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🛟", "📅",
    "🧠", "🙋", "🐞", "🔴", "🔺", "🔻", "📍", "❗", "❓", "🟠",
    "🔸", "🟡", "🟢", "🔹", "💪", "👍", "👉", "👈", "👇", "👌",
    "⛔️", "🚫", "💡", "📌", "🧩", "🎉", "🙏", "🎯", "🔼", "ℹ️",
    "➡️", "⬅️", "⬆️", "⬇️", "↔️", "↕️", "⤴️", "⤵️", "↩️", "↪️",
    "🔁", "🔄", "👥", "🧑‍🤝‍🧑", "👨‍👩‍👧‍👦", "👤", "🕰️", "🏷️", "🔖", "🧪",
    "📎", "🧬", "⚗️", "🔒", "🔓", "☑️", "⬜", "⚡", "💨", "🔑",
    "🗝️", "🛡️", "🕒", "🌀", "⏰", "🔔", "❌", "🚧", "👨‍💻", "👷‍♂️",
    "🏭", "🏃‍♂️", "🇦🇺", "🐼", "🦘", "🐨", "🪲", "🐛", "🐜", "🌐",
    "🐚"
];

const RECENT_EMOJIS_KEY = 'recent_emojis';

// Helper function to get display icon
const getDisplayIcon = (item) => {
    if (item === "{code}{/code}") return '</>';
    if (item === "{blockquote}{/blockquote}") return '❝';
    if (item === "{strikethrough}{/strikethrough}") return '⌦';
    return item;
};

// Helper function to get tooltip text
const getTooltip = (item) => {
    if (item === "{code}{/code}") return 'Wrap selected text with {code}{/code}';
    if (item === "{blockquote}{/blockquote}") return 'Wrap selected text with {blockquote}{/blockquote}';
    if (item === "{strikethrough}{/strikethrough}") return 'Wrap selected text with {strikethrough}{/strikethrough}';
    return `Insert emoji: ${item}`;
};

// Portal Component
const EmojiPickerPortal = ({ children, isOpen }) => {
    const [portalContainer, setPortalContainer] = useState(null);

    useEffect(() => {
        if (!isOpen) return;

        const container = document.createElement('div');
        container.id = 'emoji-picker-portal';
        container.style.position = 'fixed';
        container.style.zIndex = '999999999';
        container.style.top = '0';
        container.style.left = '0';
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.pointerEvents = 'none';

        document.body.appendChild(container);
        setPortalContainer(container);
        document.body.style.overflow = 'hidden';

        return () => {
            if (container && container.parentNode) {
                container.parentNode.removeChild(container);
            }
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!portalContainer || !isOpen) return null;

    return ReactDOM.createPortal(children, portalContainer);
};

export default function EmojiPicker({ onSelect, position = 'bottom', maxRecent = 20, trigger = 'hover' }) {
    const [isOpen, setIsOpen] = useState(false);
    const [recentEmojis, setRecentEmojis] = useState([]);
    const [pickerPosition, setPickerPosition] = useState({ top: 0, left: 0 });
    const [hoverTimeout, setHoverTimeout] = useState(null);
    const toggleButtonRef = useRef(null);

    // Use the existing copy to clipboard hook
    const { copyToClipboard } = useCopyToClipboard();

    // Initialize recent emojis
    useEffect(() => {
        const saved = localStorage.getItem(RECENT_EMOJIS_KEY);
        if (saved) {
            try {
                setRecentEmojis(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to parse recent emojis:', e);
            }
        }
    }, []);

    // Calculate emoji picker position
    const calculatePickerPosition = () => {
        if (!toggleButtonRef.current || !isOpen) return;

        const buttonRect = toggleButtonRef.current.getBoundingClientRect();
        const scrollY = window.scrollY || window.pageYOffset;
        const scrollX = window.scrollX || window.pageXOffset;

        let top, left;

        switch (position) {
            case 'top':
                top = buttonRect.top + scrollY - 350;
                break;
            case 'left':
                top = buttonRect.top + scrollY;
                left = buttonRect.left + scrollX - 320;
                break;
            case 'right':
                top = buttonRect.top + scrollY;
                left = buttonRect.right + scrollX + 10;
                break;
            case 'bottom':
            default:
                top = buttonRect.bottom + scrollY + 5;
                left = buttonRect.left + scrollX;
                break;
        }

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        if (left + 352 > viewportWidth) {
            left = viewportWidth - 362;
        }
        if (left < 0) left = 10;

        if (top + 350 > viewportHeight + scrollY) {
            top = viewportHeight + scrollY - 360;
        }
        if (top < scrollY) top = scrollY + 10;

        setPickerPosition({ top, left });
    };

    useEffect(() => {
        if (!isOpen) return;

        calculatePickerPosition();

        const handleResize = () => calculatePickerPosition();
        const handleScroll = () => calculatePickerPosition();

        window.addEventListener('resize', handleResize);
        window.addEventListener('scroll', handleScroll, true);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('scroll', handleScroll, true);
        };
    }, [isOpen, position]);

    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (event) => {
            if (toggleButtonRef.current &&
                !toggleButtonRef.current.contains(event.target) &&
                !event.target.closest('.emoji-picker-content')) {
                setIsOpen(false);
            }
        };

        document.addEventListener('click', handleClickOutside, true);

        return () => {
            document.removeEventListener('click', handleClickOutside, true);
        };
    }, [isOpen]);

    // Handle hover events
    const handleMouseEnter = () => {
        if (trigger === 'hover') {
            // Clear any existing timeout
            if (hoverTimeout) {
                clearTimeout(hoverTimeout);
            }
            // Open immediately on hover
            setIsOpen(true);
            setTimeout(() => {
                calculatePickerPosition();
            }, 10);
        }
    };

    const handleMouseLeave = () => {
        if (trigger === 'hover') {
            // Add a small delay before closing to allow moving mouse to picker
            const timeout = setTimeout(() => {
                // Check if mouse is not over the picker content
                const pickerContent = document.querySelector('.emoji-picker-content');
                if (pickerContent && !pickerContent.matches(':hover')) {
                    setIsOpen(false);
                }
            }, 300);
            setHoverTimeout(timeout);
        }
    };

    const handlePickerMouseEnter = () => {
        if (trigger === 'hover') {
            // Clear the close timeout when mouse enters picker
            if (hoverTimeout) {
                clearTimeout(hoverTimeout);
                setHoverTimeout(null);
            }
        }
    };

    const handlePickerMouseLeave = () => {
        if (trigger === 'hover') {
            // Close after a short delay when mouse leaves picker
            const timeout = setTimeout(() => {
                setIsOpen(false);
            }, 200);
            setHoverTimeout(timeout);
        }
    };

    // Wrap selected text with opening and closing tags
    const wrapSelectedText = (tag) => {
        const activeElement = document.activeElement;

        if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
            const input = activeElement;
            const start = input.selectionStart;
            const end = input.selectionEnd;
            const selectedText = input.value.substring(start, end);

            // Extract opening and closing tags
            // For "{code}{/code}", opening = "{code}", closing = "{/code}"
            const openingTag = tag.split('{/')[0]; // Gets "{code}"
            const closingTag = '{/' + tag.split('{/')[1]; // Gets "{/code}"

            // Wrap selected text
            const newValue = input.value.substring(0, start) +
                openingTag + selectedText + closingTag +
                input.value.substring(end);
            input.value = newValue;

            // Set cursor after the inserted text (after closing tag)
            const newCursorPos = start + openingTag.length + selectedText.length + closingTag.length;
            input.setSelectionRange(newCursorPos, newCursorPos);

            // Trigger input event
            const event = new Event('input', { bubbles: true });
            input.dispatchEvent(event);

            return true;
        }
        return false;
    };

    // Insert emoji at cursor position
    const insertEmoji = (emoji) => {
        const activeElement = document.activeElement;

        if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
            const input = activeElement;
            const start = input.selectionStart;
            const end = input.selectionEnd;

            // Insert emoji at cursor position
            const newValue = input.value.substring(0, start) + emoji + input.value.substring(end);
            input.value = newValue;

            // Set cursor after the emoji
            const newCursorPos = start + emoji.length;
            input.setSelectionRange(newCursorPos, newCursorPos);

            // Trigger input event
            const event = new Event('input', { bubbles: true });
            input.dispatchEvent(event);

            return true;
        }
        return false;
    };

    const handleEmojiSelect = async (item) => {
        // Save to recent (only complete tags and emojis)
        const isPartialTag = item === "{code}" || item === "{blockquote}" || item === "{strikethrough}";

        if (!isPartialTag) {
            const newRecent = [
                item,
                ...recentEmojis.filter(e => e !== item)
            ].slice(0, maxRecent);

            setRecentEmojis(newRecent);
            try {
                localStorage.setItem(RECENT_EMOJIS_KEY, JSON.stringify(newRecent));
            } catch (e) {
                console.error('Failed to save recent emojis:', e);
            }
        }

        // Handle based on item type
        let inserted = false;

        if (item === "{code}{/code}" || item === "{blockquote}{/blockquote}" || item === "{strikethrough}{/strikethrough}") {
            // For paired tags, wrap selected text
            inserted = wrapSelectedText(item);
        } else if (!isPartialTag) {
            // For regular emojis, try to insert at cursor first
            inserted = insertEmoji(item);

            // If no input is focused, copy to clipboard using the hook with custom message
            if (!inserted) {
                // For emojis, use message without checkmark
                await copyToClipboard(item, {
                    message: `Copied ${item} to clipboard`
                });
            }
        }

        // Callback
        if (onSelect) {
            onSelect(item);
        }

        // Close picker
        setIsOpen(false);
    };

    const togglePicker = (e) => {
        e.stopPropagation();
        e.preventDefault();

        if (trigger === 'click') {
            const newState = !isOpen;
            setIsOpen(newState);

            if (newState) {
                setTimeout(() => {
                    calculatePickerPosition();
                }, 10);
            }
        }
    };

    const renderEmojis = () => {
        const rows = [];
        const itemsPerRow = 8;

        for (let i = 0; i < EMOJI_LIST.length; i += itemsPerRow) {
            const rowItems = EMOJI_LIST.slice(i, i + itemsPerRow);
            rows.push(
                <div key={`row-${i}`} className={styles.emojiRow}>
                    {rowItems.map((item, index) => (
                        <button
                            key={`${item}-${i + index}`}
                            type="button"
                            onClick={() => handleEmojiSelect(item)}
                            className={styles.emojiButton}
                            title={getTooltip(item)}
                            aria-label={item}
                        >
                            {getDisplayIcon(item)}
                        </button>
                    ))}
                    {rowItems.length < itemsPerRow &&
                        Array(itemsPerRow - rowItems.length).fill(null).map((_, i) => (
                            <div key={`empty-${i}`} className={styles.emojiButton} style={{ visibility: 'hidden' }} />
                        ))
                    }
                </div>
            );
        }

        return rows;
    };

    // Filter recent items
    const filteredRecent = recentEmojis.filter(item =>
        item !== "{code}" && item !== "{blockquote}" && item !== "{strikethrough}"
    );

    return (
        <>
            <div className={styles.emojiPickerContainer}>
                <button
                    ref={toggleButtonRef}
                    type="button"
                    onClick={togglePicker}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    className={styles.toggleButton}
                    title="Open emoji picker"
                    aria-label="Open emoji picker"
                    aria-expanded={isOpen}
                >
                    😀
                </button>
            </div>

            <EmojiPickerPortal isOpen={isOpen}>
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 999999998,
                        background: trigger === 'hover' ? 'transparent' : 'rgba(0, 0, 0, 0.2)',
                        pointerEvents: trigger === 'hover' ? 'none' : 'auto'
                    }}
                    onClick={trigger === 'click' ? () => setIsOpen(false) : undefined}
                    aria-hidden="true"
                />

                <div
                    className={`${styles.emojiPicker} emoji-picker-content`}
                    style={{
                        position: 'fixed',
                        top: `${pickerPosition.top}px`,
                        left: `${pickerPosition.left}px`,
                        zIndex: 999999999,
                        pointerEvents: 'auto',
                        maxHeight: '350px',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                    onClick={(e) => e.stopPropagation()}
                    onMouseEnter={handlePickerMouseEnter}
                    onMouseLeave={handlePickerMouseLeave}
                    role="dialog"
                    aria-label="Emoji picker"
                >
                    <div className={styles.emojiPickerContent} style={{ flex: 1, overflowY: 'auto' }}>
                        {/* Recently used emojis */}
                        {filteredRecent.length > 0 && (
                            <div className={styles.emojiSection}>
                                <h4 className={styles.sectionTitle}>Recent</h4>
                                <div className={styles.recentEmojis}>
                                    {filteredRecent.map((item, index) => (
                                        <button
                                            key={`recent-${index}`}
                                            type="button"
                                            onClick={() => handleEmojiSelect(item)}
                                            className={styles.emojiButton}
                                            title={`Recently used: ${item}`}
                                        >
                                            {getDisplayIcon(item)}
                                        </button>
                                    ))}
                                    {Array(Math.max(0, 8 - filteredRecent.length)).fill(null).map((_, i) => (
                                        <div key={`recent-empty-${i}`} className={styles.emojiButton} style={{ visibility: 'hidden' }} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* All emojis */}
                        <div className={styles.emojiSection}>
                            <h4 className={styles.sectionTitle}>All Emojis</h4>
                            <div className={styles.emojiGrid}>
                                {renderEmojis()}
                            </div>
                        </div>
                    </div>

                    <div style={{
                        padding: '8px 12px',
                        borderTop: '1px solid #eee',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: '#f9f9f9',
                        fontSize: '12px',
                        color: '#666'
                    }}>
                        <span>
                            <span style={{ marginRight: '8px' }}>{'</>'} Code</span>
                            <span style={{ marginRight: '8px' }}>❝ Quote</span>
                            <span>⌦ Strike</span>
                        </span>
                        <span>{EMOJI_LIST.length}</span>
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#666',
                                cursor: 'pointer',
                                fontSize: '14px',
                                padding: '0 4px'
                            }}
                        >
                            ✕
                        </button>
                    </div>
                </div>
            </EmojiPickerPortal>
        </>
    );
}