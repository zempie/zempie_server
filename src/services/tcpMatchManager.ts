import {
    SCProtocol,
    AcceptIDBody,
    ReasonBody,
    WaitingRoomBody,
    WaitingRoomChangeOwnerBody,
    WaitingRoomMemberLeaveBody,
    WaitingRoomIdBody,
    StartMatchingBody,
} from './tcpProtocols';
import { dbs } from './../commons/globals';
import { v4 as uuid } from 'uuid';
import { mWS } from './../controllers/tcp/tcpMatchController';
import { SendPacket } from './packetService';
import PvpGameManager from './pvp/pvpGameManager';

export enum PvpGameType {
    Game1,
}

enum MatchingMode {
    Wait,
    Random,
    Custom,
}

class WaitingRoom {
    readonly id: string = uuid();
    level: number = 0;
    maxPlayer: number = 1;
    owner?: mWS = undefined;
    players: mWS[] = [];
    gameType: PvpGameType | -1 = -1; // -1이면 빠른대전 (게임 제한 X)
    timeoutId?: NodeJS.Timeout;
    targetId: string = '';
    matchMode: MatchingMode = MatchingMode.Wait;
}

class AcceptRoom {
    readonly id: string = uuid();
    private rooms: WaitingRoom[] = [];
    public users: mWS[] = [];
    private accept_users: mWS[] = [];
    private ok_users: mWS[] = [];
    private timeout_id?: NodeJS.Timeout;
    private callback?: (accept_rooms: WaitingRoom[], decline_rooms: WaitingRoom[]) => void;
    constructor(
        rooms: WaitingRoom[],
        timeout_sec: number,
        callback?: (accept_rooms: WaitingRoom[], decline_rooms: WaitingRoom[]) => void
    ) {
        this.rooms = rooms;
        rooms.forEach((item) => {
            this.users = this.users.concat(item.players);
        });
        for (const user of this.users) {
            let body: AcceptIDBody = { accept_id: this.id };
            SendPacket(user, SCProtocol.MATCHING, body);
        }
        this.timeout_id = setTimeout(() => {
            for (const user of this.users) {
                if (!this.ok_users.includes(user)) this.decline(user);
            }
            this.timeout_id = undefined;
        }, timeout_sec * 1000);
        this.callback = callback;
    }

    decline(ws: mWS) {
        if (!this.users.includes(ws)) return;
        if (!this.ok_users.includes(ws)) this.ok_users.push(ws);
        const idx = this.accept_users.indexOf(ws);
        if (idx !== -1) this.accept_users.splice(idx, 1);
        if (this.ok_users.length >= this.users.length) this.complete();
    }

    accept(ws: mWS) {
        if (!this.users.includes(ws)) return;
        if (!this.ok_users.includes(ws)) this.ok_users.push(ws);
        if (!this.accept_users.includes(ws)) this.accept_users.push(ws);
        if (this.ok_users.length >= this.users.length) this.complete();
    }

    private complete() {
        if (this.timeout_id != null) clearTimeout(this.timeout_id);

        const accept_room = this.rooms.filter(
            // 거부한 유저가 없는 방
            (item) => item.players.find((player) => !this.accept_users.includes(player)) == null
        );
        const decline_room = this.rooms.filter(
            // 거부한 유저가 있는 방
            (item) => item.players.find((player) => !this.accept_users.includes(player)) != null
        );
        if (decline_room.length > 0) {
            for (const user of this.users) {
                SendPacket(user, SCProtocol.MATCHING_ALL_PLAYER_ACCEPT_FAIL);
            }
        } else {
            for (const user of this.users) {
                SendPacket(user, SCProtocol.MATCHING_ALL_PLAYER_ACCEPT_SUCCESS);
            }
        }
        this.callback && this.callback(accept_room, decline_room);
    }
}

const START_ELO = 1500;
const ELO_CONSTANTS = 400;
const WIN_CONSTANTS = 10;
const MATCH_LEVEL_DATA: { min_rate: number; max_rate: number; sec?: number }[] = [{ min_rate: 0.4, max_rate: 0.6 }];

class MatchManager {
    waitingRooms: WaitingRoom[] = [];
    acceptRooms: AcceptRoom[] = [];

    matchRoomEnter(ws: mWS, option: WaitingRoomIdBody) {
        const match_id = option.match_id || '';
        let room: WaitingRoom | undefined;
        if (match_id === '') {
            room = new WaitingRoom();
            room.players.push(ws);
            room.owner = ws;
            this.waitingRooms.push(room);
        } else {
            room = this.getMatchRoom(match_id);
            if (!room) {
                const body: ReasonBody = {
                    reason: 'Can not found this waiting room',
                };
                SendPacket(ws, SCProtocol.WAITING_ROOM_ENTER_FAIL, body);
                return;
            }
            if (room.players.includes(ws)) {
                const body: ReasonBody = {
                    reason: 'Already in this waiting room',
                };
                SendPacket(ws, SCProtocol.WAITING_ROOM_ENTER_FAIL, body);
                return;
            }
            if (room.players.length >= room.maxPlayer) {
                const body: ReasonBody = {
                    reason: 'the room is full',
                };
                SendPacket(ws, SCProtocol.WAITING_ROOM_ENTER_FAIL, body);
                return;
            }
            room.players.push(ws);
        }
        const body: WaitingRoomBody = {
            match_id: room.id,
            owner: room.owner?.userData.id,
            players: room.players.map((item) => item.userData.id),
            game_type: room.gameType,
            target_id: room.targetId,
        };
        SendPacket(ws, SCProtocol.WAITING_ROOM_ENTER_SUCCESS, body);
    }

    matchRoomLeave(ws: mWS, option: WaitingRoomIdBody) {
        const match_id = option.match_id || '';
        const room = this.getMatchRoom(match_id);
        if (!room) {
            let body: ReasonBody = { reason: 'Can not found this waiting room' };
            SendPacket(ws, SCProtocol.WAITING_ROOM_LEAVE_FAIL, body);
            return;
        }
        const idx = room.players.indexOf(ws);
        if (idx === -1) {
            let body: ReasonBody = { reason: 'Your not entered this room' };
            SendPacket(ws, SCProtocol.WAITING_ROOM_LEAVE_FAIL, body);
            return;
        }
        const players = [...room.players];
        room.players.splice(idx, 1);
        room.timeoutId != undefined && clearTimeout(room.timeoutId);
        if (room.matchMode !== MatchingMode.Wait) {
            room.matchMode = MatchingMode.Wait;
            let body: ReasonBody = { reason: 'User leave' };
            SendPacket(ws, SCProtocol.WAITING_ROOM_STOP_MATCHING, body);
        }
        if (room.players.length === 0) {
            const room_idx = this.waitingRooms.indexOf(room);
            this.waitingRooms.splice(room_idx, 1);
            room.timeoutId != undefined && clearTimeout(room.timeoutId);
        } else if (room.owner === ws) {
            room.owner = room.players[0];
            const body: WaitingRoomChangeOwnerBody = {
                match_id: room.id,
                owner: room.owner?.userData.id,
            };
            SendPacket(ws, SCProtocol.WAITING_ROOM_OWNER_CHANGED, body);
        }
        players.forEach((item) => {
            if (item === ws) {
                SendPacket(item, SCProtocol.WAITING_ROOM_LEAVE_SUCCESS);
            } else {
                const body: WaitingRoomMemberLeaveBody = {
                    match_id: room.id,
                    user_id: ws.userData.id,
                };
                SendPacket(item, SCProtocol.WAITING_ROOM_MEMBER_LEAVE, body);
            }
        });
    }

    startMatching(ws: mWS, option: StartMatchingBody) {
        const room = this.getMatchRoom(option.match_id || '');
        if (!room) return;
        if (room.owner !== ws) return;
        if (room.matchMode !== MatchingMode.Wait) return;

        if (option?.hasOwnProperty('game_type')) room.gameType = option?.game_type || -1;
        if (option?.hasOwnProperty('target_id')) room.targetId = option?.target_id || '';
        room.matchMode = room.targetId !== '' ? MatchingMode.Custom : MatchingMode.Random;
        room.players.forEach((player) => {
            SendPacket(player, SCProtocol.WAITING_ROOM_START_MATCHING);
        });
        this.setMatchLevelTimeout(room);
        this.matching();
    }

    stopMatching(ws: mWS, option: WaitingRoomIdBody) {
        const room = this.getMatchRoom(option.match_id || '');
        if (!room) return;
        if (room.owner !== ws) return;
        if (room.matchMode === MatchingMode.Wait) return;

        room.matchMode = MatchingMode.Wait;
        this.clearMatchLevelTimeout(room);
    }

    acceptMatch(ws: mWS, option: AcceptIDBody) {
        const accept_id = option.accept_id;
        const room = this.acceptRooms.find((item) => item.id === accept_id);
        if (!room) return;
        room.accept(ws);
    }

    declineMatch(ws: mWS, option: AcceptIDBody) {
        const accept_id = option.accept_id;
        const room = this.acceptRooms.find((item) => item.id === accept_id);
        if (!room) return;
        room.decline(ws);
    }

    private setMatchLevelTimeout(room: WaitingRoom) {
        const data = MATCH_LEVEL_DATA[room.level];
        if (data.hasOwnProperty('sec')) {
            room.timeoutId = setTimeout(() => {
                if (MATCH_LEVEL_DATA.length > room.level + 1) room.level += 1;
                room.timeoutId = undefined;
                this.setMatchLevelTimeout(room);
                this.matching();
            }, (data.sec || 0) * 1000);
        }
    }

    private clearMatchLevelTimeout(room: WaitingRoom) {
        room.level = 0;
        if (room.timeoutId != null) clearTimeout(room.timeoutId);
    }

    private getMatchRoom(id: string) {
        return this.waitingRooms.find((item) => item.id === id);
    }

    private async matching() {
        await this.randomMatching();
        await this.targetMatching();
    }

    private async randomMatching() {
        const matchingRooms = this.waitingRooms.filter((item) => item.matchMode === MatchingMode.Random);
        const removeRooms = [];
        if (matchingRooms.length <= 1) return;

        for (let i = 0; i < matchingRooms.length - 1; i++) {
            // 나중에 1명씩 10팀 받는 코드도 추가해야함
            // i_room을 여기로 빼고, 인원에 맞게 j_room에서 빼오면 될듯
            const i_room = matchingRooms[i];
            for (let j = i + 1; j < matchingRooms.length; j++) {
                const j_room = matchingRooms[j];
                let i_elos = await this.getWaitingRoomElos(i_room);
                let j_elos = await this.getWaitingRoomElos(j_room);
                if (i_room.gameType !== -1) i_elos = i_elos.filter((item) => item.game_type === i_room.gameType); // 신청 게임 필터링
                if (j_room.gameType !== -1) j_elos = j_elos.filter((item) => item.game_type === j_room.gameType); // 신청 게임 필터링
                i_elos = i_elos.filter((item) => j_elos.find((item2) => item2.game_type === item.game_type) != null); // 상대방 희망 게임 필터링
                j_elos = j_elos.filter((item) => i_elos.find((item2) => item2.game_type === item.game_type) != null); // 상대방 희망 게임 필터링

                const can_game_types = i_elos.map((item) => item.game_type);
                this.shuffleArray(can_game_types);

                for (const game_type of can_game_types) {
                    const i_elo = i_elos.find((item) => item.game_type === game_type)?.elo || START_ELO;
                    const j_elo = j_elos.find((item) => item.game_type === game_type)?.elo || START_ELO;

                    const winRatio = 1 / (1 + Math.pow(10, (j_elo - i_elo) / ELO_CONSTANTS));

                    const i_rule = MATCH_LEVEL_DATA[i_room.level];
                    const j_rule = MATCH_LEVEL_DATA[j_room.level];
                    const i_ok = winRatio >= i_rule.min_rate && winRatio <= i_rule.max_rate;
                    const j_ok = winRatio >= j_rule.min_rate && winRatio <= j_rule.max_rate;
                    if (i_ok && j_ok) {
                        // splice순서 매우 중요
                        i_room.timeoutId != undefined && clearTimeout(i_room.timeoutId);
                        j_room.timeoutId != undefined && clearTimeout(j_room.timeoutId);
                        removeRooms.push(matchingRooms.splice(j, 1)[0]);
                        removeRooms.push(matchingRooms.splice(i, 1)[0]);
                        i--;
                        j--;

                        const acceptRoom = new AcceptRoom([i_room, j_room], 10, (accept, decline) => {
                            const temp = acceptRoom;
                            if (decline.length == 0) {
                                PvpGameManager.enter({ game_type, users: [...i_room.players, ...j_room.players] });
                                return;
                            }
                            for (const acc of accept) {
                                this.waitingRooms.push(acc);
                                if (acc.owner && acc.targetId === '')
                                    this.startMatching(acc.owner, { match_id: acc.id });
                            }

                            for (const dec of decline) {
                                this.waitingRooms.push(dec);
                                dec.matchMode = MatchingMode.Wait;
                                dec.players.forEach((player) => {
                                    const body: ReasonBody = {
                                        reason: 'User matching declined',
                                    };
                                    SendPacket(player, SCProtocol.WAITING_ROOM_STOP_MATCHING, body);
                                });
                            }

                            const idx = this.acceptRooms.indexOf(temp);
                            this.acceptRooms.splice(idx, 1);
                        });

                        this.acceptRooms.push(acceptRoom);
                        break;
                    }
                }
            }
        }
        removeRooms.forEach((item) => {
            this.waitingRooms.splice(this.waitingRooms.indexOf(item), 1);
        });
    }

    private async targetMatching() {
        const matchingRooms = this.waitingRooms.filter((item) => item.matchMode === MatchingMode.Custom);
        const removeRooms = [];
        const hasTargetRooms = matchingRooms.filter((item) => item.targetId !== '');

        for (const room of hasTargetRooms) {
            const idx = matchingRooms.findIndex((item) => item.id === room.id);
            if (idx === -1) {
                room.matchMode = MatchingMode.Wait;
                room.players.forEach((player) => {
                    const body: ReasonBody = { reason: `Can not found room` };
                    SendPacket(player, SCProtocol.WAITING_ROOM_MATCHING_FAIL, body);
                });
                removeRooms.push(matchingRooms.splice(matchingRooms.indexOf(room), 1)[0]);
                continue;
            }
            const targetRoom = matchingRooms[idx];
            removeRooms.push(matchingRooms.splice(idx, 1)[0]);

            const game_type_numbers = Object.keys(PvpGameType)
                .filter((_) => typeof PvpGameType[_ as any] !== 'number')
                .map((_) => parseInt(_));
            const can_game_types = targetRoom.gameType === -1 ? game_type_numbers : [targetRoom.gameType];
            this.shuffleArray(can_game_types);

            const acceptRoom = new AcceptRoom([room, targetRoom], 10, (accept, decline) => {
                const temp = acceptRoom;
                if (decline.length == 0) {
                    PvpGameManager.enter({
                        game_type: can_game_types[0],
                        users: [...room.players, ...targetRoom.players],
                    });
                    return;
                }
                for (const acc of accept) {
                    this.waitingRooms.push(acc);
                    if (acc.owner && acc.targetId === '') this.startMatching(acc.owner, { match_id: acc.id });
                }

                for (const dec of decline) {
                    this.waitingRooms.push(dec);
                    dec.matchMode = MatchingMode.Wait;
                    dec.players.forEach((player) => {
                        const body: ReasonBody = {
                            reason: 'User matching declined',
                        };
                        SendPacket(player, SCProtocol.WAITING_ROOM_STOP_MATCHING, body);
                    });
                }

                const idx = this.acceptRooms.indexOf(temp);
                this.acceptRooms.splice(idx, 1);
            });

            this.acceptRooms.push(acceptRoom);
        }

        removeRooms.forEach((item) => {
            this.waitingRooms.splice(this.waitingRooms.indexOf(item), 1);
        });
    }

    private async getUserElo(user_id: number, game_type: PvpGameType): Promise<number> {
        let tuple = await dbs.PvpElo.findOne({ user_id, game_type });
        if (tuple == null) {
            tuple = await this.updateElo(user_id, game_type, START_ELO);
        }
        return tuple.elo;
    }

    private async getUserElos(user_id: number): Promise<{ game_type: PvpGameType; elo: number }[]> {
        const game_type_numbers = Object.keys(PvpGameType)
            .filter((_) => typeof PvpGameType[_ as any] !== 'number')
            .map((_) => parseInt(_));

        const result = [];

        for (const game_type of game_type_numbers) {
            const elo = await this.getUserElo(user_id, game_type);
            result.push({ game_type: game_type as PvpGameType, elo: elo });
        }
        return result;
    }

    private async getWaitingRoomElos(room: WaitingRoom) {
        let elos = await this.getUserElos(room.players[0].userData.id);
        for (let i = 1; i < room.players.length; i++) {
            const t_elos = await this.getUserElos(room.players[i].userData.id);
            for (const elo of t_elos) {
                const target = elos.find((item) => item.game_type === elo.game_type);
                if (target) target.elo += elo.elo;
            }
        }
        for (const elo of elos) {
            elo.elo /= room.players.length;
        }
        return elos;
    }

    public async updateElo(user_id: number, game_type: PvpGameType, elo: number) {
        let tuple = await dbs.PvpElo.update({ elo }, { where: { user_id, game_type } });
        if (tuple == null) {
            tuple = await dbs.PvpElo.create({ user_id, game_type, elo: elo });
        }
        return tuple;
    }

    // game_result
    // 1이면 승리
    // 0.5면 무승부
    // 0이면 패배
    public async updateEloWithGameResult(
        user_id: number,
        enemy_ids: number[],
        game_result: number,
        game_type: PvpGameType
    ) {
        const user_elo = await this.getUserElo(user_id, game_type);
        let enemy_elo = 0;
        for (const enemy_id of enemy_ids) {
            enemy_elo += await this.getUserElo(enemy_id, game_type);
        }
        enemy_elo /= enemy_ids.length;

        const win_ratio = 1 / (1 + Math.pow(10, (enemy_elo - user_elo) / ELO_CONSTANTS));
        const new_elo = user_elo + WIN_CONSTANTS * (game_result - win_ratio);

        await this.updateElo(user_id, game_type, new_elo);
    }

    private shuffleArray(array: any[]) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1)); // 0에서 i 사이의 임의의 인덱스 선택
            [array[i], array[j]] = [array[j], array[i]]; // 두 요소를 스왑
        }
    }

    public disconnected(ws: mWS) {
        const waitingRooms = this.waitingRooms.filter((room) => room.players.includes(ws));
        for (const room of waitingRooms) {
            this.matchRoomLeave(ws, { match_id: room.id });
        }
        const acceptRooms = this.acceptRooms.filter((room) => room.users.includes(ws));
        for (const room of acceptRooms) {
            this.declineMatch(ws, { accept_id: room.id });
        }
    }
}

const matchManager = new MatchManager();
export default matchManager;
