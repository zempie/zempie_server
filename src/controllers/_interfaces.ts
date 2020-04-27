export interface IDecoded {
    uid: string,
}

export interface IAdmin extends IDecoded {
    name : string,
    level: number,
}


export interface IPublisher extends IDecoded {
    domain: string,
}

export interface IUser extends IDecoded {
    displayName: string,
    photoURL: string,
}

export interface ISocialMedia {
    user_uid: string,
    target_uid: string,
}

export interface IGameParams {
    game_uid: string,
    user_uid: string,
    score: number,
    limit: number,
    skip: number,
}

export interface IGame {
    uid: string,
    official: boolean,
    developer_uid: string,
    pathname: string,
    title: string,
    description: string,
    version: string,
    min_ratio: string,
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