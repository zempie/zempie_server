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
        const _user = await dbs.User.findOne({uid: user_uid})

        const is_blocked = await dbs.Block.findOne({target_id:game.userId, user_id: _user.id})

        if(is_blocked){
            throw CreateError(ErrorCodes.BLOCK_USER);
        }

        const changed = await dbs.GameHeart.likeIt(game_id, user_uid, on);

        if ( changed ) {
            caches.game.delByPathname(game.pathname, user_uid);

            // MQ.send({
            //     topic: 'gameHeart',
            //     messages: [{
            //         value: JSON.stringify({
            //             user_uid,
            //             game_id,
            //             activated: on,
            //         })
            //     }]
            // })
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
    private getRetReplies = (replies: any) => {
        return {
            replies: replies.length > 0? _.map(replies, (r: any) => {
                const { user, target, my_reply } = r;
                return {
                    id: r.id,
                    content: r.content,
                    count_good: r.count_good,
                    count_bad: r.count_bad,
                    count_reply: r.count_reply,
                    created_at: r.created_at,
                    updated_at: r.updated_at,
                    user,
                    target: target? {
                        uid: target.uid,
                        name: target.name,
                        picture: target.picture,
                        channel_id: target.channel_id,
                    }: null,
                    my_reply: my_reply? my_reply.reaction : eReplyReaction.none,
                }
            }) : [],
        }
    }

    // 댓글
    getReplies = async (params: { game_id: number, limit: number, offset: number }, user: DecodedIdToken) => {
        const { game_id, limit, offset } = params;

        let ret = await caches.reply.getData(`zempie:game:reply:${game_id}`, JSON.stringify(params));
        if ( !ret ) {
            let user_uid;
            if ( user ) {
                user_uid = user.uid;
            }
            const {count, replies} = await dbs.GameReply.getReplies(game_id, { limit, offset }, user_uid);
            
            ret = {
                totalCount: count,
               ...this.getRetReplies(replies)};

            caches.reply.setData(ret, `zempie:game:reply:${game_id}`, JSON.stringify(params));
        }
        return ret;
    }

    // 대댓글
    getReReplies = async (params: { reply_id: number, limit: number, offset: number }, user: DecodedIdToken) => {
        const { reply_id, limit, offset } = params;

        let ret = await caches.reply.getData(`zempie:game:rereply:${reply_id}`, JSON.stringify(params));
        if ( !ret ) {
            let user_uid;
            if ( user ) {
                user_uid = user.uid;
            }
            const replies = await dbs.GameReply.getReReplies(reply_id, { limit, offset }, user_uid);
            ret = this.getRetReplies(replies);

            caches.reply.setData(ret, `zempie:game:rereply:${reply_id}`, JSON.stringify(params));
        }
        return ret;
    }

    // 댓글 쓰기
    leaveReply = async ({ game_id, reply_id, target_uid, content }: { game_id: number, reply_id?: number, target_uid?: string, content: string }, user: DecodedIdToken) => {
        // 불량 단어 색출
        if ( !dbs.BadWords.isOk(content) ) {
            throw CreateError(ErrorCodes.FORBIDDEN_STRING);
        }
        const game = await dbs.Game.findOne({ id: game_id });
        if ( !game ) {
            throw CreateError(ErrorCodes.INVALID_GAME_ID);
        }

        const _user = await dbs.User.findOne({uid: user.uid})
        const is_blocked = await dbs.Block.findOne({target_id:game.userId, user_id: _user.id})

        if(is_blocked){
            throw CreateError(ErrorCodes.BLOCK_USER);
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
            rp.count_reply += 1
            rp.save()
            
        }

        const reply = await dbs.GameReply.create({
            game_id,
            user_uid: user.uid,
            parent_reply_id: reply_id || null,
            target_uid: reply_id && target_uid ? target_uid : null,
            content,
        });

        const userInfo = await dbs.User.findOne({uid: user.uid})

        if ( reply_id ) {
            
            MQ.send({
                topic: 'gameReply',
                messages: [{
                    value: JSON.stringify({
                        reply_id,
                        data: {
                            reply: 1,
                        },
                    })
                }]
            })
        }

        return {
            content:reply.content ,
            count_bad: reply.count_bad,
            count_good: reply.count_good,
            count_reply: reply.count_reply,
            created_at: reply.created_at,
            id: reply.id,
            my_reply: reply.my_reply,
            target: reply.target,
            updated_at: reply.updated_at,
            user : userInfo,
            game_id
        }
    }


    // 댓글 좋아, 싫어
    reactReply = async ({ reply_id, reaction }: { reply_id: number, reaction: eReplyReaction }, user: DecodedIdToken) => {
        reaction = _.toNumber(reaction);
        let changed = false;
        let r = { good: 0, bad: 0, reply: 0 };

        const record = await dbs.UserGameReplyReaction.findOne({ reply_id, user_uid: user.uid });
        if ( record ) {
            if ( record.reaction !== reaction ) {
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
                changed = true;
                record.reaction = reaction;
                record.save();
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
                topic: 'gameReply',
                messages: [{
                    value: JSON.stringify({
                        reply_id,
                        data: r,
                    })
                }]
            })
        }

        return { reaction };
    }

    deleteReply = async ({id } : {id: string} , { uid }: DecodedIdToken) =>{
        const user = await dbs.User.findOne({ uid });
        
        return dbs.GameReply.getTransaction(async (transaction: Transaction) => {

            const reply = await dbs.GameReply.findOne({
                id: Number(id)         
            });
            if ( !reply ) {
                throw CreateError(ErrorCodes.INVALID_REPLY);
            }

            if ( user.uid !== reply.user_uid  ) {
                throw CreateError(ErrorCodes.INVALID_USER_UID)
            }

            return reply.destroy({transaction});
        })

    }
    
    updateReply = async (params : any, { uid }: DecodedIdToken) =>{
        return dbs.GameReply.getTransaction(async (transaction: Transaction) => {
            const user = await dbs.User.getInfo({ uid }, transaction);
            if (!user) {
                throw CreateError(ErrorCodes.INVALID_USER_UID);
            }
            
            const reply = await dbs.GameReply.findOne({
                id: params.id
            })

            if ( !reply ) {
                throw CreateError(ErrorCodes.INVALID_PARAMS);
            }

            if(uid !== reply.user_uid){
                throw CreateError(ErrorCodes.UNAUTHORIZED);
            }
            
            await dbs.GameReply.update({content: params.content}, {id: reply.id})
            reply.content = params.content
            await reply.save({transaction})

            return reply

        })
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
