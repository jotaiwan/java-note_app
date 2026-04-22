import React, { useState, useRef, useEffect } from 'react';
import styles from './ShortcutCommands.module.css';
import { shortcuts } from './shortcuts';
import { useCredential, useCopyToClipboard } from '../../../../hooks';

const ShortcutCommands = ({ variant = 'default', showSection = 'all' }) => {
    const [copied, setCopied] = useState(false);
    const [isTooltipVisible, setIsTooltipVisible] = useState(false);
    const [activeTooltip, setActiveTooltip] = useState(null);
    const [activeItem, setActiveItem] = useState(null);
    const [credential, setCredential] = useState(null);

    const timeoutRef = useRef(null);

    // Use custom hooks
    const { fetchCredential, isLoading } = useCredential();
    const { copyToClipboard } = useCopyToClipboard();

    // Load TA credential on mount
    useEffect(() => {
        const loadCredential = async () => {
            // credentialId = 'ta', keyName = 'sso'
            const data = await fetchCredential('ta', 'sso');
            if (data) {
                setCredential(data);
            }
        };

        loadCredential();

        return () => {
            clearTimeout(timeoutRef.current);
        };
    }, [fetchCredential]);

    const copyCredential = async () => {
        try {
            let credToCopy = credential;

            if (!credToCopy) {
                // Fetch if not already loaded
                credToCopy = await fetchCredential('ta', 'sso');
                if (!credToCopy) {
                    alert('No credential available from API');
                    return;
                }
                setCredential(credToCopy);
            }

            // Extract the sso value
            const ssoValue = credToCopy?.sso || credToCopy;

            const success = await copyToClipboard(ssoValue);
            if (success) {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }
        } catch (error) {
            console.error('Failed to copy credential:', error);
            alert('Failed to copy credential');
        }
    };

    const handleCopyClick = (command, e) => {
        if (e) e.stopPropagation();
        copyToClipboard(command);
    };

    const handleKeyClick = async (e) => {
        if (e) e.stopPropagation();
        await copyCredential();
    };

    // Tooltip handlers (keep these the same)
    const handleButtonMouseEnter = (tooltipType = 'commands') => {
        clearTimeout(timeoutRef.current);
        setActiveTooltip(tooltipType);
        setIsTooltipVisible(true);
    };

    const handleButtonMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setIsTooltipVisible(false);
            setActiveTooltip(null);
            setActiveItem(null);
        }, 300);
    };

    const handleItemMouseEnter = (id) => {
        clearTimeout(timeoutRef.current);
        setActiveItem(id);
    };

    const handleItemMouseLeave = () => {
        clearTimeout(timeoutRef.current);
    };

    const handleTooltipMouseEnter = () => {
        clearTimeout(timeoutRef.current);
    };

    const handleTooltipMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setIsTooltipVisible(false);
            setActiveTooltip(null);
            setActiveItem(null);
        }, 300);
    };

    const handleCloseAll = () => {
        alert('Close all windows functionality would go here');
    };

    // Determine which sections to render
    const renderLeftSection = showSection === 'all' || showSection === 'left';
    const renderRightSection = showSection === 'all' || showSection === 'right';

    return (
        <div className={`${styles.shortcutsContainer} ${variant === 'compact' ? styles.compact : ''}`}>
            {/* Left section (👤 👥) */}
            {renderLeftSection && (
                <div className={styles.leftSection}>
                    {credential?.profile && (
                        <div className={styles.badgeWrapper}>
                            <a
                                href={`https://test.com`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`${styles.badge} ${styles.roundBadge} ${styles.badgeLink} ${styles.badgePerson}`}
                                title={`View ${credential.profile}'s Jira profile`}
                            >
                                <span className={styles.icon}>👤</span>
                            </a>
                        </div>
                    )}

                    <div className={styles.badgeWrapper}>
                        <a
                            href={`https://docs.google.com/spreadsheets/d/166y6wL-nuuf7ukNbA4lgmdQVsQbgZ4P_bZfhUjRJe1Y/edit#gid=0`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`${styles.badge} ${styles.roundBadge} ${styles.badgeLink} ${styles.badgePerson}`}
                            title="View spreadsheet"
                        >
                            <span className={styles.icon}>👥</span>
                        </a>
                    </div>
                </div>
            )}

            {/* Right section (📋 🔑 ✕) */}
            {renderRightSection && (
                <div className={styles.rightSection}>
                    {/* Copy Commands Button with Tooltip */}
                    <div className={styles.hoverShortcutText}>
                        <button
                            className={`${styles.badge} ${styles.badgeLink} ${styles.roundBadge}`}
                            type="button"
                            onMouseEnter={() => handleButtonMouseEnter('commands')}
                            onMouseLeave={handleButtonMouseLeave}
                        >
                            <span className={styles.icon}>🔗</span>
                        </button>

                        {/* Commands Tooltip */}
                        {isTooltipVisible && activeTooltip === 'commands' && (
                            <div
                                className={styles.hoverShortcutTooltip}
                                onMouseEnter={handleTooltipMouseEnter}
                                onMouseLeave={handleTooltipMouseLeave}
                            >
                                <div className={styles.tooltipHeader}>
                                    <h4>Quick Commands</h4>
                                </div>
                                <ul>
                                    {shortcuts.map((item) => (
                                        <li
                                            key={item.id}
                                            onMouseEnter={() => handleItemMouseEnter(item.id)}
                                            onMouseLeave={handleItemMouseLeave}
                                            onClick={(e) => handleCopyClick(item.command, e)}
                                            className={`${styles.tooltipItem} ${activeItem === item.id ? styles.activeItem : ''}`}
                                        >
                                            <span className={styles.itemIcon}>{item.icon}</span>
                                            <span className={styles.itemLabel}>{item.label}</span>
                                            <button
                                                className={styles.copyButton}
                                                onClick={(e) => handleCopyClick(item.command, e)}
                                                title="Copy command"
                                            >
                                                📋
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    <span className={styles.tabCounter}></span>

                    {/* Key Button - Copy TA SSO Credential */}
                    <button
                        className={`${styles.badge} ${styles.badgeDanger} ${styles.roundBadge} ${copied ? styles.copied : ''}`}
                        type="button"
                        onClick={handleKeyClick}
                        disabled={isLoading}
                        title="Copy TA SSO credential"
                    >
                        {isLoading ? (
                            <span className={`${styles.icon} ${styles.spinner}`}>⏳</span>
                        ) : copied ? (
                            <span className={styles.icon}>✓</span>
                        ) : (
                            <span className={styles.icon}>🔑</span>
                        )}
                    </button>

                    <span className={styles.tabCounter}></span>

                    {/* Close Button */}
                    <button
                        className={`${styles.badge} ${styles.badgeDanger} ${styles.roundBadge}`}
                        type="button"
                        onClick={handleCloseAll}
                        title="Close all windows"
                    >
                        <span className={styles.icon}>✕</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default ShortcutCommands;