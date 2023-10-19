import { CreateError, ErrorCodes } from "../commons/errorCodes";
import { dbs } from "../commons/globals";
import { IAdmin, IEvent, IRoute } from "./_interfaces";
import { NextFunction, Request, Response } from 'express';
import Opt from '../../config/opt';
const { PAYMENT } = Opt;
import { Sequelize, Transaction, Op } from 'sequelize';
import shopController from "./shopController";

import admin from 'firebase-admin';
import axios from 'axios';

import { Bootpay } from '@bootpay/backend-js';
import DecodedIdToken = admin.auth.DecodedIdToken;
import { eCoinLogType } from "../commons/enums";
import * as _ from 'lodash';

var iap = require('iap');

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
  private verifyBootpay = async (receip_id: string) =>{
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
  async bootpayCancel(receip_id: string)  {
  }

  /**
   * 구글 영수증 체크 
   * @param payload 
   * @param subscription 
   * @returns 
   */
  validateGoogleReceipt  = async  (payload:any, subscription:boolean = false)=>{
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

          // TODO:  debug
          // result.receipt.purchaseState = 0;

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

  validateAppleReceipt = async (receiptData:string, transactionId:string, productId:string) =>{
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

  private checkDatabase = async  (user_id: number, result:any) => {
    try {
      let itemShopDAO = await dbs.ShopItemShop.findOne('store_code', result.productId)
      let price = 10000;









      let userReceiptDAO = await dbs.UserReceipt.findOne({user_id, purchase_token: result.purchase_token})
      if (!userReceiptDAO) { // 없으면 // DB에 저장
        const values = {
          user_id,
          store: result.store,
          package_name: result.packageName,
          product_id: result.productId,
          price,
          purchase_token: result.purchase_token,
          receipt: JSON.stringify(result.receipt),
          subscription: result.subscription,
          is_consume: result.isConsume
        }
        userReceiptDAO = await dbs.UserReceipt.create(values)
        return { verifyReceipt: result }

      } else { // 있다면

        if (userReceiptDAO.state === 0) { // DB에서 소비 대기 중이라면
          return { verifyReceipt: result, userReceiptDAO } // return { isConsume: result.isConsume, userReceiptDAO, productId: result.productId };
        } else { // 소비를 했다면
          throw CreateError(ErrorCodes.USER_PAYMENT_ALREADY_USED_RECEIPT);
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
{
  "receipt": {
    "Payload": "{\"orderId\":\"GPA.3358-7367-8755-86716\",\"packageName\":\"com.fromthered.zempie.dev\",\"productId\":\"zem_10\",\"purchaseTime\":1684311136931,\"purchaseState\":0,\"purchaseToken\":\"gdkdjjccgoppgjdcedbnfddg.AO-J1Owbwo6DLqrHQCJvC2vpfWNwfVWRAyqhLpYgJSovq2i52IALLnPWbBxVdymBuEnlym4VAaqsAzC_DjWrvCXgUW6hufuX7m6CwW3f9JzLCAQb9kHSNso\",\"quantity\":1,\"acknowledged\":false}",
    "TransactionID": "GPA.3358-7367-8755-86716",
    "Store": "GooglePlay"
  },
  "product_id": "zem_10",
  "subscription": false
}
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
  validateReceiptIAP = async ({ product_id, receipt, subscription }: { product_id:string, receipt:any, subscription:any }, _user: DecodedIdToken) =>{
    
    try {
      receipt = typeof receipt == 'string' ? JSON.parse(receipt) : receipt;
      subscription = subscription === 'true' ? true : false

      let payload = typeof receipt.Payload == 'string' ? JSON.parse(receipt.Payload) : receipt.Payload

      const uid = _user.uid;
      const user = await dbs.User.findOne({ uid });
      if (!user) throw CreateError(ErrorCodes.INVALID_USER_UID);
      const user_id = user.id;

      let ret:any = undefined
      let store_type = -1
      let store = receipt.Store
      
      if (store === 'GooglePlay') {
        if (subscription === 'True') {
          subscription = true
        } else {
          subscription = false
        }

        
        ret = await this.validateGoogleReceipt(payload, subscription)
        store_type = 1
      } else if (store === 'AppleAppStore') {
        ret = await this.validateAppleReceipt(JSON.stringify(payload), receipt.TransactionID, product_id)
        store_type = 2
      } else {
        throw {
          message: 'BadRequest'
        }
      }

      let store_code = ret.productId
      const shop = await dbs.Shop.findOne({store_code, store_type})
      if (!shop) {
        throw CreateError(ErrorCodes.USER_PAYMENT_NO_ITEM_TO_BE_GIVEN);
      }


      return await dbs.UserReceipt.getTransaction(async (transaction: Transaction) => {
        const userReceipt = await dbs.UserReceipt.findOne({ user_id, purchase_token: payload.purchaseToken }, transaction)
        if (userReceipt) {
          console.log('>> 중복된 영수증..', ret)
          throw CreateError(ErrorCodes.USER_PAYMENT_ALREADY_USED_RECEIPT);
        }
  
        let userReceiptData = {
          user_id,
          state: 1, //  지급됨.
          store,
          package_name: 'zempie.com',
          product_id: shop.store_code,
          price: shop.price,
          purchase_token: payload.purchaseToken,
          subscription: 0,
          receipt: JSON.stringify({ ...ret}),
          is_consume: 1
        }
       const receipt = await dbs.UserReceipt.create(userReceiptData, transaction)
  
        let update = await shopController.giveItem( uid, shop.refitem_id, eCoinLogType.Payment, {receipt_id: receipt.id})
        
        return {
          message: '결제되었습니다. 영수증을 확인하세요..',
          data: {
            receipt_url: null,
            update,
            metadata: null,
            receipt: ret.receipt
          }
        }
      })
















      // const verifyData:any = await this.checkDatabase(user.id, returned_receipt)
      // if (verifyData.receiptDAO ) {
      //   //if (verifyData.verifyReceipt.isConsume === 1) { // 영수증에 소비가 되었다면
      //   const update = await this.giveProductId(uid, verifyData)

      //   const r = {
      //     message: 'Consume',
      //     receipt: returned_receipt.receipt,
      //     // update: update.update
      //   }

      //   console.log(`Consume  validateReceipt: user.idx: ${user.id}  ${user.nickname}   product_id: ${product_id} `);
      //   console.log(`receipt from client: ${JSON.stringify(receipt)} ` )
      //   console.log(`receipt : ${JSON.stringify(returned_receipt)} ` )
      //   console.log(`res.status:200   ${JSON.stringify(r)} `)

      //   return r
      // } else {

      //   const r = {
      //     message: 'Pending',
      //     receipt: returned_receipt.receipt
      //   }

      //   console.log(`Pending   validateReceipt: user.idx: ${user.id}  ${user.nickname}   product_id: ${product_id} `);
      //   console.log(`receipt from client: ${JSON.stringify(receipt)} ` )
      //   console.log(`receipt : ${JSON.stringify(returned_receipt)} ` )
      //   console.log(`res.status:201   ${JSON.stringify(r)} `)

      //   return r
      // }      

    } catch (err) {
      console.error(err)
      throw err
    }
  }


  /**
   * receipt = 
     {
        "receipt_id": "645c58be755e270022e1e8db",
        "order_id": "TEST_ORDER_ID",
        "price": 1200,
        "tax_free": 0,
        "cancelled_price": 0,
        "cancelled_tax_free": 0,
        "order_name": "ZEM 구매",
        "company_name": "젬파이-테스트",
        "gateway_url": "https://gw.bootpay.co.kr",
        "metadata": {
            "id": 1                                     <-- refitem_id
        },
        "sandbox": true,
        "pg": "나이스페이먼츠",
        "method": "카드",
        "method_symbol": "card",
        "method_origin": "카드",
        "method_origin_symbol": "card",
        "purchased_at": "2023-05-11T11:54:22+09:00",
        "requested_at": "2023-05-11T11:53:50+09:00",
        "status_locale": "결제완료",
        "currency": "KRW",
        "receipt_url": "https://door.bootpay.co.kr/receipt/NFhKZWNTVW80RXJYRFBWQkdRT1R3MTlOOXFJZ20xaUk3dmtDbUVpNVlENVdN%0AZz09LS1WbVhNMW0wZnk4YUhwd2VBLS11VGswbmQ3cFZKOFF4WTNxTEhjK2NB%0APT0%3D%0A",
        "status": 1,
        "card_data": {
            "tid": "nicepay00m01012305111154214509",
            "card_approve_no": "49397854",
            "card_no": "94352017****6169",
            "card_interest": "0",
            "card_quota": "00",
            "card_company_code": "01",
            "card_company": "비씨",
            "card_type": "신용",
            "card_owner_type": "개인",
            "point": 0,
            "coupon": 0,
            "receipt_url": "https://npg.nicepay.co.kr/issue/IssueLoader.do?type=0&InnerWin=Y&TID=nicepay00m01012305111154214509"
        }
    }
   */
  validateReceiptBootpay = async ({ receipt }: { receipt:any }, _user: DecodedIdToken) => {
    try {
      receipt = typeof receipt == 'string' ? JSON.parse(receipt) : receipt;

      let refitem_id : number
      let price: number = 0
      const uid = _user.uid;
      const user = await dbs.User.findOne({ uid });
      if (!user) throw CreateError(ErrorCodes.INVALID_USER_UID);
      const user_id = user.id;
      
      //  영수증 검사
      const ret:any = await this.verifyBootpay(receipt.receipt_id)
      if( ret.cancelled_price > 0 ){
        console.log('>> 취소된 결제..', ret)
        throw CreateError(ErrorCodes.USER_PAYMENT_CANCELED_RECEIPT);
      }

      if( ret.status != 1 ){
        console.log('>> 결제 실패..', ret)
        throw CreateError(ErrorCodes.USER_PAYMENT_BOOTPAY_RECEIPT_VERIFY_FAIL);
      }

      refitem_id = ret.metadata.refitem_id ?  ret.metadata.refitem_id : ret.metadata.id
      const shop = await dbs.Shop.findOne({refitem_id, store_type: 3})
      if (!shop) {
        throw CreateError(ErrorCodes.USER_PAYMENT_NO_ITEM_TO_BE_GIVEN);
        // TODO:: 취소처리.
      }

      if( shop.price != ret.price ) {
        throw CreateError(ErrorCodes.USER_PAYMENT_NO_ITEM_TO_BE_GIVEN);
      }

      return await dbs.UserReceipt.getTransaction(async (transaction: Transaction) => {
        const userReceipt = await dbs.UserReceipt.findOne({ user_id, purchase_token: ret.receipt_id }, transaction)
        if (userReceipt) {
          console.log('>> 중복된 영수증..', ret)
          throw CreateError(ErrorCodes.USER_PAYMENT_ALREADY_USED_RECEIPT);
        }
  
        let userReceiptData = {
          user_id,
          state: 1, //  지급됨.
          store: ret.pg,
          package_name: 'zempie.com',
          product_id: shop.store_code,
          price: shop.price,
          purchase_token: ret.receipt_id,
          subscription: 0,
          receipt: JSON.stringify({ ...ret}),
          is_consume: 1
        }
        const receipt = await dbs.UserReceipt.create(userReceiptData, transaction)
  
        let update = await shopController.giveItem( uid, refitem_id, eCoinLogType.Payment, {receipt_id: receipt.id})
        
        return {
          message: '결제되었습니다. 영수증을 확인하세요.',
          data: {
            receipt_url: ret.receipt_url,
            update,
            metadata: ret.metadata
          }
        }
      })

    } catch (err) {
      console.error(err)
      throw err
    }
  }




  // User에게 UserCoins의 zem또는 pie를 지급한다.
  giveProductId = async (uid: string, verifyData: any) => {
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
  getPaymentList = async ({limit = 10, offset = 0, sort = 'created_at', dir = 'desc', start_date , end_date} : any, user: DecodedIdToken, ) => {
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
          [Op.or]: [eCoinLogType.Payment]
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
    rows.map(async(log: any) => {
      let temLog
      switch(log.type){
        case eCoinLogType.Payment:
          const receipt = await dbs.UserReceipt.findOne({
              id: log.info.receipt_id
          })
          temLog = log.get({plain: true})
          if( !receipt ){
            throw CreateError(ErrorCodes.USER_PAYMENT_INVALID_RECEIPT);
          }
          temLog.receipt = receipt.get({plain: true})
          
          const receiptInfo = JSON.parse(receipt.receipt)

          log = {
            created_at: temLog.created_at,
            payment_method: receiptInfo.method,
            receipt_no : receiptInfo.receipt_id,
            price: receipt.price,
            item: receipt.product_id
          }
          
          break;

      }

      return log
    })
  )}


  }

}
export default new PaymentController()
