import { IAdmin } from '../_interfaces';
import { dbs } from '../../commons/globals';


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
}


export default new AdminContentsController()
