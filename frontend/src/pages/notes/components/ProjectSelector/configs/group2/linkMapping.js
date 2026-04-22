/**
 * URL mapping logic for Group 2
 */

import { ENVIRONMENTS } from './environment';
import { PROJECTS } from './project';

const PROJECT_URL_CONFIG = {
    local: {
        'service-x': 'http://localhost:4000',
        'service-y': 'http://localhost:4001',
        'service-z': 'http://localhost:4002'
    },
    dev: {
        'service-x': 'https://service-x-dev.group2.example.com',
        'service-y': 'https://service-y-dev.group2.example.com',
        'service-z': 'https://service-z-dev.group2.example.com'
    },
    staging: {
        'service-x': 'https://service-x-staging.group2.example.com',
        'service-y': 'https://service-y-staging.group2.example.com',
        'service-z': 'https://service-z-staging.group2.example.com'
    },
    prod: {
        'service-x': 'https://service-x.group2.example.com',
        'service-y': 'https://service-y.group2.example.com',
        'service-z': 'https://service-z.group2.example.com'
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
        window.open(url, '_blank', 'noopener,noreferrer');
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