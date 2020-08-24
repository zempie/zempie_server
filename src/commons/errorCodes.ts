import { Runtime } from 'inspector';

export const ErrorCodes = {

    UNAUTHORIZED: {
        code: 1001,
        message: 'Unauthorized'
    },
    INVALID_PARAMS: {
        code: 1030,
        message: '파라미터 오류'
    },
    INVALID_TOKEN: {
        code: 1100,
        message: '잘 못 된 토큰입니다'
    },
    INVALID_GAME_KEY: {
        code: 1101,
        message: '게임 키 오류'
    },
    INVALID_USER_UID: {
        code: 1110,
        message: '잘 못 된 유저 아이디입니다'
    },
    INVALID_GAME_UID: {
        code: 1111,
        message: '게임 UID 오류'
    },
    INVALID_FCM_TOKEN: {
        code: 1121,
        message: '사용자 FCM 토큰 오류'
    },
    INVALID_NOTICE_ID: {
        code: 1141,
        message: '공지사항 ID 오류'
    },

    INVALID_TIMELINE_USER_UID: {
        code: 1210,
        message: '타임라인 유저 아이디 오류'
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

    BATTLE_OVER: {
        code: 1401,
        message: '배틀 끝났다'
    },

    INVALID_ITEM_ID: {
        code: 2101,
        message: '아이템 아이디 오류',
    },
    BUY_DUPLICATED_ITEM: {
        code: 2102,
        message: '아이템 중복 구매 오류',
    },
    REJECT_USE_ITEM: {
        code: 2103,
        message: '아이템 사용 오류',
    }
};



export const CreateError = (err: any, ...args: any) => {
    if( !!err ) {
        throw new Error(err.message)
    }
    throw new Error(err.message);
};
