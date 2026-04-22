/**
 * QuickLinks configuration for Group 1
 */

export const SECTIONS = [
    {
        type: 'ta_sso',
        image: '/assets/images/menu/tripadvisor-4.png',
        links: [
            {
                name: 'Workday',
                url: 'https://www.myworkday.com/tripadvisor/d/home.htmld',
                color: '#333'
            },
            {
                name: 'AWS',
                url: 'https://us-east-1.signin.aws.amazon.com/platform/login?workflowStateHandle=ab9985cc-6293-47fc-beeb-a3036763a40f',
                color: '#333'
            },
            {
                name: 'SSO',
                url: 'https://myapplications.microsoft.com/',
                color: '#333'
            }
        ]
    },
    {
        type: 'gitlab',
        image: '/assets/images/menu/gitlab.png',
        links: [
            {
                name: 'Viator',
                url: 'https://gitlab.com/viator/',
                color: '#333'
            },
            {
                name: 'Engineering',
                url: 'https://gitlab.com/viator/engineering',
                color: '#333'
            },
            {
                name: 'Infrastructure',
                url: 'https://gitlab.com/viator/infrastructure',
                color: '#333'
            },
            {
                name: 'App-support',
                url: 'https://gitlab.com/viator/engineering/app-support',
                color: '#333'
            }
        ]
    },
    {
        type: 'jira',
        image: '/assets/images/menu/jira_cloud.png',
        links: [
            {
                name: 'Board',
                url: 'https://viatorinc.atlassian.net/jira/software/c/projects/APPSUP/boards/89',
                color: '#8B00FF'
            },
            {
                name: 'Bug-New',
                url: 'https://viatorinc.atlassian.net/secure/CreateIssueDetails!init.jspa?pid=10089&issuetype=10040&reporter=712020%3A54173f2a-ea63-495a-8431-1cdae42a7b45&priority=10002&customfield_10390=12279&labels=vs-tools',
                color: '#ff000d'
            },
            {
                name: 'Bug-KTLO ',
                url: 'https://viatorinc.atlassian.net/secure/CreateIssueDetails!init.jspa?pid=10089&issuetype=10040&parent=APPSUP-7761&reporter=712020%3A54173f2a-ea63-495a-8431-1cdae42a7b45&priority=10002&customfield_10390=12279&labels=vs-tools',
                color: '#0052CC'
            },
            {
                name: 'Task-New',
                url: 'https://viatorinc.atlassian.net/secure/CreateIssueDetails!init.jspa?pid=10089&issuetype=10037&reporter=712020%3A54173f2a-ea63-495a-8431-1cdae42a7b45&priority=10002&customfield_10390=12279&labels=vs-tools',
                color: '#ff000d'
            },
            {
                name: 'Task-KTLO ',
                url: 'https://viatorinc.atlassian.net/secure/CreateIssueDetails!init.jspa?pid=10089&issuetype=10037&parent=APPSUP-7761&reporter=712020%3A54173f2a-ea63-495a-8431-1cdae42a7b45&priority=10002&customfield_10390=12279&labels=vs-tools',
                color: '#0052CC'
            },
            {
                name: 'RC',
                url: 'http://macos.local/viatorinc-sandbox-973.atlassian.net',
                color: '#ffd000'
            }
        ]
    },
    {
        type: 'vault',
        image: '/assets/images/menu/vault.png',
        links: [
            {
                name: 'INT',
                url: 'https://vault.common.int.viator.com/ui/vault/auth?with=token',
                color: '#FF0000',
                credentialKey: 'vault', // Add credential identifier
                credentialEnvironment: 'int',
                credentialType: 'api' // Indicates this needs credential retrieval
            },
            {
                name: 'Confluence',
                url: 'https://confluence.viator.com/pages/viewpage.action?spaceKey=TO&title=Adding+secrets+into+Vault',
                color: '#0000FF'
            }
        ]
    },
    {
        type: 'jenkins',
        image: '/assets/images/menu/jenkins_logo.svg.png',
        links: [
            {
                name: 'Prod',
                url: 'https://jenkins.prod.viatorsystems.com/',
                color: '#FF0000'
            },
            {
                name: 'Dev',
                url: '',
                color: '#FF7F00'
            },
            {
                name: 'Self-Service Prod',
                url: 'https://jenkins.prod.viatorsystems.com/job/Infrastructure/job/Vault/job/vault-self-service-prod/',
                color: '#00FF00'
            },
            {
                name: 'Self-Service RC',
                url: 'https://jenkins.prod.viatorsystems.com/job/Infrastructure/job/Vault/job/vault-self-service-rc/',
                color: '#0000FF'
            },
            {
                name: 'Restart Server Prod',
                url: 'https://jenkins.prod.viatorsystems.com/job/Apps/job/rolling-restart/',
                color: '#4B0082'
            },
            {
                name: 'Restart Server Dev',
                url: 'https://avrdevjenkins00n.ndmad2.tripadvisor.com/user/scorreia/search/?q=restart&amp;Jenkins-Crumb=e8f1004659cebafcd47a39babc186e3fdd3b6e7ea2921fff2318ce09cfd6e214',
                color: '#8B00FF'
            }
        ]
    },
    {
        type: 'salesforce',
        image: '/assets/images/menu/salesforce.com_logo.svg.png',
        links: [
            {
                name: 'Production',
                url: 'https://attractions.my.salesforce.com/',
                color: '#00A1E0'
            },
            {
                name: 'Test',
                url: 'https://test.salesforce.com/',
                color: '#FFFF00'
            }
        ]
    }
];