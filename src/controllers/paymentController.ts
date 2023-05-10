import { CreateError, ErrorCodes } from "../commons/errorCodes";
import { dbs } from "../commons/globals";
import { IAdmin, IEvent, IRoute } from "./_interfaces";
import { NextFunction, Request, Response } from 'express';
import Opt from '../../config/opt';
const { PAYMENT } = Opt;
import { Sequelize, Transaction } from 'sequelize';

import admin from 'firebase-admin';
import axios from 'axios';
import { iap } from 'iap';
import { Bootpay } from '@bootpay/backend-js';
import DecodedIdToken = admin.auth.DecodedIdToken;

interface Config {
  bootpay?: {
    restId?: string;
    privateKey?: string;
  };
}


class PaymentController {
  constructor() {
    Bootpay.setConfiguration( PAYMENT && PAYMENT.BOOTPAY ? PAYMENT.BOOTPAY : {});
  }

  // Bootpay 영수증을 확인한다. 
  async verifyBootpay(receip_id: string): Promise<any> {
    try {
      await Bootpay.getAccessToken();
      const res = await Bootpay.receiptPayment(receip_id);
      return res;
    } catch (err) {
      console.error(`bootpay.verify ` + err);
      throw CreateError(ErrorCodes.USER_PAYMENT_BOOTPAY_RECEIPT_VERIFY_FAIL);
      // return { error: err.error || err.message || err };
    }
  }

  // 결제를 취소한다. 
  async bootpayCancel(receip_id: string): Promise<any>  {
  }

  /**
   * 구글 영수증 체크 
   * @param payload 
   * @param subscription 
   * @returns 
   */
  async validateGoogleReceipt (payload:any, subscription:boolean = false){
    let receipt

    if (payload.json === undefined) {
      receipt = payload
    } else {
      receipt = JSON.parse(payload.json)
    }

    const packageName = receipt.packageName
    const productId = receipt.productId
    const token = receipt.purchaseToken

    if (typeof packageName !== 'string') {
      throw { error: '영수증이 이상합니다.' }
    }
    if (typeof productId !== 'string') {
      throw { error: '영수증이 이상합니다.' }
    }
    if (typeof token !== 'string') {
      throw { error: '영수증이 이상합니다.' }
    }

    const platform = 'google'
    const payment = {
      receipt: token,
      productId,
      packageName,
      keyObject: PAYMENT.google_api_service_account_json_key_file,
      subscription
    }

    const verifyPayment = new Promise((resolve, reject) => {
      iap.verifyPayment(platform, payment, (error:any, result:any) => {
        if (error !== null) {
          reject(error)
        } else {
          console.log('검증 받은 영수증 ' + result.receipt.purchaseState)
          console.log(token)
          console.log(result.receipt)
          if (result.receipt.purchaseState === 0) {
            // 구매
            resolve({
              store: 'GooglePlay',
              packageName,
              productId,
              subscription,
              purchase_token: token,
              receipt: result.receipt,
              isConsume: result.receipt.consumptionState
            })
          } else if (result.receipt.purchaseState == 1) {
            // 취소
            // AbnormalReceipt
            reject({ ecode: 402, error: 'AbnormalReceipt' })
          } else if (result.receipt.purchaseState == 2) {
            // 대기
            // PendingReceipt
            reject({ ecode: 402, error: 'PendingReceipt' })
          } else {
            // BadReceipt
            reject({ ecode: 400, error: 'BadReceipt' })
          }
        }
      })
    })

    try {
      return await verifyPayment
    } catch (error) {
      console.error('[validateGoogleReceipt]', error)
      throw CreateError(ErrorCodes.USER_PAYMENT_RECEIPT_GOOGLE_VERIFY_FAIL);
    }
  }

  async validateAppleReceipt(receiptData:string, transactionId:string, productId:string) {
    try {
      // console.log(`receiptData: ${receiptData}` )

      const b = { 'receipt-data': receiptData }

      let verifyReceipt = await axios.post('https://buy.itunes.apple.com/verifyReceipt', b)

      if (verifyReceipt.data.status === 21007) {
        verifyReceipt = await axios.post('https://sandbox.itunes.apple.com/verifyReceipt', b)
      } else if (verifyReceipt.data.status === 0 ) {

      }else{
        throw CreateError(ErrorCodes.USER_PAYMENT_RECEIPT_APPLE_VERIFY_FAIL);
        // throw { error: verifyReceipt.data.status }
      }

      // console.log(`verifyReceipt.data:  ${verifyReceipt.data}`)

      const packageName = verifyReceipt.data.receipt.bundle_id || '???'

      const in_app = verifyReceipt.data.receipt.in_app

      let isVerifyInAppItem = false
      for (let i = 0; i < in_app.length; i++) {
        if (in_app[i].product_id === productId) {
          // TODO: in_app[i].transaction_id === transactionId
          isVerifyInAppItem = true
          break
        }
      }

      if (isVerifyInAppItem === false) {
        throw CreateError(ErrorCodes.USER_PAYMENT_NO_ITEM_TO_BE_GIVEN);
        // throw { error: '영수증에 해당 아이템이 없습니다.' }
      }

      return {
        store: 'AppleAppStore',
        packageName,
        productId,
        subscription: false,
        purchase_token: receiptData,
        receipt: verifyReceipt.data,
        isConsume: verifyReceipt.data.status === 0 ? true : false
      }
    } catch (error) {
      console.error('[validateAppleReceipt]', error)
      throw CreateError(ErrorCodes.USER_PAYMENT_RECEIPT_APPLE_VERIFY_FAIL);
      
    }
  }

  async checkDatabase (user_id: number, result:any) {
    try {
      // let itemShopDAO = await ItemShop.findOne('store_code', result.productId)
      let price = 10000;

      let userReceiptDAO = await dbs.UserReceipt.findOne({user_id, purchase_token: result.purchase_token})
      if (userReceiptDAO === undefined) { // 없으면
        // DB에 저장
        const values = [
          user_id,
          result.store,
          result.packageName,
          result.productId,
          price,
          result.purchase_token,
          JSON.stringify(result.receipt),
          result.subscription,
          result.isConsume
        ]
        userReceiptDAO = await dbs.UserReceipt.create(values)
        return { verifyReceipt: result }
      } else { // 있다면
        if (userReceiptDAO.state === 0) { // DB에서 소비 대기 중이라면
          return { verifyReceipt: result, userReceiptDAO } // return { isConsume: result.isConsume, userReceiptDAO, productId: result.productId };
        } else {
          // 소비를 했다면
          throw CreateError(ErrorCodes.USER_PAYMENT_ALREADY_USED_RECEIPT);
          // throw { ecode: 409, error: 'UsedReceipt' }
        }
      }
    } catch (error) {
      console.error('[checkDatabase]', error)
      throw error
    }
  }

  /*
  
CREATE TABLE `receipt` (
  `state` tinyint(4) NOT NULL DEFAULT '0',
  `store` varchar(100) NOT NULL,
  `package_name` varchar(100) NOT NULL,
  `product_id` varchar(100) NOT NULL,
  `price` int(11) NOT NULL DEFAULT '0',
  `purchase_token` text NOT NULL,
  `receipt` text NOT NULL,
  `subscription` tinyint(4) NOT NULL,
  PRIMARY KEY (`idx`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
  */

  /**
   * Unity Flutter 에서 보낸 영수증을 체크하고 아이템을 지급한다. 
   * 
   * @param req 
   *  - product_id
   *  - receipt
   *  - subscription
   *  - flatform : web, flutter, unity
   * @param res 
   * @param next 
   * @returns 
   */
  async validateReceiptIAP({ product_id, receipt, subscription, platform }: { product_id:string, receipt:any, subscription:any, platform:string }, _user: DecodedIdToken) {
    try {
      const uid = _user.uid;
      const user = await dbs.User.findOne({ uid });
      if (!user) throw CreateError(ErrorCodes.INVALID_USER_UID);

      let returned_receipt:any = undefined

      if( platform === 'flutter' ){
        if (receipt.Store === 'GooglePlay') {
          subscription = subscription === 'true'
          returned_receipt = await this.validateGoogleReceipt(receipt, subscription)
        } else if (receipt.Store === 'AppleAppStore') {
          returned_receipt = await this.validateAppleReceipt(receipt, receipt.TransactionID, product_id)
        } else {
          throw {
            message: 'BadRequest'
          }
        }
      }else{ // from Unity 
        receipt = JSON.parse(receipt)
        if (receipt.Store === 'GooglePlay') {
          if (subscription === 'True') {
            subscription = true
          } else {
            subscription = false
          }
          returned_receipt = await this.validateGoogleReceipt(JSON.parse(receipt.Payload), subscription)
        } else if (receipt.Store === 'AppleAppStore') {
          returned_receipt = await this.validateAppleReceipt(receipt.Payload, receipt.TransactionID, product_id)
        } else {
          throw {
            message: 'BadRequest'
          }
        }
      }

      const verifyData:any = await this.checkDatabase(user.id, returned_receipt)

      if (verifyData.receiptDAO !== undefined) {
        //if (verifyData.verifyReceipt.isConsume === 1) { // 영수증에 소비가 되었다면
        
        const update = await this.giveProductId(uid, verifyData)

        const r = {
          message: 'Consume',
          receipt: returned_receipt.receipt,
          // update: update.update
        }

        console.log(`Consume  validateReceipt: user.idx: ${user.id}  ${user.nickname}   product_id: ${product_id} `);
        console.log(`receipt from client: ${JSON.stringify(receipt)} ` )
        console.log(`receipt : ${JSON.stringify(returned_receipt)} ` )
        console.log(`res.status:200   ${JSON.stringify(r)} `)

        return r
      } else {

        const r = {
          message: 'Pending',
          receipt: returned_receipt.receipt
        }

        console.log(`Pending   validateReceipt: user.idx: ${user.id}  ${user.nickname}   product_id: ${product_id} `);
        console.log(`receipt from client: ${JSON.stringify(receipt)} ` )
        console.log(`receipt : ${JSON.stringify(returned_receipt)} ` )
        console.log(`res.status:201   ${JSON.stringify(r)} `)

        return r
      }      

    } catch (err) {
      console.error(err)
    }
  }

  async validateReceiptBootpay({ receipt }: { receipt:any }, _user: DecodedIdToken) {
    try {
      const uid = _user.uid;
      const user = await dbs.User.findOne({ uid });
      if (!user) throw CreateError(ErrorCodes.INVALID_USER_UID);
      
      const items = receipt.params.items
      ////  영수증 검사
      const ret = await this.verifyBootpay(receipt.receipt_id)
      if (ret.error) throw CreateError(ErrorCodes.USER_PAYMENT_BOOTPAY_RECEIPT_VERIFY_FAIL);

      // TODO: 영수증 정보 검사. 가격변조 가능성 있음..
      // TODO: ret.status == 1 이 아닌경우 처리 취소처리...

      // console.log('>> ret', ret)
      /// 검증이 된거고.
      // console.log(items)

      //// 영수증 처리..아이템
      const shopDAO = await dbs.Shop.findOne('idx', items[0].item_idx)
      if (!shopDAO) {
        throw CreateError(ErrorCodes.USER_PAYMENT_NO_ITEM_TO_BE_GIVEN);
        // TODO:: 취소처리.
      }

      let itemReceiptData = {
        productId: shopDAO.store_code,
        purchase_token: ret.receipt_id,
        store: ret.pg,
        subscription: 0,
        isConsume: 0,
        receipt: { ...ret, ...items }
      }

      let verifyData:any = await this.checkDatabase(user.id, itemReceiptData)

      if (!verifyData.receiptDAO) {
        const receiptDAO = await dbs.UserReceipt.findOne('purchase_token', verifyData.verifyReceipt.purchase_token)
        if (receiptDAO) {
          verifyData.receiptDAO = receiptDAO
        } else {
          throw CreateError(ErrorCodes.USER_PAYMENT_BOOTPAY_RECEIPT_VERIFY_FAIL);
        }
      }

      // const update = await dbs.Item.ItemService.giveItemByIAP(req.user.uid, verifyData)

      return {
        message: '결제되었습니다. 영수증을 확인하세요.',
        data: {
          receipt_url: ret.receipt_url,
          //update: update.update
        }
      }
    } catch (err) {
      console.error(err)
    }
  }




  // User에게 UserCoins의 zem또는 pie를 지급한다.
  async giveProductId(uid: string, verifyData: any) {
    try {

      // const { userReceiptDAO, verifyReceipt } = verifyData
      // const product_id = verifyReceipt;

      // // TODO: get product

      // return dbs.User.getTransaction(async (transaction: Transaction) => {
      //   const user_uid = user.uid;
      //   const { user_id, target_id } = await this.getIds({ user_uid, target_uid }, transaction);

      //   await dbs.UserCoin.update({ following_cnt: Sequelize.literal('following_cnt + 1') }, { user_id }, transaction);
      //   await dbs.UserProfile.update({ followers_cnt: Sequelize.literal('followers_cnt + 1') }, { user_id: target_id }, transaction);

      //   await dbs.Alarm.create({user_uid: target_uid, target_uid: user_uid, type: eAlarm.Follow, extra: { target_uid }}, transaction);
      //   await NotifyService.notify({user_uid: target_uid, type: eNotify.Follow, data: { target_uid }});
      // });

    } catch (error) {

    }
  }

}
export default new PaymentController()
