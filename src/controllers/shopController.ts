import { dbs } from '../commons/globals';
import { CreateError, ErrorCodes } from '../commons/errorCodes';
import { eItemUsingType, eItemState } from '../commons/enums';
import { Transaction } from 'sequelize';
import admin from 'firebase-admin';
import { NextFunction, Request, Response } from 'express';
import DecodedIdToken = admin.auth.DecodedIdToken;



interface IShopParams {
    refitem_id: number
}
class ShopController {

    getRefItemsAndShopItems = async ( { store_type }: { store_type: number }, _user: DecodedIdToken) => {
        try{
            store_type = Number(store_type || 3) || 3;
            const refitems = await dbs.RefItem.findAll();
            const shipitems = await dbs.Shop.findAll({store_type});
            return {
                refitems,
                shipitems
            }
        }catch(e){
            console.error(e)
        }
    }

    giveItem = async ( uid: string, refitem_id: number) => {
        try{
            let update:any = {}
            const user = await dbs.User.findOne({ uid });
            const user_id = user.id;
            const refitem = await dbs.RefItem.findOne({ id: refitem_id });
            if ( !refitem ) {
                throw CreateError(ErrorCodes.INVALID_ITEM_ID);
            }

            switch( refitem.used_type ){
                case eItemUsingType.Zem:
                    return await dbs.UserCoin.getTransaction(async (transaction: Transaction) => {
                        const userCoin = await dbs.UserCoin.findOne({ user_id }, transaction);
                        let before_zem = userCoin.zem;
                        userCoin.zem += refitem.quantity;
                        await userCoin.save({ transaction });
    
                        update.user = {}
                        update.user.coin = {
                            zem: userCoin.zem,
                            pie: userCoin.pie,
                            before_zem
                        }
                        
                        // TODO: log 추가
    
                        return update;
                    });
                break;
            }

        }catch(e){
            throw e
        }
    }


    giveZem = async ( fromUid:string, toUid: string, zem: number ) => {
        try{
            let update:any = {}
            const fromUser = await dbs.User.findOne({ uid: fromUid });
            const toUser = await dbs.User.findOne({ uid: toUid });
            if( !fromUser || !toUser ){
                throw CreateError(ErrorCodes.INVALID_USER_UID);
            }

            return await dbs.UserCoin.getTransaction(async (transaction: Transaction) => {
                const fromUserCoin = await dbs.UserCoin.findOne({ user_id: fromUser.id }, transaction);
                const toUserCoin = await dbs.UserCoin.findOne({ user_id: toUser.id }, transaction);

                let fromZem = fromUserCoin.zem;
                if( fromZem < zem ){
                    throw CreateError(ErrorCodes.USER_COIN_NOT_ENOUGH_ZEM);
                }
                let before_zem = fromUserCoin.zem;
                fromUserCoin.zem -= zem;
                toUserCoin.zem += zem;

                await fromUserCoin.save({ transaction });
                await toUserCoin.save({ transaction });
                
                update.user.coin = {
                    zem: fromUserCoin.zem,
                    pie: fromUserCoin.pie,
                    before_zem
                }
                
                // TODO: log 추가
    
                return update;
            });

        }catch(e){
            throw e;
        }
    }


    useItem = async ({ refitem_id }: IShopParams, user: DecodedIdToken) => {
        const userRecord = await dbs.User.findOne({ uid: user.uid });
        const user_id = userRecord.id;
        await dbs.Inventory.getTransaction(async (transaction: Transaction) => {
            const item = await dbs.Inventory.findOne({ user_id, refitem_id });
            if ( item.is_used ) {
                throw CreateError(ErrorCodes.REJECT_USE_ITEM);
            }
        })
    }



}


export default new ShopController()
