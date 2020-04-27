import development from './development';
import production from './production';
import staging from './staging';
import local from './local';

const rdb: any = {
    local,
    development,
    staging,
    production
};

let env = process.env.NODE_ENV;
if ( !env ) {
    env = 'local'
}

export default rdb[env];