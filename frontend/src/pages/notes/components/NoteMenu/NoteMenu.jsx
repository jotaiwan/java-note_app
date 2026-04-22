// frontend/src/pages/notes/components/NoteMenu/NoteMenu.jsx
import React, { useMemo } from 'react';
import ReactDOM from 'react-dom';
import styles from './NoteMenu.module.css';
import ShortcutCommands from '../ShortcutCommands';
import ProjectSelector from '../ProjectSelector';
import QuickLinks from '../QuickLinks/QuickLinks';
import { getDefaultGroupDisplayName } from '../ProjectSelector/utils/configLoader';
import { getGroupDisplayName } from '../shared/groupNameConstants';
import { useDropdown } from '../../../../hooks/useDropdown'; // Import the custom hook

const NoteMenu = ({
    children,
    onMenuClick
}) => {
    // Use the custom dropdown hook
    const {
        isOpen,
        isHovered,
        isClicked,
        isContentHovered,
        dropdownRef,
        triggerRef,
        toggleDropdown,
        handleMouseEnter,
        handleMouseLeave,
        handleContentMouseEnter,
        handleContentMouseLeave
    } = useDropdown(false, onMenuClick);

    // Memoize group display name to prevent unnecessary re-renders
    const groupDisplayName = useMemo(() => {
        const defaultGroupKey = process.env.REACT_APP_DEFAULT_GROUP || 'group1';
        return getGroupDisplayName(defaultGroupKey) || 'Menu';
    }, []);

    const defaultGroupName = useMemo(() => getDefaultGroupDisplayName(), []);

    // Project Selector Handlers
    const handleEnvChange = (_env) => {};

    const handleProjectChange = (_project, _env) => {};

    // Get menu position
    const getMenuPosition = () => {
        if (!triggerRef.current) return { top: 0, left: 0 };

        const rect = triggerRef.current.getBoundingClientRect();
        const scrollY = window.scrollY || document.documentElement.scrollTop;
        const scrollX = window.scrollX || document.documentElement.scrollLeft;

        return {
            top: rect.bottom + scrollY,
            left: rect.left + scrollX
        };
    };

    return (
        <div className={styles.menuContainer}>
            {/* Trigger button */}
            <div
                ref={triggerRef}
                onClick={toggleDropdown}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className={styles.triggerWrapper}
            >
                {children || (
                    <button
                        className={`${styles.menuButton} ${isOpen ? styles.active : ''}`}
                        title={groupDisplayName}
                        aria-label={`Open ${groupDisplayName} menu`}
                        aria-expanded={isOpen}
                        onClick={toggleDropdown}
                    >
                        <span className={styles.menuIcon}>☰</span>
                        {/* Hover indicator */}
                        {isHovered && !isOpen && !isClicked && (
                            <div className={styles.hoverIndicator}></div>
                        )}
                        {/* Click indicator */}
                        {isClicked && (
                            <div className={styles.clickIndicator}></div>
                        )}
                    </button>
                )}
            </div>

            {/* Render menu to body using Portal */}
            {isOpen && ReactDOM.createPortal(
                <div
                    ref={dropdownRef}
                    className={styles.menuDropdownPortal}
                    style={getMenuPosition()}
                    onMouseEnter={handleContentMouseEnter}
                    onMouseLeave={handleContentMouseLeave}
                >
                    <div className={styles.menuDropdown}>
                        {/* Header */}
                        <div className={styles.menuHeader}>
                            <div className={styles.headerLeft}>
                                <div className={styles.menuTitleSection}>
                                    <h3 className={styles.menuTitle}>{groupDisplayName}</h3>
                                    <div className={`${styles.menuStatus} ${isClicked ? styles.clickMode : styles.hoverMode}`}>
                                        {isClicked ? 'Click Mode' : 'Hover Mode'}
                                    </div>
                                </div>
                                <div className={styles.headerShortcutsLeft}>
                                    <ShortcutCommands variant="menu" showSection="left" />
                                </div>
                            </div>

                            <div className={styles.headerRight}>
                                <div className={styles.headerShortcutsRight}>
                                    <ShortcutCommands variant="menu" showSection="right" />
                                </div>
                            </div>
                        </div>

                        <div className={styles.menuDivider}></div>

                        {/* SIMPLE CONTENT: ProjectSelector then QuickLinks */}
                        <div className={styles.projectSelectorWrapper}>
                            <ProjectSelector
                                onEnvironmentChange={handleEnvChange}
                                onProjectChange={handleProjectChange}
                                variant="menu"
                                group={defaultGroupName}
                                openInNewTab={true}
                            />
                        </div>

                        <div className={styles.menuDivider}></div>

                        {/* ALL QuickLinks together */}
                        <div className={styles.quickLinksSection}>
                            <QuickLinks groups={['group1', 'personal']} />
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default NoteMenu;