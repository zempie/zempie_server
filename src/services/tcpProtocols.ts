export enum CSProtocol {
    AUTHOLIZATION = 'token', //TokenBody

    WAITING_ROOM_ENTER = 'waiting_room_enter', // WaitingRoomIdBody
    WAITING_ROOM_LEAVE = 'waiting_room_leave', // WaitingRoomIdBody

    WAITING_ROOM_START_MATCHING = 'waiting_room_matching_start', // StartMatchingBody
    WAITING_ROOM_STOP_MATCHING = 'waiting_room_matching_stop', // WaitingRoomIdBody

    MATCHING_ACCEPT = 'matching_accept', // AcceptIdBody
    MATCHING_DECLINE = 'matching_decline', // AcceptIdBody

    GAME_ROOM_SCORE_UPDATE = 'game_room_score_update', // UpdateGameScoreBody
    GAME_ROOM_PLAYER_GAME_OVER = 'game_room_player_game_over', // GameRoomIDBody
}

export enum SCProtocol {
    OPEN_OK = 'open_ok',
    ERROR = 'error', // ReasonBody

    AUTHOLIZATION_FAIL = 'auth_fail', // BodyBase
    AUTHOLIZATION_SUCCESS = 'auth_ok', // BodyBase

    WAITING_ROOM_ENTER_FAIL = 'waiting_room_enter_fail', // ReasonBody
    WAITING_ROOM_ENTER_SUCCESS = 'waiting_room_enter_ok', // WaitingRoomBody

    WAITING_ROOM_LEAVE_FAIL = 'waiting_room_leave_fail', // BodyBase
    WAITING_ROOM_LEAVE_SUCCESS = 'waiting_room_leave_ok', // BodyBase
    WAITING_ROOM_MEMBER_LEAVE = 'waiting_room_member_leave', // WaitingRoomMemberLeaveBody

    WAITING_ROOM_OWNER_CHANGED = 'waiting_room_owner_changed', // WaitingRoomChangeOwnerBody

    WAITING_ROOM_START_MATCHING = 'waiting_room_matching_start', // BodyBase
    WAITING_ROOM_STOP_MATCHING = 'waiting_room_matching_stop', // ReasonBody
    WAITING_ROOM_MATCHING_FAIL = 'waiting_room_matching_fail', // ReasonBody

    MATCHING = 'matching', // AcceptIdBody
    MATCHING_ALL_PLAYER_ACCEPT_SUCCESS = 'matching_all_player_accept_ok', // BodyBase
    MATCHING_ALL_PLAYER_ACCEPT_FAIL = 'matching_all_player_accept_fail', // BodyBase

    GAME_ROOM_ENTER_SUCCESS = 'game_room_enter_ok', // GameRoomBaseInfoBody
    GAME_ROOM_SCORE_UPDATE_SUCCESS = 'game_room_score_update_ok', // ScoreBody
    GAME_ROOM_SCORE_UPDATE_FAIL = 'game_room_score_update_fail', // ReasonBody
    GAME_ROOM_PLAYER_GAME_OVER = 'game_room_player_game_over', // UserScoreBody
    GAME_ROOM_GAME_RESULT = 'game_room_game_result', // GameResultBody
    GAME_ROOM_GAME_OVER = 'game_room_game_over', // BodyBase
}

type Token = {
    token: string;
};

type Reason = {
    reason?: string;
};

type AcceptID = {
    accept_id?: string;
};

type WaitingRoomID = {
    match_id?: string;
};

type WaitingRoomOwner = {
    owner?: string;
};

type WaitingRoomMembers = {
    players?: string[];
};

type UserID = {
    user_id?: string;
};

type GameType = {
    game_type?: number;
};

type TargetID = {
    target_id?: string;
};

type GameRoomID = {
    game_id?: string;
};

type Score = {
    score?: number;
};

type GameRoomBaseInfo = GameRoomID & GameType;

type GameResult = {
    win?: boolean;
};

// Packet
export interface Packet {
    head: SCProtocol | CSProtocol;
    body?: object;
}

// Body
export type TokenBody = Token;
export type ReasonBody = Reason;
export type WaitingRoomChangeOwnerBody = WaitingRoomID & WaitingRoomOwner;
export type WaitingRoomIdBody = WaitingRoomID;
export type WaitingRoomBody = WaitingRoomID & WaitingRoomOwner & WaitingRoomMembers & GameType & TargetID;
export type AcceptIDBody = AcceptID;
export type StartMatchingBody = WaitingRoomID & GameType & TargetID;
export type WaitingRoomMemberLeaveBody = WaitingRoomID & UserID;
export type GameRoomIDBody = GameRoomID;
export type UpdateGameScoreBody = GameRoomID & Score;
export type GameRoomBaseInfoBody = GameRoomBaseInfo;
export type ScoreBody = Score;
export type UserScoreBody = GameRoomID & UserID & Score;
export type GameResultBody = GameRoomID & GameResult & Score;
