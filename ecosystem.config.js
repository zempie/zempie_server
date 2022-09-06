'use strict';



module.exports = {
    apps: [
        {
            name: 'zempie-api-server',
            script: './dist/src/run.js',
            watch: false,
            ignore_watch : ["node_modules", "public"],
            env: {
                NODE_ENV: 'development',
                GOOGLE_APPLICATION_CREDENTIALS:'./config/firebase/client-secret.json'
            },
            env_production: {
                NODE_ENV: 'production',
                GOOGLE_APPLICATION_CREDENTIALS:'./config/firebase/client-secret.json'
            },
            env_staging: {
                NODE_ENV: 'staging',
                GOOGLE_APPLICATION_CREDENTIALS:'./config/firebase/client-secret.json'
            }
        }
    ],

    deploy: {
        development: {
            user: 'dev103',
            host: [{host:'192.168.0.10', port:'2105'}],
            ref : 'origin/master',
            repo: 'git@192.168.0.36:raptor/platform-api-server.git',
            path: '/home/dev103/projects/zempie/api-server',
            ssh_options: '',
            'post-deploy': 'npm install && tsc && pm2 startOrRestart ecosystem.config.js --env development'
        },
    }
};
