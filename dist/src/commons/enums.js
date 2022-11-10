"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ePlatformType = exports.eGameType = exports.eProjectStage = exports.eItemUsingType = exports.ePubType = exports.eAppLang = exports.eAppTheme = exports.eRedis = exports.eAlarm = exports.eNotify = exports.eTimeline = exports.eProjectVersionState = exports.eProjectState = exports.eMailCategory = exports.eReplyReaction = exports.eGameEmotion = exports.eGameCategory = exports.eReportType = exports.eInquiry = exports.eNotice = void 0;
var eNotice;
(function (eNotice) {
    eNotice[eNotice["Etc"] = 0] = "Etc";
    eNotice[eNotice["Normal"] = 1] = "Normal";
    eNotice[eNotice["Suspend"] = 2] = "Suspend";
    eNotice[eNotice["Update"] = 3] = "Update";
    eNotice[eNotice["Event"] = 4] = "Event";
})(eNotice = exports.eNotice || (exports.eNotice = {}));
var eInquiry;
(function (eInquiry) {
    eInquiry[eInquiry["Etc"] = 0] = "Etc";
    eInquiry[eInquiry["Game"] = 1] = "Game";
    eInquiry[eInquiry["Environment"] = 2] = "Environment";
    eInquiry[eInquiry["Personality"] = 3] = "Personality";
    eInquiry[eInquiry["Studio"] = 4] = "Studio";
})(eInquiry = exports.eInquiry || (exports.eInquiry = {}));
var eReportType;
(function (eReportType) {
    eReportType[eReportType["User"] = 0] = "User";
    eReportType[eReportType["Game"] = 1] = "Game";
    eReportType[eReportType["Reply"] = 2] = "Reply";
})(eReportType = exports.eReportType || (exports.eReportType = {}));
var eGameCategory;
(function (eGameCategory) {
    eGameCategory[eGameCategory["Challenge"] = 0] = "Challenge";
    eGameCategory[eGameCategory["Certified"] = 1] = "Certified";
    eGameCategory[eGameCategory["Affiliated"] = 2] = "Affiliated";
    eGameCategory[eGameCategory["ZemJam"] = 3] = "ZemJam";
})(eGameCategory = exports.eGameCategory || (exports.eGameCategory = {}));
var eGameEmotion;
(function (eGameEmotion) {
    eGameEmotion[eGameEmotion["Excellent"] = 0] = "Excellent";
})(eGameEmotion = exports.eGameEmotion || (exports.eGameEmotion = {}));
var eReplyReaction;
(function (eReplyReaction) {
    eReplyReaction[eReplyReaction["none"] = 0] = "none";
    eReplyReaction[eReplyReaction["good"] = 1] = "good";
    eReplyReaction[eReplyReaction["bad"] = 2] = "bad";
})(eReplyReaction = exports.eReplyReaction || (exports.eReplyReaction = {}));
var eMailCategory;
(function (eMailCategory) {
    eMailCategory[eMailCategory["Normal"] = 0] = "Normal";
    eMailCategory[eMailCategory["Alarm"] = 1] = "Alarm";
    eMailCategory[eMailCategory["AllowProjectVersion"] = 2] = "AllowProjectVersion";
    eMailCategory[eMailCategory["BanProjectVersion"] = 3] = "BanProjectVersion";
    eMailCategory[eMailCategory["BanProject"] = 4] = "BanProject";
    eMailCategory[eMailCategory["BanGame"] = 5] = "BanGame";
})(eMailCategory = exports.eMailCategory || (exports.eMailCategory = {}));
var eProjectState;
(function (eProjectState) {
    eProjectState[eProjectState["Normal"] = 0] = "Normal";
    eProjectState[eProjectState["Ban"] = 1] = "Ban";
    eProjectState[eProjectState["PermanentBan"] = 2] = "PermanentBan";
})(eProjectState = exports.eProjectState || (exports.eProjectState = {}));
var eProjectVersionState;
(function (eProjectVersionState) {
    eProjectVersionState[eProjectVersionState["None"] = 0] = "None";
    eProjectVersionState[eProjectVersionState["Process"] = 2] = "Process";
    eProjectVersionState[eProjectVersionState["Fail"] = 4] = "Fail";
    eProjectVersionState[eProjectVersionState["Passed"] = 8] = "Passed";
    eProjectVersionState[eProjectVersionState["Deploy"] = 16] = "Deploy";
    eProjectVersionState[eProjectVersionState["Ban"] = 32] = "Ban";
})(eProjectVersionState = exports.eProjectVersionState || (exports.eProjectVersionState = {}));
// export enum eProjectVersionState {
//     none = 'none',          //업로드전
//     process = 'process',    //심사중
//     fail = 'fail',          //심사 미통과
//     passed = 'passed',      //심사 통과
//     deploy = 'deploy',      //배포중
//     ban = 'ban',            //이용정지
// }
var eTimeline;
(function (eTimeline) {
    eTimeline[eTimeline["PR"] = 1] = "PR";
    eTimeline[eTimeline["PRW"] = 2] = "PRW";
    eTimeline[eTimeline["Share"] = 3] = "Share";
    eTimeline[eTimeline["Achievement"] = 4] = "Achievement";
    eTimeline[eTimeline["Battle_1st"] = 5] = "Battle_1st";
})(eTimeline = exports.eTimeline || (exports.eTimeline = {}));
var eNotify;
(function (eNotify) {
    eNotify[eNotify["Alarm"] = 0] = "Alarm";
    eNotify[eNotify["Battle"] = 1] = "Battle";
    eNotify[eNotify["Beat"] = 2] = "Beat";
    eNotify[eNotify["Follow"] = 3] = "Follow";
    eNotify[eNotify["Like"] = 4] = "Like";
    eNotify[eNotify["Reply"] = 5] = "Reply";
})(eNotify = exports.eNotify || (exports.eNotify = {}));
var eAlarm;
(function (eAlarm) {
    eAlarm[eAlarm["Follow"] = 0] = "Follow";
    eAlarm[eAlarm["Reply"] = 1] = "Reply";
    eAlarm[eAlarm["Like"] = 2] = "Like";
    eAlarm[eAlarm["Beaten"] = 3] = "Beaten";
})(eAlarm = exports.eAlarm || (exports.eAlarm = {}));
var eRedis;
(function (eRedis) {
    eRedis[eRedis["Geo"] = 0] = "Geo";
    eRedis[eRedis["Hashes"] = 1] = "Hashes";
    eRedis[eRedis["Lists"] = 2] = "Lists";
    eRedis[eRedis["Sets"] = 3] = "Sets";
    eRedis[eRedis["Strings"] = 4] = "Strings";
})(eRedis = exports.eRedis || (exports.eRedis = {}));
var eAppTheme;
(function (eAppTheme) {
    eAppTheme[eAppTheme["Default"] = 0] = "Default";
    eAppTheme[eAppTheme["Dark"] = 1] = "Dark";
    eAppTheme[eAppTheme["ColorWeakness"] = 2] = "ColorWeakness";
    eAppTheme[eAppTheme["Event"] = 3] = "Event";
})(eAppTheme = exports.eAppTheme || (exports.eAppTheme = {}));
var eAppLang;
(function (eAppLang) {
    eAppLang[eAppLang["KO"] = 0] = "KO";
    eAppLang[eAppLang["EN"] = 1] = "EN";
})(eAppLang = exports.eAppLang || (exports.eAppLang = {}));
var ePubType;
(function (ePubType) {
    ePubType[ePubType["Open"] = 0] = "Open";
    ePubType[ePubType["GamePlay"] = 1] = "GamePlay";
    ePubType[ePubType["PubGamePlay"] = 2] = "PubGamePlay";
    ePubType[ePubType["AD"] = 3] = "AD";
})(ePubType = exports.ePubType || (exports.ePubType = {}));
var eItemUsingType;
(function (eItemUsingType) {
    eItemUsingType[eItemUsingType["Permanent"] = 0] = "Permanent";
    eItemUsingType[eItemUsingType["Once"] = 1] = "Once";
    eItemUsingType[eItemUsingType["Period"] = 2] = "Period";
    eItemUsingType[eItemUsingType["Accumulated"] = 3] = "Accumulated";
})(eItemUsingType = exports.eItemUsingType || (exports.eItemUsingType = {}));
var eProjectStage;
(function (eProjectStage) {
    eProjectStage[eProjectStage["Dev"] = 1] = "Dev";
    eProjectStage[eProjectStage["Early"] = 2] = "Early";
    eProjectStage[eProjectStage["Complete"] = 3] = "Complete";
    eProjectStage[eProjectStage["Monetization"] = 4] = "Monetization";
})(eProjectStage = exports.eProjectStage || (exports.eProjectStage = {}));
var eGameType;
(function (eGameType) {
    eGameType[eGameType["Html"] = 1] = "Html";
    eGameType[eGameType["Download"] = 2] = "Download";
})(eGameType = exports.eGameType || (exports.eGameType = {}));
var ePlatformType;
(function (ePlatformType) {
    ePlatformType[ePlatformType["Window"] = 1] = "Window";
    ePlatformType[ePlatformType["Mac"] = 2] = "Mac";
    ePlatformType[ePlatformType["Android"] = 3] = "Android";
    ePlatformType[ePlatformType["Ios"] = 4] = "Ios";
})(ePlatformType = exports.ePlatformType || (exports.ePlatformType = {}));
//# sourceMappingURL=enums.js.map