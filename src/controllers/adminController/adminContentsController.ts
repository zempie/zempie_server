import * as _ from 'lodash';
import { IAdmin, IZempieClaims } from '../_interfaces';
import { dbs } from '../../commons/globals';
import admin from 'firebase-admin';
import { Transaction } from 'sequelize';



interface IPunishParams {
    game_id: number
    permanent: boolean

    user_id: number
    deny_name: string
    is_deny: boolean
    date: Date
}
class AdminContentsController {
    punishGame = async ({ game_id, permanent, title, content }: any, _admin: IAdmin) => {
        await dbs.Game.getTransaction(async (transaction: Transaction) => {
            // make the game disabled
            const game = await dbs.Game.findOne({ id: game_id });
            game.enabled = false;
            game.save({ transaction });

            const project = await dbs.Project.findOne({ game_id });
            if ( permanent ) {
                // project.enable = false;
                // project.save({ transaction });
            }
            else {
                const version = await dbs.ProjectVersion.findOne({ project_id: project.id });
                version.state = 'pause';
                version.save({ transaction });
            }


            // send a mail
            await dbs.UserMailbox.create({
                user_id: game.user_id,
                title,
                content,
            }, transaction)
        })
    }


    punishUser = async ({ user_id, deny_name: name, is_deny, date }: any, _admin: IAdmin) => {
        const userClaim = await dbs.UserClaim.find({id: user_id});
        const claim: IZempieClaims = JSON.parse(userClaim.data);

        claim.zempie.deny[name] = {
            state: is_deny,
            date: new Date(date).getTime(),
            count: is_deny? claim.zempie.deny[name].count + 1 : 1,
        };

        userClaim.data = claim;
        userClaim.save();

        await admin.auth().setCustomUserClaims(userClaim.user_uid, claim);
    }
}


export default new AdminContentsController()
