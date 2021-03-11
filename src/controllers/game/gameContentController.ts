import * as _ from 'lodash';
import { caches, dbs } from '../../commons/globals';
import { Transaction } from 'sequelize';
import admin from 'firebase-admin';
import { CreateError, ErrorCodes } from '../../commons/errorCodes';
import MQ from '../../services/messageQueueService';
import { eReplyReaction } from '../../commons/enums';
import DecodedIdToken = admin.auth.DecodedIdToken;

interface IGameHeartParams {
    game_id: number
    on: boolean
}
interface IGameEmotionParams {
    game_id: number
    e_id: string
    on: boolean
}

class GameContentController {
    heart = async ({ game_id, on }: IGameHeartParams, user: DecodedIdToken) => {
        const user_uid = user.uid;
        const game = await dbs.Game.findOne({ id: game_id });
        if ( !game ) {
            throw CreateError(ErrorCodes.INVALID_GAME_ID);
        }

        const changed = await dbs.GameHeart.likeIt(game_id, user_uid, on);

        if ( changed ) {
            caches.game.delByPathname(game.pathname, user_uid);
            MQ.send({
                topic: 'gameHeart',
                messages: [{
                    value: JSON.stringify({
                        user_uid,
                        game_id,
                        activated: on,
                    })
                }]
            })
        }

        return {
            heart_on: on,
        }
    }


    emotion = async ({ game_id, e_id, on }: IGameEmotionParams, user: DecodedIdToken) => {
        const user_uid = user.uid;
        const game = await dbs.Game.findOne({ id: game_id });
        if ( !game ) {
            throw CreateError(ErrorCodes.INVALID_GAME_ID);
        }

        const changed = await dbs.UserGameEmotion.feelLike(game_id, user_uid, e_id, on);

        if ( changed ) {
            caches.game.delByPathname(game.pathname, user_uid);
            MQ.send({
                topic: 'gameEmotion',
                messages: [{
                    value: JSON.stringify({
                        user_uid,
                        game_id,
                        e_id,
                        activated: on,
                    })
                }]
            })
        }

        return {
            emotion_on: on,
        }
    }


    /**
     * 댓글
     */
    private getRetReplies = async (replies: any) => {
        return {
            replies: _.map(replies, (r: any) => {
                const { user, target } = r;
                return {
                    id: r.id,
                    content: r.content,
                    count_good: r.count_good,
                    count_bad: r.count_bad,
                    user: {
                        uid: user.uid,
                        name: user.name,
                        picture: user.picture,
                        channel_id: user.channel_id,
                    },
                    target: target? {
                        uid: target.uid,
                        name: target.name,
                        picture: target.picture,
                        channel_id: target.channel_id,
                    }: null,
                }
            })
        }
    }

    // 댓글
    getReplies = async ({ game_id, limit, offset }: { game_id: number, limit: number, offset: number }) => {
        const replies = await dbs.GameReply.getReplies(game_id, { limit, offset });
        return this.getRetReplies(replies);
    }

    // 대댓글
    getReReplies = async ({ reply_id, limit, offset }: { reply_id: number, limit: number, offset: number }) => {
        const replies = await dbs.GameReply.getReReplies(reply_id, { limit, offset });
        return this.getRetReplies(replies);
    }

    // 댓글 쓰기
    leaveReply = async ({ game_id, reply_id, target_uid, content }: { game_id: number, reply_id?: number, target_uid?: string, content: string }, user: DecodedIdToken) => {
        // 불량 단어 색출
        if ( !dbs.BadWords.isOk(content) ) {
            throw CreateError(ErrorCodes.FORBIDDEN_STRING);
        }

        if ( reply_id ) {
            const query: any = { activated: true, game_id, id: reply_id };
            if ( target_uid ) {
                query.user_uid = target_uid;
            }
            const rp = await dbs.GameReply.findOne(query);
            if ( !rp ) {
                throw CreateError(ErrorCodes.INVALID_PARAMS);
            }
        }

        await dbs.GameReply.create({
            game_id,
            user_uid: user.uid,
            parent_reply_id: reply_id || null,
            target_uid: reply_id && target_uid? target_uid : null,
            content,
        });

        if ( reply_id ) {
            // 알림?
        }
    }


    // 댓글 좋아, 싫어
    reactReply = async ({ reply_id, reaction }: { reply_id: number, reaction: eReplyReaction }, user: DecodedIdToken) => {
        reaction = _.toNumber(reaction);
        let changed = false;
        let r = { good: 0, bad: 0 };

        const record = await dbs.UserGameReplyReaction.findOne({ reply_id, user_uid: user.uid });
        if ( record ) {
            if ( record.reaction !== reaction ) {
                record.reaction = reaction;
                record.save();
                changed = true;
                if ( record.reaction === eReplyReaction.good ) {
                    r.good = -1;
                }
                else if ( record.reaction === eReplyReaction.bad ) {
                    r.bad = -1;
                }
                if ( reaction === eReplyReaction.good ) {
                    r.good += 1;
                }
                else if ( reaction === eReplyReaction.bad ) {
                    r.bad += 1;
                }
            }
        }
        else {
            await dbs.UserGameReplyReaction.create({ reply_id, user_uid: user.uid, reaction });
            changed = true;
            if ( reaction === eReplyReaction.good ) {
                r.good += 1;
            }
            else if ( reaction === eReplyReaction.bad ) {
                r.bad += 1;
            }
        }

        if ( changed ) {
            MQ.send({
                topic: 'gameReplyReaction',
                messages: [{
                    value: JSON.stringify({
                        reply_id,
                        reaction: r,
                    })
                }]
            })
        }

        return { reaction };
    }



    createOrUpdateChallengingReport = async ({ game_id, rating, comment }: any, user: DecodedIdToken) => {
        return await dbs.GameChallengingReport.getTransaction(async (transaction: Transaction) => {
            let report = await dbs.GameChallengingReport.findOne({ user_uid: user.uid, game_id }, transaction);
            if ( report ) {
                report.rating = rating;
                report.comment = comment;
                await report.save({ transaction });
            }
            else {
                report = await dbs.GameChallengingReport.create({ user_uid: user.uid, game_id, rating, comment }, transaction);
            }
        });
    }

    getReports = async ({ game_id, limit = 50, offset = 0 }: any, user: DecodedIdToken) => {
        const reports = await dbs.GameChallengingReport.findAll({ game_id }, {
            include: [{
                model: dbs.User.model,
            }],
            order: [['id', 'asc']],
            limit,
            offset,
        });

        return {
            reports: _.map(reports, (report: any) => {
                return {
                    rating: report.rating,
                    comment: report.comment,
                    user: {
                        uid: report.user.uid,
                        name: report.user.name,
                        picture: report.user.picture,
                    }
                }
            })
        }
    }
}


export default new GameContentController()
