import ProjectSelector from './ProjectSelector';

// Export the main component
export default ProjectSelector;

// Also export the modular functions for external use
export {
    ENVIRONMENTS,
    getEnvironmentById,
    getDefaultEnvironment,
    getEnvironmentName
} from './environment';

export {
    PROJECTS,
    getProjectById,
    getDefaultProject,
    getProjectName
} from './project';

export {
    generateProjectUrl,
    generateAllProjectLinks,
    getProjectsWithLinks,
    getCurrentProjectLink,
    navigateToProject
} from './linkMapping';