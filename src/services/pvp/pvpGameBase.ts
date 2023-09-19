import { GameResultBody, ScoreBody, SCProtocol, UserScoreBody } from './../tcpProtocols';
import { mWS } from '../../controllers/tcp/tcpMatchController';
import { PvpGameType } from '../tcpMatchManager';
import { v4 as uuid } from 'uuid';
import { ReasonBody } from '../tcpProtocols';
import { SendPacket } from '../packetService';

export class Player {
    public ws: mWS;
    public score: number = 0;
    public isOver: boolean = false;

    constructor(user: mWS) {
        this.ws = user;
    }
}

export class Team {
    members: Player[] = [];
    public get score() {
        const score = this.members.reduce((totalScore, player) => totalScore + player.score, 0);
        return score;
    }
    public get isOver() {
        return this.members.find((player) => !player.isOver) == null;
    }
}

export interface PvpGameHandler {
    onGameEnd?: () => void;
}

export abstract class PvpGame {
    public readonly id: string = uuid();
    public abstract readonly game_type: PvpGameType;
    public players: Player[] = [];
    protected handler: PvpGameHandler;

    constructor(users: mWS[], handler: PvpGameHandler = {}) {
        this.players = users.map((item) => new Player(item));
        this.handler = handler;
    }

    abstract updateScore(user: mWS, score: number): void;
    abstract gameOver(user: mWS): void;
}

export abstract class PvpTeamGame extends PvpGame {
    public teams: Team[] = [];

    constructor(teams: mWS[][], handler: PvpGameHandler) {
        super(
            teams.reduce((prev, cur) => {
                return prev.concat(cur);
            }, []),
            handler
        );
    }
}

export abstract class PvpPersonalGame extends PvpGame {
    public updateScore(user: mWS, score: number): void {
        const player = this.players.find((item) => item.ws === user);
        if (player == null) {
            const body: ReasonBody = {
                reason: 'You are not this game room player',
            };
            SendPacket(user, SCProtocol.GAME_ROOM_SCORE_UPDATE_FAIL, body);
            return;
        }
        player.score = score;
        const body: ScoreBody = {
            score,
        };
        SendPacket(user, SCProtocol.GAME_ROOM_SCORE_UPDATE_SUCCESS, body);
    }

    public gameOver(user: mWS) {
        const player = this.players.find((item) => item.ws === user);
        if (player == null || player.isOver) {
            return;
        }
        player.isOver = true;
        const body: UserScoreBody = {
            game_id: this.id,
            user_id: user.userData.id,
            score: player.score,
        };
        SendPacket(user, SCProtocol.GAME_ROOM_PLAYER_GAME_OVER, body);

        // 게임이 완전히 종료되면
        if (this.players.find((player) => !player.isOver) == null) {
            for (const player of this.players) {
                const sort = [...this.players].sort((a, b) => a.score - b.score);
                const body: GameResultBody = {
                    game_id: this.id,
                    score: player.score,
                    win: sort.indexOf(player) < sort.length / 2,
                };
                SendPacket(player.ws, SCProtocol.GAME_ROOM_GAME_RESULT, body);
                SendPacket(player.ws, SCProtocol.GAME_ROOM_GAME_OVER);
            }
            this.handler.onGameEnd && this.handler.onGameEnd();
        }
    }
}
