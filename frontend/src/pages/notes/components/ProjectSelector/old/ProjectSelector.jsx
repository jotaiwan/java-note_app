import React, { useState, useEffect } from 'react';
import styles from './ProjectSelector.module.css';
import {
    ENVIRONMENTS,
    getDefaultEnvironment
} from './environment';
import {
    getProjectsWithLinks,
    getCurrentProjectLink,
    navigateToProject
} from './linkMapping';

/**
 * @typedef {Object} Props
 * @property {Function} [onEnvironmentChange] - Environment change callback
 * @property {Function} [onProjectChange] - Project change callback
 * @property {string} [defaultEnvironment] - Default environment
 * @property {string} [variant] - Style variant: 'menu' or 'standalone'
 */

const ProjectSelector = ({
    onEnvironmentChange,
    onProjectChange,
    defaultEnvironment = getDefaultEnvironment().id,
    variant = 'standalone'
}) => {
    // Get projects with pre-generated links
    const allProjects = getProjectsWithLinks();

    const [selectedEnv, setSelectedEnv] = useState(defaultEnvironment);
    const [selectedProject, setSelectedProject] = useState(allProjects[0]?.id || '');

    // Initialize selected project if not set
    useEffect(() => {
        if (!selectedProject && allProjects.length > 0) {
            setSelectedProject(allProjects[0].id);
        }
    }, [allProjects, selectedProject]);

    /**
     * Handle environment click
     * @param {Object} env - Environment object
     */
    const handleEnvClick = (env) => {
        setSelectedEnv(env.id);
        if (onEnvironmentChange) {
            onEnvironmentChange(env);
        }

        // If a project is selected, trigger project change with new environment
        if (selectedProject && onProjectChange) {
            const project = allProjects.find(p => p.id === selectedProject);
            const currentEnv = ENVIRONMENTS.find(e => e.id === env.id);
            if (project && currentEnv) {
                onProjectChange(project, currentEnv);
            }
        }
    };

    /**
     * Handle project click - OPEN IN NEW TAB
     * @param {Object} project - Project object
     */
    const handleProjectClick = (project) => {
        setSelectedProject(project.id);

        const currentEnv = ENVIRONMENTS.find(e => e.id === selectedEnv);
        if (onProjectChange && currentEnv) {
            onProjectChange(project, currentEnv);
        }

        // Get the URL and open in new tab
        const url = getCurrentProjectLink(project.id, selectedEnv);

        if (url && url !== '#') {
            // Open in new tab with security attributes
            window.open(url, '_blank', 'noopener,noreferrer');
        } else {
            console.warn(`Invalid URL for ${project.name} in ${selectedEnv} environment`);
        }
    };

    /**
     * Get current selected environment
     * @returns {Object|undefined}
     */
    const getCurrentEnv = () => ENVIRONMENTS.find(e => e.id === selectedEnv);

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
        const url = getCurrentProjectLink(project.id, selectedEnv);

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
                    {ENVIRONMENTS.map((env, index) => (
                        <React.Fragment key={env.id}>
                            <button
                                type="button"
                                onClick={() => handleEnvClick(env)}
                                className={`${styles.envButton} ${selectedEnv === env.id ? styles.envButtonActive : ''}`}
                                title={`Switch to ${env.name} environment`}
                                aria-label={env.name}
                                style={{
                                    backgroundColor: selectedEnv === env.id ? env.color : 'transparent',
                                    color: selectedEnv === env.id ? '#fff' : env.color,
                                    borderColor: env.color
                                }}
                            >
                                <span className={styles.envText}>{env.name}</span>
                            </button>
                            {index < ENVIRONMENTS.length - 1 && (
                                <span className={styles.separator}>·</span>
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {/* Current Selection moved to right side */}
                <div className={styles.currentSelection}>
                    <div className={styles.currentBadge}>
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
                            <span className={styles.projectEnvIndicator} style={{ color: project.color }}>
                                {selectedEnv.charAt(0).toUpperCase()}
                            </span>
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