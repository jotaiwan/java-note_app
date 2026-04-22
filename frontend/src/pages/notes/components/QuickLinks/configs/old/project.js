/**
 * Project configuration
 * Defines all available projects
 */

export const PROJECTS = [
    {
        id: 'app-support',
        name: 'app-support',
        description: 'Project Alpha',
        color: '#8b5cf6',  // Purple
        icon: '🚀'
    },
    {
        id: 'adhoc-reports',
        name: 'adhoc-reports',
        description: 'Project Beta',
        color: '#0ea5e9',  // Sky Blue
        icon: '📊'
    },
    {
        id: 'compatitive-analysis',
        name: 'compatitive-analysis',
        description: 'Project Gamma',
        color: '#f59e0b',  // Amber
        icon: '🔧'
    },
    {
        id: 'staff',
        name: 'staff',
        description: 'Project Delta',
        color: '#10b981',  // Emerald
        icon: '📈'
    },
    {
        id: 'stingray',
        name: 'stingray',
        description: 'Project Delta',
        color: '#10b981',  // Emerald
        icon: '📈'
    }
];

/**
 * Get project by ID
 * @param {string} id - Project ID
 * @returns {Object|undefined} Project object
 */
export const getProjectById = (id) => {
    return PROJECTS.find(project => project.id === id);
};

/**
 * Get default project
 * @returns {Object} Default project
 */
export const getDefaultProject = () => {
    return PROJECTS[0];
};

/**
 * Get project display name
 * @param {string} id - Project ID
 * @returns {string} Display name
 */
export const getProjectName = (id) => {
    const project = getProjectById(id);
    return project ? project.name : 'Unknown Project';
};

/**
 * Get project URL for current environment
 * @param {string} projectId - Project ID
 * @param {string} environmentId - Environment ID
 * @returns {string} Project URL
 */
export const getProjectUrl = (projectId, environmentId) => {
    // This function now delegates to linkMapping
    // You'll need to import it in your component
    return `Will be handled by linkMapping.js`;
};

/**
 * Get all projects with their current environment URLs
 * @param {string} environmentId - Current environment ID
 * @returns {Array} Projects with URLs
 */
export const getProjectsForEnvironment = (environmentId) => {
    return PROJECTS.map(project => ({
        ...project,
        currentUrl: `Will be handled by linkMapping.js` // This will be set dynamically
    }));
};