'use strict';



module.exports = {
    apps: [
        {
            name: 'platform-server-studio',
            script: './dist/src/runStudio.js',
            watch: false,
            ignore_watch : ["node_modules", "public"],
            env: {
                NODE_ENV: 'development'
            },
            env_production: {
                NODE_ENV: 'production'
            },
            env_staging: {
                NODE_ENV: 'staging'
            }
        }
    ],

    deploy: {
        development: {
            user: 'loki',
            host: [{host:'192.168.0.10', port:'2105'}],
            ref : 'origin/dev_studio',
            repo: 'git@192.168.0.36:raptor/platform-api-server.git',
            path: '/home/loki/project/raptor/platform-server-studio',
            ssh_options: '',
            'post-deploy': 'yarn install && tsc && pm2 startOrRestart studio_ecosystem.config.js --env development'
        },
        staging: {
            user: 'loki',
            host: [{host:'192.168.0.10', port:'2105'}],
            ref : 'origin/master',
            repo: 'git@192.168.0.36:raptor/platform-api-server.git',
            path: '/home/loki/project/raptor/platform-server',
            ssh_options: '',
            'post-deploy': 'yarn install && tsc && pm2 startOrRestart ecosystem.config.js --env staging && pm2 startOrRestart admin_ecosystem.config.js --env staging'
        }
    }
};
