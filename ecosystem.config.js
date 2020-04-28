'use strict';



module.exports = {
    apps: [
        {
            name: 'deploy-servers',
            script: './dist/src/run.js',
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
            ref : 'origin/master',
            repo: 'git@192.168.0.36:loki/platform-api-server.git',
            path: '/home/loki/project/raptor/platform-server',
            ssh_options: '',
            'post-deploy': 'yarn install && pm2 startOrRestart ecosystem.config.js --env development'
        },
        staging: {
            user: 'loki',
            host: [{host:'192.168.0.10', port:'2105'}],
            ref : 'origin/master',
            repo: 'git@192.168.0.36:loki/platform-api-server.git',
            path: '/home/loki/project/raptor/platform-server',
            ssh_options: '',
            'post-deploy': 'yarn install && pm2 startOrRestart ecosystem.config.js --env staging && pm2 startOrRestart admin_ecosystem.config.js --env staging'
        }
    }
};
