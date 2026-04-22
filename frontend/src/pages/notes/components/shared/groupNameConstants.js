// 文件：shared/groupNameConstants.js
export const GROUP_DISPLAY_NAMES = {
    group1: 'Sydney',        // Sydney in Chinese
    group2: 'Melbourne',      // Melbourne
    personal: 'Personal'
};

// Add this function export
export const getGroupDisplayName = (groupKey) => {
    return GROUP_DISPLAY_NAMES[groupKey] || groupKey;
};