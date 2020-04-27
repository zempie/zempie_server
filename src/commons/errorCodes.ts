import { Runtime } from 'inspector';

export const ErrorCodes = {

    INVALID_TOKEN: {
        code: 1100,
        message: '잘 못 된 토큰입니다.'
    },

    ALREADY_FOLLOWING_TARGET: {
        code: 1302,
        message: '이미 팔로잉 중입니다',
    },
    ALREADY_UNFOLLOW_TARGET: {
        code: 1302,
        message: '팔로우 중이 아닙니다',
    },

    ALREADY_EXIST_PUBLISHER_GAME: {
        code: 1203,
        message: '이미 존재하는 퍼블리셔 게임입니다'
    },

};



export const CreateError = (err: any, ...args: any) => {
    if( !!err ) {
        throw new Error(err.message)
    }
    throw new Error(err.message);
};
