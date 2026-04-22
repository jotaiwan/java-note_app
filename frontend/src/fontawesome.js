// frontend/src/fontawesome.js
import { library } from '@fortawesome/fontawesome-svg-core';
import {
    faSpinner,
    faCircle,
    faFlag,
    faEye,
    faUsers,
    faStickyNote,
    faCheckCircle,
    // 新增：菜单相关图标
    faBars,           // 汉堡菜单图标 ☰
    faDownload,       // 下载图标
    faStar,           // 收藏图标
    faClock,          // 时钟图标
    faCog,            // 设置图标
    faListAlt,        // 列表图标
    faFileDownload,   // 文件下载图标
    faChevronRight    // 右箭头图标
} from '@fortawesome/free-solid-svg-icons';

// Add icons to library
library.add(
    faSpinner,
    faCircle,
    faFlag,
    faEye,
    faUsers,
    faStickyNote,
    faCheckCircle,
    // 新增图标
    faBars,
    faDownload,
    faStar,
    faClock,
    faCog,
    faListAlt,
    faFileDownload,
    faChevronRight
);