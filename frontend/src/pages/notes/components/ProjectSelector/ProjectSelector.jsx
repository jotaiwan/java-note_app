import React, { useState, useEffect } from 'react';
import styles from './ProjectSelector.module.css';
import {
    getEnvironments,
    getProjectsWithLinks,
    getCurrentProjectLink,
    getDefaultEnvironment,
    getDefaultGroup,
    getEnvironmentById
} from './utils/configLoader';

/**
 * @typedef {Object} Props
 * @property {Function} [onEnvironmentChange] - Environment change callback
 * @property {Function} [onProjectChange] - Project change callback
 * @property {string} [group] - Group ID (group1, group2, personal)
 * @property {string} [defaultEnvironment] - Default environment
 * @property {string} [variant] - Style variant: 'menu' or 'standalone'
 */

const ProjectSelector = ({
    onEnvironmentChange,
    onProjectChange,
    group = getDefaultGroup(),
    defaultEnvironment,
    variant = 'standalone',
    openInNewTab = false
}) => {
    // Get configurations for the specified group
    const environments = getEnvironments(group);
    const allProjects = getProjectsWithLinks(group);

    // Determine default environment
    const groupDefaultEnv = getDefaultEnvironment(group);
    const initialEnv = defaultEnvironment || groupDefaultEnv.id;

    // Get the selected project from localStorage or use first project
    const getInitialSelectedProject = () => {
        // Try to get from localStorage first
        const storedProject = localStorage.getItem(`selectedProject_${group}`);
        if (storedProject && allProjects.some(p => p.id === storedProject)) {
            return storedProject;
        }
        // Otherwise use first project
        return allProjects[0]?.id || '';
    };

    const [selectedEnv, setSelectedEnv] = useState(initialEnv);
    const [selectedProject, setSelectedProject] = useState(getInitialSelectedProject());

    // Initialize selected project if not set
    useEffect(() => {
        if (!selectedProject && allProjects.length > 0) {
            const initialProject = getInitialSelectedProject();
            setSelectedProject(initialProject);
        }
    }, [allProjects, selectedProject]);

    /**
     * Handle environment click
     * @param {Object} env - Environment object
     */
    const handleEnvClick = (env) => {
        setSelectedEnv(env.id);

        // Save to localStorage for persistence
        localStorage.setItem(`selectedEnv_${group}`, env.id);

        if (onEnvironmentChange) {
            onEnvironmentChange(env, group);
        }

        // If a project is selected, trigger project change with new environment
        if (selectedProject && onProjectChange) {
            const project = allProjects.find(p => p.id === selectedProject);
            const currentEnv = environments.find(e => e.id === env.id);
            if (project && currentEnv) {
                onProjectChange(project, currentEnv, group);
            }
        }
    };

    /**
     * Handle project click - OPEN IN NEW TAB
     * @param {Object} project - Project object
     */
    const handleProjectClick = (project) => {
        setSelectedProject(project.id);
        localStorage.setItem(`selectedProject_${group}`, project.id);

        const currentEnv = environments.find(e => e.id === selectedEnv);
        if (onProjectChange && currentEnv) {
            onProjectChange(project, currentEnv, group);
        }

        const url = getCurrentProjectLink(group, project.id, selectedEnv);

        if (url && url !== '#') {
            if (openInNewTab) {
                // This opens new tab, keeps current tab
                window.open(url, '_blank', 'noopener,noreferrer');
            } else {
                // This would replace current tab (not what you want)
                // window.location.href = url;
            }
        }
    };

    /**
     * Get current selected environment
     * @returns {Object|undefined}
     */
    const getCurrentEnv = () => environments.find(e => e.id === selectedEnv);

    /**
     * Get current selected project
     * @returns {Object|undefined}
     */
    const getCurrentProject = () => allProjects.find(p => p.id === selectedProject);

    /**
     * Get project display name with environment context
     * @param {Object} project - Project object
     * @returns {string} Formatted display name
     */
    const getProjectDisplayName = (project) => {
        const env = getCurrentEnv();
        return `${project.name} (${env?.name || selectedEnv})`;
    };

    /**
     * Get tooltip text for project button
     * @param {Object} project - Project object
     * @returns {string} Tooltip text
     */
    const getProjectTooltip = (project) => {
        const env = getCurrentEnv();
        const url = getCurrentProjectLink(group, project.id, selectedEnv);

        if (url === '#') {
            return `${project.description} - URL not configured for ${env?.name}`;
        }

        return `${project.description} - Opens ${url} in new tab`;
    };

    const containerClass = variant === 'menu'
        ? `${styles.container} ${styles.menuVariant}`
        : styles.container;

    return (
        <div className={containerClass}>
            {/* Environment Row with Current Selection on the right */}
            <div className={styles.environmentRow}>
                <div className={styles.environmentsList}>
                    {environments.map((env, index) => (
                        <React.Fragment key={env.id}>
                            <button
                                type="button"
                                onClick={() => handleEnvClick(env)}
                                className={`${styles.envButton} ${selectedEnv === env.id ? styles.envButtonActive : ''}`}
                                title={`Switch to ${env.name} environment (${group})`}
                                aria-label={env.name}
                                style={{
                                    backgroundColor: selectedEnv === env.id ? env.color : 'transparent',
                                    color: selectedEnv === env.id ? '#fff' : env.color,
                                    borderColor: env.color
                                }}
                            >
                                <span className={styles.envText}>{env.name}</span>
                            </button>
                            {index < environments.length - 1 && (
                                <span className={styles.separator}>·</span>
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {/* Current Selection moved to right side */}
                <div className={styles.currentSelection}>
                    <div className={styles.currentBadge}>
                        <span className={styles.currentGroup} style={{
                            color: group === 'group1' ? '#3b82f6' :
                                group === 'group2' ? '#ec4899' :
                                    '#8b5cf6'
                        }}>
                            {group}
                        </span>
                        <span className={styles.currentSeparator}>/</span>
                        <span className={styles.currentEnv}>
                            {getCurrentEnv()?.name}
                        </span>
                        <span className={styles.currentSeparator}>/</span>
                        <span className={styles.currentProject}>
                            {getCurrentProject()?.name}
                        </span>
                    </div>
                </div>
            </div>

            {/* Separator line */}
            <div className={styles.separatorLine}></div>

            {/* Projects Row */}
            <div className={styles.projectsRow}>
                {allProjects.map((project, index) => (
                    <React.Fragment key={project.id}>
                        <button
                            type="button"
                            onClick={() => handleProjectClick(project)}
                            className={`${styles.projectButton} ${selectedProject === project.id ? styles.projectButtonActive : ''}`}
                            title={getProjectTooltip(project)}
                            aria-label={getProjectDisplayName(project)}
                            style={{
                                '--project-color': project.color,
                                borderColor: selectedProject === project.id ? project.color : 'transparent'
                            }}
                        >
                            <span className={styles.projectIcon}>{project.icon}</span>
                            <span className={styles.projectText}>{project.name}</span>
                        </button>
                        {index < allProjects.length - 1 && (
                            <span className={styles.separator}>·</span>
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

export default ProjectSelector;