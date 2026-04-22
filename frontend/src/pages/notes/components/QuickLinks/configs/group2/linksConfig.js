/**
 * QuickLinks configuration for Group 2
 */

export const SECTIONS = [
    {
        type: 'github',
        image: '/assets/images/menu/github_logo.png',
        links: [
            {
                name: 'Service X',
                url: 'https://github.com/group2/service-x',
                color: '#333'
            },
            {
                name: 'Service Y',
                url: 'https://github.com/group2/service-y',
                color: '#333'
            }
        ]
    },
    {
        type: 'jira',
        image: '/assets/images/menu/jira_cloud.png',
        links: [
            {
                name: 'Service Board',
                url: 'https://group2.atlassian.net/jira/boards',
                color: '#0052CC'
            },
            {
                name: 'Service Tickets',
                url: 'https://group2.atlassian.net/jira/issues',
                color: '#0052CC'
            }
        ]
    },
    {
        type: 'aws',
        image: '/assets/images/menu/aws_logo.png',
        links: [
            {
                name: 'Console',
                url: 'https://console.aws.amazon.com/group2',
                color: '#FF9900'
            },
            {
                name: 'CloudWatch',
                url: 'https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#',
                color: '#FF9900'
            }
        ]
    },
    {
        type: 'salesforce',
        image: '/assets/images/menu/salesforce.com_logo.svg.png',
        links: [
            {
                name: 'Group 2 Prod',
                url: 'https://group2.my.salesforce.com',
                color: '#00A1E0'
            }
        ]
    }
];