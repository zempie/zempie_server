import { Runtime } from 'inspector';

export const ErrorCodes = {

    UNAUTHORIZED: {
        code: 1001,
        message: 'Unauthorized'
    },
    INVALID_SESSION: {
        code: 1002,
        message: 'invalid session'
    },
    MAX_FILE_SIZE_EXCEEDED: {
        code: 1010,
        message: '전체 파일 용량 초과'
    },
    MAX_FIELDS_SIZE_EXCEEDED: {
        code: 1011,
        message: '개별 파일 용량 초과'
    },


    INVALID_PARAMS: {
        code: 1030,
        message: '파라미터 오류'
    },
    FORBIDDEN_STRING: {
        code: 1040,
        message: '사용할 수 없는 단어'
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
    INVALID_GAME_ID: {
        code: 1111,
        message: '게임 ID 오류'
    },
    INVALID_CHANNEL_ID: {
        code: 1112,
        message: '채널 ID 오류'
    },

    INVALID_FCM_TOKEN: {
        code: 1121,
        message: '사용자 FCM 토큰 오류'
    },
    INVALID_NOTICE_ID: {
        code: 1141,
        message: '공지사항 ID 오류'
    },


    FORBIDDEN_ADMIN: {
        message: '관리자 로그인 금지'
    },
    INVALID_ADMIN_USERNAME: {
        code: 1201,
        message: '관리자 로그인 오류'
    },
    INVALID_ADMIN_PASSWORD: {
        code: 1202,
        message: '관리자 로그인 오류'
    },
    INVALID_ADMIN_REFRESH_TOKEN: {
        code: 1203,
        message: '관리자 토큰 오류'
    },
    INVALID_ADMIN_LEVEL: {
        message: '관리자 권한 오류'
    },
    INVALID_ADMIN_PARAMS: {
        message: '관리자 파라미터 오류'
    },
    ALREADY_ADMIN_USER_READ_MAIL: {
        code: 1211,
        message: '이미 읽은 우편',
    },


    USER_ALREADY_VERIFIED_EMAIL: {
        code: 2101,
        message: '이미 인증된 메일'
    },
    USER_INVALID_VERIFIED_EMAIL: {
        code: 2102,
        message: '이메일 인증 안됨'
    },
    USER_DUPLICATED_CHANNEL_ID: {
        code: 2103,
        message: 'Channel ID 중복'
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
    INVALID_BATTLE: {
        code: 1402,
        message: '배틀 오류'
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
    },


    INVALID_QNA_PARAMS: {
        message: 'QnA 파라미터 오류'
    },


    INVALID_PLAYLIST_UID: {
        code: 3101,
        message: 'Playlist UID 오류'
    },
    PLAYLIST_DUPLICATED_GAME: {
        code: 3102,
        message: '플레이 리스트 게임 중복'
    },
};



export const CreateError = (err: any, ...args: any) => {
    if( !!err ) {
        throw new Error(err.message)
    }
    throw new Error(err.message);
};
