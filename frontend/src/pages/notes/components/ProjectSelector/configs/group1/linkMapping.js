/**
 * URL mapping logic for Group 1
 */

import { ENVIRONMENTS } from './environment';
import { PROJECTS } from './project';

/**
 * Project URL configurations by environment for Group 1
 */
const PROJECT_URL_CONFIG = {
    local: {
        'app-support': 'http://localhost:8178',
        'adhoc-reports': 'http://localhost:8177',
        'competitive-analysis': 'http://localhost:8215',
        'stingray': 'http://localhost:8176',
        'staff': 'http://localhost:8179'
    },
    int: {
        'app-support': 'https://app-support.int.viator.com',
        'adhoc-reports': 'https://adhoc-reports.int.viator.com',
        'competitive-analysis': 'https://competitive-analysis.int.viator.com',
        'stingray': 'https://stingray.int.viator.com',
        'staff': 'https://staff.int.viator.com'
    },
    rc: {
        'app-support': 'https://app-support.rc.viatorsystems.com',
        'adhoc-reports': 'https://adhoc-reports.rc.viatorsystems.com',
        'competitive-analysis': 'https://competitive-analysis.rc.viatorsystems.com',
        'stingray': 'https://stingray.rc.viator.com',
        'staff': 'https://staff.rc.viator.com'
    },
    prod: {
        'app-support': 'https://app-support.prod.viatorsystems.com',
        'adhoc-reports': 'https://adhoc-reports.prod.viatorsystems.com',
        'competitive-analysis': 'https://competitive-analysis.prod.viatorsystems.com',
        'stingray': 'https://stingray.viator.com',
        'staff': 'https://staff.viator.com'
    }
};

/**
 * Generate URL for a project in a specific environment
 */
export const generateProjectUrl = (projectId, environmentId) => {
    const envUrls = PROJECT_URL_CONFIG[environmentId];

    if (!envUrls) {
        console.warn(`Environment ${environmentId} not found in URL config`);
        return '#';
    }

    const url = envUrls[projectId];

    if (!url) {
        console.warn(`Project ${projectId} not found in ${environmentId} environment`);
        return '#';
    }

    return url;
};

/**
 * Generate all links for a project across all environments
 */
export const generateAllProjectLinks = (projectId) => {
    const links = {};

    ENVIRONMENTS.forEach(env => {
        links[env.id] = generateProjectUrl(projectId, env.id);
    });

    return links;
};

/**
 * Generate project data with links for all projects
 */
export const getProjectsWithLinks = () => {
    return PROJECTS.map(project => ({
        ...project,
        links: generateAllProjectLinks(project.id)
    }));
};

/**
 * Get current project link
 */
export const getCurrentProjectLink = (projectId, environmentId) => {
    return generateProjectUrl(projectId, environmentId);
};

/**
 * Navigate to project URL
 */
export const navigateToProject = (projectId, environmentId) => {
    const url = getCurrentProjectLink(projectId, environmentId);

    if (url && url !== '#') {
        window.open(url, '_blank', 'noopener,noreferrer');
    }
};

/**
 * Get all URLs for display
 */
export const getAllUrls = () => {
    const result = {};

    ENVIRONMENTS.forEach(env => {
        result[env.id] = {};
        PROJECTS.forEach(project => {
            result[env.id][project.id] = generateProjectUrl(project.id, env.id);
        });
    });

    return result;
};