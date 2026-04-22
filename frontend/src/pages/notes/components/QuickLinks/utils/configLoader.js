import * as group1Config from '../configs/group1/linksConfig';
import * as group2Config from '../configs/group2/linksConfig';
import * as personalConfig from '../configs/personal/linksConfig';

const CONFIG_REGISTRY = {
    group1: group1Config,
    group2: group2Config,
    personal: personalConfig
};

export const getSections = (groupId) => {
    const config = CONFIG_REGISTRY[groupId];

    if (!config) {
        console.warn(`QuickLinks configuration for group "${groupId}" not found. Using group1 as fallback.`);
        return CONFIG_REGISTRY.group1.SECTIONS || [];
    }

    return config.SECTIONS || [];
};

export const getCombinedSections = (groupIds) => {
    const allSections = [];

    groupIds.forEach(groupId => {
        const sections = getSections(groupId);
        // NO group identifier added - just merge the sections
        allSections.push(...sections);
    });

    return allSections;
}; 