export enum eNotice {
    Etc,
    Normal,
    Suspend,
    Update,
    Event,
}
export enum eInquiry {
    Etc,
    Game,
    Environment,
    Personality,
    Studio,
}
export enum eReportType {
    User,
    Game,
    Reply,
}
export enum eGameCategory {
    Challenge,
    Certified,
    Affiliated,
    ZemJam
}
export enum eGameEmotion {
    Excellent,
}
export enum eReplyReaction {
    none,
    good,
    bad,
}

export enum eMailCategory {
    Normal,
    Alarm,
    AllowProjectVersion,
    BanProjectVersion,
    BanProject,
    BanGame,
}

export enum eProjectState {
    Normal          = 0b0,
    Ban             = 0b1,
    PermanentBan    = 0b10,
}
export enum eProjectVersionState {
    None    = 0b0,      //업로드전
    Process = 0b10,     //심사중
    Fail    = 0b100,    //심사 미통과
    Passed  = 0b1000,   //심사 통과
    Deploy  = 0b10000,  //배포중
    Ban     = 0b100000, //이용정지
}
// export enum eProjectVersionState {
//     none = 'none',          //업로드전
//     process = 'process',    //심사중
//     fail = 'fail',          //심사 미통과
//     passed = 'passed',      //심사 통과
//     deploy = 'deploy',      //배포중
//     ban = 'ban',            //이용정지
// }


export enum eTimeline {
    PR = 1,
    PRW,
    Share,
    Achievement,
    Battle_1st,
}

export enum eNotify {
    Alarm,
    Battle,
    Beat,
    Follow,
    Like,
    Reply,
}

export enum eAlarm {
    Follow,
    Reply,
    Like,
    Beaten,
}

export enum eRedis {
    Geo,
    Hashes,
    Lists,
    Sets,
    Strings,
}

export enum eAppTheme {
    Default,
    Dark,
    ColorWeakness,
    Event,
}

export enum eAppLang {
    KO,
    EN,
}

export enum ePubType {
    Open,
    GamePlay,     // game play
    PubGamePlay,    // published game play
    AD,     // AD
}

export enum eItemState {
    Packaged,     // 아직 안깐 아이템. 받은 그대로이다. 
    None,       // 아이템을 받았지만 아직 사용하지 않았다.
    Using,      // 사용중 또는 장착중 
    Used,       // 사용했다.  더이상 사용할 수 없다. 
    Expired,
}

export enum eItemUsingType {
    Zem,
    Pie,
    Permanent,
    Once,
    Period,
    Accumulated,
    Package,
}

export enum eProjectStage {
    Dev = 1,
    Early,
    Complete,
    Monetization,
}


export enum eGameType {
    Html = 1,
    Download
}
  
export enum ePlatformType {
    Window = 1,
    Mac,
    Android,
    Ios
}


export enum eNotificationType {
    Notice = 1,
    Post,
    Post_like,
    Comment,
    Comment_like,
    Report,
    Retweet,
    Follow,
    Recomment,
    Dm
}

export enum eCoinLogType {
    // 코인이 생긴 경우 ( + )
    Payment = 1,
    Donation,
    Gift,
    Event,
    // 하단부터는 코인 사용 내역 ( - )
    sendDonation = 10, 
    sendGift,
}

export enum eDonationType{
    User,
    Post
}
  