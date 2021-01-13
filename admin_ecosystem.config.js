'use strict';



module.exports = {
    apps: [
        {
            name: 'zempie-admin',
            script: './dist/src/runAdmin.js',
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
            user: 'dev103',
            host: [{host:'192.168.0.10', port:'2105'}],
            ref : 'origin/master',
            repo: 'git@192.168.0.36:raptor/platform-api-server.git',
            path: '/home/dev103/projects/zempie/admin-api-server',
            ssh_options: '',
            'post-deploy': 'yarn install && tsc && pm2 startOrRestart admin_ecosystem.config.js --env development'
        },
    }
};
