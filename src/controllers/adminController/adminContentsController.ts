import * as _ from 'lodash';
import { IAdmin, IZempieClaims } from '../_interfaces';
import { dbs } from '../../commons/globals';
import admin from 'firebase-admin';


class AdminContentsController {
    punishGame = async ({ game_id, title, content }: any, _admin: IAdmin) => {
        // make the game disabled
        const game = await dbs.Game.findOne({ id: game_id });
        game.enabled = false;
        game.save();

        // send a mail
        await dbs.UserMailbox.create({
            user_id: game.user_id,
            title,
            content,
        })
    }


    punishUser = async ({ user_id, name, value, date }: any, _admin: IAdmin) => {
        const userClaim = await dbs.UserClaim.find({id: user_id});
        const claim: IZempieClaims = JSON.parse(userClaim.data);

        claim.zempie.deny[name] = {
            state: value,
            date,
            count: value? claim.zempie.deny[name].count + 1 : 1,
        };

        userClaim.data = claim;
        userClaim.save();

        await admin.auth().setCustomUserClaims(userClaim.user_uid, claim);
    }
}


export default new AdminContentsController()
