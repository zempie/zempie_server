"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eItemUsingType = exports.ePubType = exports.eAppLang = exports.eAppTheme = exports.eRedis = exports.eAlarm = exports.eNotify = exports.eTimeline = exports.eReportType = exports.eInquiry = exports.eNotice = void 0;
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
})(eReportType = exports.eReportType || (exports.eReportType = {}));
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
//# sourceMappingURL=enums.js.map