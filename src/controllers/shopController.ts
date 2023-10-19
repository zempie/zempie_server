import { dbs } from '../commons/globals';
import { CreateError, ErrorCodes } from '../commons/errorCodes';
import { eItemUsingType, eItemState, eCoinLogType } from '../commons/enums';
import { Transaction } from 'sequelize';
import admin from 'firebase-admin';
import { NextFunction, Request, Response } from 'express';
import DecodedIdToken = admin.auth.DecodedIdToken;



interface IShopParams {
    refitem_id: number
}

interface ILogData { 
    user_uid: string,
    zem?: number,
    pie?: number,
    type: number,
    info?: object
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

   
    /**
     * 
     * @param uid : user_uid
     * @param refitem_id : 아이템 id
     * @param type : 전달된 아이템의 상태 ( 구매, 선물, 이벤트... )
     * @returns 
     */
    giveItem = async ( uid: string, refitem_id: number, type: eCoinLogType, info ?: object) => {
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
                        
                        // log 추가
                        await this.setCoinLog({
                            user_uid: uid,
                            zem: userCoin.zem - before_zem,
                            pie: userCoin.pie,
                            type,
                            info
                        })
    
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

    /**
     * 전달 혹은 받은 아이템 로그 기록 -> 결제 / 선물 / 이벤트등...
     */
    setCoinLog = async (logData: ILogData) => {
        
        return await dbs.UserCoinLog.create({
            user_uid: logData.user_uid,
            zem: logData.zem,
            pie: logData.pie,
            type: logData.type,
            info: logData.info
        })
    }



}


export default new ShopController()
