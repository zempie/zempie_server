export const ErrorCodes = {

    /*
        Common
    */
    UNAUTHORIZED: { code: 10001, message: 'Unauthorized' },
    INVALID_SESSION: { code: 10002, message: 'invalid session' },
    INVALID_PARAMS: { code: 10003, message: '파라미터 오류' },
    MAX_FILE_SIZE_EXCEEDED: { code: 10011, message: '전체 파일 용량 초과' },
    MAX_FIELDS_SIZE_EXCEEDED: { code: 10012, message: '개별 파일 용량 초과' },
    ACCESS_DENY: { code: 10101, message: 'Access Denied' },
    ACCESS_DENY_GAME: { code: 10101, message: '게임 금지' },
    ACCESS_DENY_REPLY: { code: 10101, message: '댓글 작성 금지' },
    INVALID_FILE_TYPE: { code: 10202, message: '파일 타입 오류' },

    /*
        User
     */
    INVALID_USER_UID: { code: 20001, message: '사용자 UID 오류' },
    INVALID_CHANNEL_ID: { code: 20002, message: '사용자 채널 ID 오류' },
    INVALID_FCM_TOKEN: { code: 20003, message: '사용자 FCM 토큰 오류' },
    INVALID_USER_NICKNAME: { code: 20004, message: '사용자 닉네임 오류' },


    USER_ALREADY_VERIFIED_EMAIL: { code: 20101, message: '이미 인증된 메일' },
    USER_INVALID_VERIFIED_EMAIL: { code: 20102, message: '이메일 인증 안됨' },
    USER_DUPLICATED_CHANNEL_ID: { code: 20103, message: 'Channel ID 중복' },
    USER_DUPLICATED_BANK_ACCOUNT: { code: 20104, message: '이미 등록된 계좌번호입니다.' },
    USER_INVALID_VERIFIED_ID: { code: 20105, message: '본인 인증 안됨' },
    USER_VERIFIED_ID_FAILURE: { code: 20106, message: '본인 인증 실패' },
    USER_ALREADY_VERIFIED_ID: { code: 20107, message: '이미 완료된 본인인증' },
    USER_NOT_EXIST_BANK_ACCOUNT: { code: 20108, message: '없는 계좌입니다.' },
    USER_VERIFIED_ID_DIFFERENT: { code: 20109, message: '본인 인증 실패' },

    BANNED_USER: { code: 20201, message: '제재중인 유저' },


    /*
        Game
     */
    INVALID_PLAY: { code: 30001, message: '게임 플레이 오류' },
    INVALID_GAME_ID: { code: 30011, message: '게임 ID 오류' },
    BATTLE_OVER: { code: 31001, message: '배틀 끝났다' },
    INVALID_BATTLE: { code: 31002, message: '배틀 오류' },

    INVALID_REPLY: { code: 32101, message: '존재하지 않는 댓글입니다.' },



    /*
        Contents
     */
    FORBIDDEN_STRING: { code: 40101, message: '사용할 수 없는 단어' },
    INVALID_NOTICE_ID: { code: 40102, message: '공지사항 ID 오류' },

    INVALID_PLAYLIST_UID: { code: 41101, message: 'Playlist UID 오류' },
    PLAYLIST_DUPLICATED_GAME: { code: 41201, message: '플레이 리스트 게임 중복' },

    INVALID_TIMELINE_USER_UID: { code: 42110, message: '타임라인 유저 아이디 오류' },
    ALREADY_FOLLOWING_TARGET: { code: 42201, message: '이미 팔로잉 중입니다' },
    ALREADY_UNFOLLOW_TARGET: { code: 42202, message: '팔로우 중이 아닙니다' },
    BLOCK_USER: { code: 42203, message: '상호작용이 불가능한 유저입니다.' },


    INVALID_QNA_PARAMS: { code: 43101, message: 'QnA 파라미터 오류' },

    INVALID_ITEM_ID: { code: 44101, message: '아이템 아이디 오류' },
    BUY_DUPLICATED_ITEM: { code: 44201, message: '아이템 중복 구매 오류' },
    REJECT_USE_ITEM: { code: 44103, message: '아이템 사용 오류' },


    /*
        Admin
     */
    FORBIDDEN_ADMIN: { code: 50001, message: '관리자 로그인 금지' },
    INVALID_ADMIN_USERNAME: { code: 50002, message: '관리자 로그인 오류' },
    INVALID_ADMIN_PASSWORD: { code: 50003, message: '관리자 로그인 오류' },
    INVALID_ADMIN_REFRESH_TOKEN: { code: 50004, message: '관리자 토큰 오류' },
    INVALID_ADMIN_LEVEL: { code: 50005, message: '관리자 권한 오류' },
    INVALID_ADMIN_PARAMS: { code: 50006, message: '관리자 파라미터 오류' },
    INVALID_SURVEY_ID: { code: 50007, message: '관리자 설문조사 ID 오류' },

    ALREADY_ADMIN_USER_READ_MAIL: { code: 51001, message: '이미 읽은 우편' },

    ADMIN_GAME_PATHNAME_DUPLICATED: { code: 52001, message: '게임 Pathname 중복' },
    INVALID_GAME_CATEGORY: { code: 52002, message: '존재하지 않는 카테고리' },
    NOT_FOUND_GAME_JAM: { code: 52003, message: '게임젬에 등록된 게임이 아닙니다.' },

    INVALID_PROJECT_VERSION_STATE: { code: 53001, message: '프로젝트 버젼의 상태 부적합' },



    /*
        Studio
     */
    IS_NOT_DEVELOPER: { code: 60001, message: '개발자가 아님' },
    INVALID_ACCESS_PROJECT_ID: { code: 60010, message: '잘못된 프로젝트 접근' },
    INVALID_ACCESS_PROJECT_VERSION_ID: { code: 60011, message: '잘못된 프로젝트 버전 접근' },
    INVALID_SURVEY_USER_UID: { code: 62001, message: '설문조사 참여 사용자 UID 오류' },
    INVALID_SURVEY_FORM_ID: { code: 62002, message: '설문조사 FORM ID 오류' },
    INVALID_DEVELOPER_ID: { code: 63001, message: '개발자 정보를 찾을 수 없습니다.' },
    ALREADY_EXIST_GAME_PATH: { code: 64001, message: '이미 존재하는 게임 경로입니다.' },
    ACTIVE_VERSION: { code: 64002, message: '사용중인 버전 입니다.' },
    ALREADY_EXIST_UPDATE_VERSION: { code: 64003, message: '이미 등록된 버전이 있습니다.' },

    /*
         Report
      */
    ALREADY_BANNED_USER: { code: 70001, message: '이미 신고로 인해 정지된 유저입니다.' },


    /*
         Report
      */
    INVALID_ACCESS_EVENT_ID : { code: 80001, message: '잘못된 이벤트 접근' },



    /*
        User Payment , Coin,  Shop
     */
    USER_PAYMENT_BOOTPAY_RECEIPT_VERIFY_FAIL: { code: 90001, message: 'receipt id 검증 실패' },
    USER_PAYMENT_RECEIPT_GOOGLE_VERIFY_FAIL: { code: 90002, message: 'google receipt id 검증 실패' },
    USER_PAYMENT_RECEIPT_APPLE_VERIFY_FAIL: { code: 90003, message: 'apple receipt id 검증 실패' },

    USER_PAYMENT_NO_ITEM_TO_BE_GIVEN: { code: 91001, message: '지급할 아이템이 없음.' },
    USER_PAYMENT_ALREADY_USED_RECEIPT: { code: 91002, message: '이미 사용된 영수증' },
    USER_PAYMENT_CANCELED_RECEIPT: { code: 91003, message: '지급할 아이템이 없음.' },
    USER_PAYMENT_INVALID_RECEIPT: { code: 91004, message: '일치하지않는 영수증' },

    USER_COIN_NOT_ENOUGH_ZEM: { code: 92000, message: 'zem이 부족함.' },
    INVALID_COIN_UNIT: { code: 92001, message: '코인단위를 다시 확인해주세요' },
    NOT_ENOUGH_MIN_AMOUNT: { code: 92002, message: '최소 환전 금액을 맞춰주세요' },



    /**
     * 안쓰임
     */
    INVALID_TOKEN: {
        code: 1100,
        message: '잘 못 된 토큰입니다'
    },
    INVALID_GAME_KEY: {
        code: 1101,
        message: '게임 키 오류'
    },

    ALREADY_EXIST_PUBLISHER_GAME: {
        code: 1203,
        message: '이미 존재하는 퍼블리셔 게임입니다'
    },


};



export const CreateError = (err: any, ...args: any) => {
    const j = JSON.stringify({
        ...err,
        ...args,
    })
    return new Error(j);
};
