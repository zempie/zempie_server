import * as _ from 'lodash';
import { IAdmin, IZempieClaims } from '../_interfaces';
import { dbs } from '../../commons/globals';
import admin from 'firebase-admin';
import { Transaction } from 'sequelize';
import { eProjectState } from '../../commons/enums';



interface IPunishParams {
    game_id: number
    permanent: boolean

    user_id: number
    deny_name: string
    is_deny: boolean
    date: Date
}
class AdminContentsController {
    punishGame = async ({ game_id, permanent, title, content }: any) => {
        await dbs.Game.getTransaction(async (transaction: Transaction) => {
            // make the game disabled
            const game = await dbs.Game.findOne({ id: game_id });
            game.enabled = false;
            await game.save({ transaction });

            const project = await dbs.Project.findOne({ game_id });
            if ( permanent ) {
                project.state = eProjectState.PermanentBan;
                await project.save({ transaction });
            }
            else {
                const version = await dbs.ProjectVersion.findOne({ project_id: project.id });
                version.state = 'pause';
                await version.save({ transaction });
            }

            const developer = await dbs.User.findOne({ id: game.user_id });

            // send a mail
            await dbs.UserMailbox.create({
                user_uid: developer.uid,
                category: '알림',
                title,
                content,
            }, transaction)
        })
    }


    punishUser = async ({ user_id, category, reason, date }: any) => {
        const user = await dbs.User.findOne({ id: user_id });
        let userClaim = await dbs.UserClaim.findOne({ user_id });
        if ( !userClaim ) {
            userClaim = await dbs.UserClaim.createDefault(user_id, user.uid);
        }
        const claim: IZempieClaims = JSON.parse(userClaim.data);

        claim.zempie.deny[category] = {
            state: true,
            date: new Date(date).getTime(),
            count: claim.zempie.deny[category]?.count + 1 || 1,
        };

        userClaim.data = claim;
        userClaim.save();

        await admin.auth().setCustomUserClaims(userClaim.user_uid, claim);

        await dbs.UserPunished.create({
            user_id,
            is_denied: true,
            category,
            reason,
            end_at: new Date(date),
        });

        // send a mail
        await dbs.UserMailbox.create({
            user_uid: user.uid,
            category: '알림',
            title: '정지 안내',
            content: `너 ${category} 정지 먹음`,
        });
    }

    releasePunishedUser = async ({ id }: any) => {
        await dbs.UserPunished.getTransaction(async (transaction: Transaction) => {
            const record = await dbs.UserPunished.findOne({ id }, transaction);
            record.is_denied = false;
            await record.save({ transaction });

            const userClaim = await dbs.UserClaim.findOne({ user_id: record.user_id }, transaction);
            const claim: IZempieClaims = JSON.parse(userClaim.data);
            claim.zempie.deny[record.category].state = false;
            userClaim.data = claim;
            await userClaim.save({ transaction });

            await admin.auth().setCustomUserClaims(userClaim.user_uid, claim);
        });
    }

    punishedUserList = async ({ user_id, limit = 50, offset = 0, sort = 'id', dir = 'asc' }: any) => {
        const records = await dbs.UserPunished.model.findAll({
            where: { user_id },
            attributes: ['id', 'is_denied', 'category', 'reason', 'end_at', 'created_at'],
            order: [[sort, dir]],
            limit: _.toNumber(limit),
            offset: _.toNumber(offset),
        });
        return _.map(records, (d: any) => d.get({ plain: true }))
    }
}


export default new AdminContentsController()
