import { dbs, caches } from '../commons/globals';
import admin from 'firebase-admin';
import { CreateError, ErrorCodes } from '../commons/errorCodes';
import DecodedIdToken = admin.auth.DecodedIdToken;
import { eCoinLogType, eDonationType, eItemUsingType } from '../commons/enums';
import { Transaction, Op, Sequelize, QueryTypes } from 'sequelize';
import shopController from './shopController';
import * as _ from 'lodash';


interface ITransferCoinParam{
  target_nickname: string,
  coin_type: eItemUsingType,
  amount: number,
  info: {
    type: eCoinLogType,
    target?: eDonationType
  }
}

/**
 * 코인 관련 ( ZEM, PIE ) 
 */
class CoinController {


  transferCoin = async ({ target_nickname, coin_type, amount, info } : ITransferCoinParam,  user: DecodedIdToken) => {
    if( !target_nickname || !amount || coin_type  === null || coin_type === undefined ){
      throw CreateError(ErrorCodes.INVALID_PARAMS);
    }
    
    if(amount % 10 !== 0){
      throw CreateError(ErrorCodes.INVALID_COIN_UNIT);
    }

    const userInfo = await dbs.User.findOne({ uid: user.uid })

    const targetUser = await dbs.User.findOne({nickname: target_nickname})

    if( !targetUser ){
      throw CreateError(ErrorCodes.INVALID_USER_NICKNAME);
    }

    return await dbs.UserCoin.getTransaction(async (transaction: Transaction) => {
      const fromUserCoin = await dbs.UserCoin.findOne({ user_id: userInfo.id })
      const targetUserCoin = await dbs.UserCoin.findOne({ user_id: targetUser.id }) 
      
      switch(coin_type){
        case eItemUsingType.Zem:
          if(fromUserCoin.zem < amount){
            throw CreateError(ErrorCodes.USER_COIN_NOT_ENOUGH_ZEM);
          }

          targetUserCoin.zem += amount
          fromUserCoin.zem -= amount

          await targetUserCoin.save({ transaction })
          await fromUserCoin.save({ transaction })

          const logTargetPayload : any = {
            user_uid: targetUser.uid,
            zem: amount,
            pie: targetUserCoin.pie,
           
          }

          const logUserPayload : any = {
            user_uid: user.uid,
            zem: amount,
            pie: fromUserCoin.pie,
            
          }

          if(info.type === eCoinLogType.Donation){
            logTargetPayload.type = info.type
            logTargetPayload.info = {
              sent_user_uid: user.uid
            }

            logUserPayload.type = eCoinLogType.sendDonation
            logUserPayload.info =  {
              target_user_uid: targetUser.uid,
              donation_type: info.target ? info.target : eDonationType.User
            }

          }

          await shopController.setCoinLog(logTargetPayload)
          await shopController.setCoinLog(logUserPayload)

          break;
      }

      await caches.user.delInfo(user.uid);


      return {
        zem: fromUserCoin.zem,
        pie: fromUserCoin.pie,
      }

    })
    

  }

  coinUsageList = async({ limit = 10, offset = 0, sort = 'created_at', dir = 'desc', start_date , end_date } : any, user: DecodedIdToken) => {
    let log: any = []

    if( !end_date ){
      end_date = new Date()
    }

    if( !start_date ){
      start_date = new Date(new Date().setDate(end_date.getDate() - 10))
    }
    
    const { count, rows } = await dbs.UserCoinLog.findAndCountAll(
      { user_uid: user.user_id,
        created_at : {
          [Op.between]:[Date.parse(start_date), Date.parse(end_date)]
        },
        type: {
          [Op.or]: [eCoinLogType.sendDonation]
        }
      },
      {
        order: [[sort, dir]],
        limit: _.toNumber(limit),
        offset: _.toNumber(offset),
      })

      return {
        count,
        list: await Promise.all(
          rows.map(async(row: any) => {
          switch(row.type){
            case eCoinLogType.sendDonation:
              let targetUser

              if(row.info){
                targetUser = await dbs.User.findOne({
                  uid: row.info.target_user_uid
                })
              }

              log = {
                created_at: row.created_at,
                coin_type: row.zem ? eItemUsingType.Zem : eItemUsingType.Pie,
                amount: row.zem ? row.zem : row.pie,
                info:targetUser ? {
                  uid: targetUser.uid,
                  nickname: targetUser.nickname
                } : null
              }

              break;
          }
          return log
        })
        )}  
  }

  /**
   * type: 현재는 도네이션만 사용중이므로 도네이션만 필터, 추후 다른 수익이 생길 경우 필터링 구분해야함 
   */
  coinProfitList =  async({ limit = 10, offset = 0, sort = 'created_at', dir = 'desc', start_date , end_date } : any, user: DecodedIdToken) => {

    if( !end_date ){
      end_date = new Date()
    }

    if( !start_date ){
      start_date = new Date(new Date().setDate(end_date.getDate() - 10))
    }
    
    const profitResult = await dbs.UserCoinLog.findAll(
      { user_uid: user.uid,
        created_at : {
          [Op.between]:[Date.parse(start_date), Date.parse(end_date)]
        },
        type: {
          [Op.or] : [eCoinLogType.Donation]
        }
      },
      {
        attributes: [
          [Sequelize.fn('SUM', Sequelize.col('zem')), 'total_profit'],
        ],
        order: [[sort, dir]],
        limit: _.toNumber(limit),
        offset: _.toNumber(offset),
      }
    )


    const result = await dbs.UserCoinLog.getProfitByDate({limit, offset, sort, dir, start_date , end_date })

    const { count, rows } = await dbs.UserCoinLog.findAndCountAll(
      { user_uid: user.uid,
        created_at : {
          [Op.between]:[Date.parse(start_date), Date.parse(end_date)]
        },
        type: {
          [Op.or] : [eCoinLogType.Donation, eCoinLogType.Gift]
        }
      },
      {
        group: [
          Sequelize.fn('DATE', Sequelize.col('created_at'))
        ], 
      }
    )

    return {
      count: count.length,
      total_profit : profitResult ? _.toNumber(profitResult[0].get({plain: true}).total_profit) : 0, 
      list: result}

  }

  reqRedeemCoin = async ({bank_account_id, amount} : any, user: DecodedIdToken ) => {
    if( !bank_account_id || !amount ){
      throw CreateError(ErrorCodes.INVALID_PARAMS);
    }
    
    const userInfo = await dbs.User.findOne({ uid: user.uid })
    const userCoin = await dbs.UserCoin.findOne({ user_id: userInfo.id })

    if(userCoin.zem < amount){
      throw CreateError(ErrorCodes.USER_COIN_NOT_ENOUGH_ZEM);
    }

    return await dbs.UserCoin.getTransaction(async (transaction: Transaction) => {

    })

  }

  getCoinMeta = async(_: any, __: DecodedIdToken ) => {
    const meta = await dbs.CoinMeta.getCoinMeta()
    return {
      commission_rate : meta.commission_rate
    }
  }

}

export default new CoinController()
