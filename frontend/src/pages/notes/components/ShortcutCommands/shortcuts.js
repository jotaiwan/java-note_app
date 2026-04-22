// src/pages/notes/components/ShortcutCommands/shortcuts.js
export const shortcuts = [
    {
        id: 'container-adhoc',
        icon: '📁',
        label: 'Container adhoc-reports folder',
        command: 'cd /var/www/html/adhoc-reports'
    },
    {
        id: 'container-app',
        icon: '📁',
        label: 'Container app-support folder',
        command: 'cd /var/www/html/app-support'
    },
    {
        id: 'container-competitive',
        icon: '📁',
        label: 'Container competitive-analysis folder',
        command: 'cd /var/www/html/competitive-analysis'
    },
    {
        id: 'container-staff',
        icon: '📁',
        label: 'Container staff folder',
        command: 'cd /var/www/html/staff'
    },
    {
        id: 'container-stingray',
        icon: '📁',
        label: 'Container stingray folder',
        command: 'cd /var/www/html/stingray'
    },
    {
        id: 'aws-gdpr',
        icon: '☁️',
        label: 'GDPR Assume Role',
        command: 'aws sts assume-role --role-arn arn:aws:iam::347924498361:role/vi-dev-gdpr-data-removal-backup-readwrite --role-session-name s3-list-test'
    },
    {
        id: 'ls-folder',
        icon: '📋',
        label: 'Show folder and files',
        command: 'ls -lah --group-directories-first'
    },
    {
        id: 'git-submodule',
        icon: '🔧',
        label: 'Submodule update command',
        command: 'git submodule update --remote --recursive'
    }
];