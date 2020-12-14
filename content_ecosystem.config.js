'use strict';



module.exports = {
    apps: [
        {
            name: 'zempie-content',
            script: './dist/src/runContent.js',
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
};
