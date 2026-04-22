/**
 * Configuration loader for different groups
 */

// Direct imports
import * as group1Environment from '../configs/group1/environment';
import * as group1Project from '../configs/group1/project';
import * as group1LinkMapping from '../configs/group1/linkMapping';

import * as group2Environment from '../configs/group2/environment';
import * as group2Project from '../configs/group2/project';
import * as group2LinkMapping from '../configs/group2/linkMapping';

import * as personalEnvironment from '../configs/personal/environment';
import * as personalProject from '../configs/personal/project';
import * as personalLinkMapping from '../configs/personal/linkMapping';

import { getGroupDisplayName } from '../../shared/groupNameConstants';

// Combine into configuration objects
const group1Config = {
    ENVIRONMENTS: group1Environment.ENVIRONMENTS || [],
    PROJECTS: group1Project.PROJECTS || [],
    getEnvironmentById: group1Environment.getEnvironmentById,
    getDefaultEnvironment: group1Environment.getDefaultEnvironment,
    getEnvironmentName: group1Environment.getEnvironmentName,
    getProjectsWithLinks: group1LinkMapping.getProjectsWithLinks,
    getCurrentProjectLink: group1LinkMapping.getCurrentProjectLink,
    navigateToProject: group1LinkMapping.navigateToProject,
    generateProjectUrl: group1LinkMapping.generateProjectUrl,
    generateAllProjectLinks: group1LinkMapping.generateAllProjectLinks,
    getAllUrls: group1LinkMapping.getAllUrls
};

const group2Config = {
    ENVIRONMENTS: group2Environment.ENVIRONMENTS || [],
    PROJECTS: group2Project.PROJECTS || [],
    getEnvironmentById: group2Environment.getEnvironmentById,
    getDefaultEnvironment: group2Environment.getDefaultEnvironment,
    getEnvironmentName: group2Environment.getEnvironmentName,
    getProjectsWithLinks: group2LinkMapping.getProjectsWithLinks,
    getCurrentProjectLink: group2LinkMapping.getCurrentProjectLink,
    navigateToProject: group2LinkMapping.navigateToProject,
    generateProjectUrl: group2LinkMapping.generateProjectUrl,
    generateAllProjectLinks: group2LinkMapping.generateAllProjectLinks,
    getAllUrls: group2LinkMapping.getAllUrls
};

const personalConfig = {
    ENVIRONMENTS: personalEnvironment.ENVIRONMENTS || [],
    PROJECTS: personalProject.PROJECTS || [],
    getEnvironmentById: personalEnvironment.getEnvironmentById,
    getDefaultEnvironment: personalEnvironment.getDefaultEnvironment,
    getEnvironmentName: personalEnvironment.getEnvironmentName,
    getProjectsWithLinks: personalLinkMapping.getProjectsWithLinks,
    getCurrentProjectLink: personalLinkMapping.getCurrentProjectLink,
    navigateToProject: personalLinkMapping.navigateToProject,
    generateProjectUrl: personalLinkMapping.generateProjectUrl,
    generateAllProjectLinks: personalLinkMapping.generateAllProjectLinks,
    getAllUrls: personalLinkMapping.getAllUrls
};

// Configuration registry
const CONFIG_REGISTRY = {
    group1: group1Config,
    group2: group2Config,
    personal: personalConfig
};

/**
 * Get configuration for a specific group
 * @param {string} groupId - Group ID (group1, group2, personal)
 * @returns {Object} Configuration object
 */
export const getConfig = (groupId) => {
    const config = CONFIG_REGISTRY[groupId];

    if (!config) {
        console.warn(`Configuration for group "${groupId}" not found. Using group1 as fallback.`);
        return CONFIG_REGISTRY.group1;
    }

    return config;
};

/**
 * Get all available group IDs
 * @returns {Array<string>} Array of group IDs
 */
export const getAvailableGroups = () => {
    return Object.keys(CONFIG_REGISTRY);
};

/**
 * Get default group
 * @returns {string} Default group ID
 */
export const getDefaultGroup = () => {
    // use .env first
    if (process.env.REACT_APP_DEFAULT_GROUP) {
        return process.env.REACT_APP_DEFAULT_GROUP;
    }

    // return default grouop1
    return 'group1';
};

/**
 * Get default group display name
 */
export const getDefaultGroupDisplayName = () => {
    const defaultGroup = getDefaultGroup();
    return getGroupDisplayName(defaultGroup);
};

/**
 * Get environments for a specific group
 * @param {string} groupId - Group ID
 * @returns {Array} Environments array
 */
export const getEnvironments = (groupId) => {
    const config = getConfig(groupId);
    return config.ENVIRONMENTS || [];
};

/**
 * Get projects for a specific group
 * @param {string} groupId - Group ID
 * @returns {Array} Projects array
 */
export const getProjects = (groupId) => {
    const config = getConfig(groupId);
    return config.PROJECTS || [];
};

/**
 * Get projects with links for a specific group
 * @param {string} groupId - Group ID
 * @returns {Array} Projects with links
 */
export const getProjectsWithLinks = (groupId) => {
    const config = getConfig(groupId);
    return config.getProjectsWithLinks ? config.getProjectsWithLinks() : [];
};

/**
 * Get current project link for a specific group
 * @param {string} groupId - Group ID
 * @param {string} projectId - Project ID
 * @param {string} environmentId - Environment ID
 * @returns {string} Project URL
 */
export const getCurrentProjectLink = (groupId, projectId, environmentId) => {
    const config = getConfig(groupId);
    return config.getCurrentProjectLink ?
        config.getCurrentProjectLink(projectId, environmentId) : '#';
};

/**
 * Get default environment for a specific group
 * @param {string} groupId - Group ID
 * @returns {Object} Default environment
 */
export const getDefaultEnvironment = (groupId) => {
    const config = getConfig(groupId);
    return config.getDefaultEnvironment ?
        config.getDefaultEnvironment() :
        { id: 'local', name: 'Local', color: '#10b981' };
};

/**
 * Get environment by ID for a specific group
 * @param {string} groupId - Group ID
 * @param {string} environmentId - Environment ID
 * @returns {Object|undefined} Environment object
 */
export const getEnvironmentById = (groupId, environmentId) => {
    const config = getConfig(groupId);
    return config.getEnvironmentById ?
        config.getEnvironmentById(environmentId) :
        undefined;
};