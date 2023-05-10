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

    getRefItemsAndShopItems = async ( no:any, _user: DecodedIdToken) => {
        try{
            const refitems = await dbs.RefItem.findAll();
            const shipitems = await dbs.Shop.findAll();
            return {
                refitems,
                shipitems
            }
        }catch(e){
            console.error(e)
        }
    }

    testItemBuy = async ( {refitem_id}: IShopParams, _user: DecodedIdToken) => {
        try{
            let update = await this.buyItem ({ refitem_id }, _user)

            return { 
                message: "Success",
                update 
            }

        }catch(e){
            console.error(e)
        }
    }

    /*
    *   아이템 구매 --> 인벤토리에 추가
    */
    async buyItem ({ refitem_id }: IShopParams, user: DecodedIdToken) {
        const refitem = await dbs.RefItem.findOne({ id: refitem_id });
        if ( !refitem ) {
            throw CreateError(ErrorCodes.INVALID_ITEM_ID);
        }
        let update:any = {}

        const userRecord = await dbs.User.findOne({ uid: user.uid });
        const user_id = userRecord.id;

        // await dbs.Inventory.getTransaction(async (transaction: Transaction) => {
        //     const quantity = refitem.quantity;
        //     const item = await dbs.Inventory.create({
        //         user_id,
        //         refitem_id,
        //         used_type: refitem.used_type,
        //         quantity, 
        //         state: eItemState.Packaged,
        //         time_limit
        //     }, transaction);
        // })

        // 구입 가능한지 확인
        // 중복 확인
        switch( refitem.used_type ){
            case eItemUsingType.Zem:
                await dbs.UserCoin.getTransaction(async (transaction: Transaction) => {
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

        // 돈 있나 확인

        // 구매 - 포인트 차감

        // 구매 - 인벤토리에 추가
        // await dbs.Inventory.create({ user_id, item_id }, transaction);

    }

    async useItem({ refitem_id }: IShopParams, user: DecodedIdToken) {
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
