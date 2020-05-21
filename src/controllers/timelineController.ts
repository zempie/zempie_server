import * as _ from 'lodash'
import * as uniqid from 'uniqid';
import { v4 as uuid } from 'uuid';
import { ITimelineParams, IUser } from "./_interfaces";
import { dbs } from "../commons/globals";
import { Transaction } from "sequelize";
import { eTimeline } from "../commons/enums";
import { CreateError, ErrorCodes } from "../commons/errorCodes";

class TimelineController {

    async getList({user_uid, limit = 50, skip = 0}: ITimelineParams, user: IUser) {
        user_uid = user_uid || user.uid;
        const timeline = await dbs.Timeline.model.findAll({
            where: {
                user_uid,
            },
            attributes: {
                exclude: ['updated_at', 'deleted_at']
            },
            order: [['id', 'desc']],
            include: [{
                model: dbs.User.model,
                attributes: [['uid', 'user_uid'], ['display_name', 'displayName'], ['photo_url', 'photoURL']]
            }],
            limit,
            skip,
        });

        return {
            timeline: _.map(timeline, (t: any) => {
                return {
                    id: t.id,
                    type: t.type,
                    extra: JSON.parse(t.extra),
                    created_at: t.created_at,
                }
            })
        }
    }


    async doPosting({type, score, follower_ids, game_uid, achievement_id, battle_id}: ITimelineParams, user: IUser, transaction?: Transaction) {
        const uid = uniqid();
        let extra;
        switch( type ) {
            case eTimeline.PR:          extra = JSON.stringify({ score }); break;
            case eTimeline.PRW:         extra = JSON.stringify({ score, follower_ids }); break;
            case eTimeline.Share:       extra = JSON.stringify({ game_uid }); break;
            case eTimeline.Achievement: extra = JSON.stringify({ achievement_id }); break;
            case eTimeline.Battle_1st:  extra = JSON.stringify({ battle_id }); break;
        }

        const posting = await dbs.Timeline.create({
            uid,
            user_uid: user.uid,
            type,
            extra
        }, transaction);

        return {
            posting: {
                id: posting.id,
                uid,
                type: posting.type,
            }
        }
    }

    async deletePosting({uid}: ITimelineParams, user: IUser) {
        return dbs.Timeline.getTransaction(async (transaction: Transaction) => {
            const posting = await dbs.Timeline.findOne({ uid }, transaction);
            if( !posting ) {
                throw CreateError(ErrorCodes.INVALID_TIMELINE_USER_UID);
            }
            if( posting.user_uid !== user.uid ) {
                throw CreateError(ErrorCodes.INVALID_TIMELINE_USER_UID);
            }

            await posting.destroy({transaction});
        })
    }

}

export default new TimelineController()

export function checkTimeline() {

}