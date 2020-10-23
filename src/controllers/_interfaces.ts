import { eAlarm, eNotice, eNotify, eTimeline } from "../commons/enums";
import { KafkaService } from '../services/kafkaService';

/**
 * json-rpc
 */
export interface IRpcError {
    code: number,
    message: string,
    data: any
}
export interface IRpcMethod {
    auth: boolean,
    method: Function,
    is_admin: boolean,
}
export interface IRpcBody {
    jsonrpc: string,
    method: string,
    params: any,
    id: string,
}


/**
 * decoded
 */
export interface IDecoded {
    uid: string,
}
export interface IAdmin extends IDecoded {
    id: number,
    uid: string,
    name : string,
    level: number,
}
export interface IPublisher extends IDecoded {
    domain: string,
}
export interface IUser extends IDecoded {
    id?: number,
    name?: string,
    picture?: string,
}


/**
 * message queue - kafka
 */
export interface IMQ {
    producer: KafkaService.Producer
    consumer: KafkaService.Consumer
}
export interface IMQMethod {
    method: Function
}

/**
 * parameters
 */
export interface ISocialMedia {
    user_uid: string,
    target_uid: string,
}

export interface IGameParams {
    game_uid: string,
    user_uid: string,
    score: number,
    limit: number,
    offset: number,
    pid?: string,   // publishing_id
}
export interface IGamePlayParams {
    pathname: string,
    user_uid: string,
    score?: number,
}

export interface IGame {
    uid: string,
    official: boolean,
    developer_uid: string,
    pathname: string,
    title: string,
    description: string,
    version: string,
    // min_ratio: string,
    control_type: string,
    genre_arcade: boolean,
    genre_puzzle: boolean,
    genre_sports: boolean,
    genre_racing: boolean,
    count_start: number,
    count_over: number,
    url_game: string,
    url_thumb: string,
    url_title: string,
}

export interface ITimelineParams {
    uid?: string,
    user_id?: number,
    game_id?: number,
    user_uid?: string,
    game_uid?: string,
    limit?: number,
    offset?: number,
    type?: eTimeline,
    score?: number,
    follower_ids?: Array<number>,
    achievement_id?: number,
    battle_id?: number,
}

export interface INotifyParams {
    user_uid: string,
    type: eNotify,
    data?: { [key: string]: string };
}
export interface INotify {
    topic?: string,
    token?: string,
    title?: string,
    body?: string,
    imageUrl?: string,
    data?: { [key: string]: string };
}

export interface INoticeParams {
    id: number,
    type: eNotice,
    title: string,
    content: string,
    img_link: string,
    start_at: Date,
    end_at: Date,
}

export interface IAlarmParams {
    user_uid?: string,
    target_uid?: string,
    game_id?: number,
    type?: eAlarm,
    extra?: Object,
    limit: number,
    offset: number
}

export interface IBattleParams {
    battle_uid: string,
    battle_key?: string,
    period?: string,
    is_infinity?: boolean,
    score?: number,
}
export interface IBattlePlayParams {
    battle_key: string,
    score: number,
}
export interface IGameKey {
    uid: string,
    user_uid: string,
    secret_id: number,
    end_at?: Date
}
