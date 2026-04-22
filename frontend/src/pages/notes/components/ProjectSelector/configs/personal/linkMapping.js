/**
 * URL mapping logic for Personal
 */

import { ENVIRONMENTS } from './environment';
import { PROJECTS } from './project';

const PROJECT_URL_CONFIG = {
    personal: {
        'my-dashboard': '/dashboard',
        'notes': '/notes',
        'bookmarks': '/bookmarks'
    },
    test: {
        'my-dashboard': '/test/dashboard',
        'notes': '/test/notes',
        'bookmarks': '/test/bookmarks'
    }
};

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

export const generateAllProjectLinks = (projectId) => {
    const links = {};

    ENVIRONMENTS.forEach(env => {
        links[env.id] = generateProjectUrl(projectId, env.id);
    });

    return links;
};

export const getProjectsWithLinks = () => {
    return PROJECTS.map(project => ({
        ...project,
        links: generateAllProjectLinks(project.id)
    }));
};

export const getCurrentProjectLink = (projectId, environmentId) => {
    return generateProjectUrl(projectId, environmentId);
};

export const navigateToProject = (projectId, environmentId) => {
    const url = getCurrentProjectLink(projectId, environmentId);

    if (url && url !== '#') {
        if (url.startsWith('http')) {
            window.open(url, '_blank', 'noopener,noreferrer');
        } else {
            window.location.href = url;
        }
    } else {
        console.warn('Invalid URL, cannot navigate');
    }
};

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