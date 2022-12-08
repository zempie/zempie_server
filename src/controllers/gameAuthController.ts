var jwt = require('jsonwebtoken');
import * as _ from "lodash";
import { CreateError, ErrorCodes } from '../commons/errorCodes';
import { dbs } from "../commons/globals";

import admin from 'firebase-admin';
import DecodedIdToken = admin.auth.DecodedIdToken;

const crypto = require('crypto');
const SECRET_KEY = crypto.randomBytes(48).toString('hex');

class GameAuthController {

  async createUserToken(params: any, { uid }: DecodedIdToken,) {

    const user = await dbs.User.getInfo({ uid });

    if (user) {
      const payload = {
        uid: uid,
        created_time: Date.now(),
        email: user.email,
        picture: user.picture,
        name: user.name
      }
      return { token: jwt.sign(payload, SECRET_KEY ) };
    } else {
      throw CreateError(ErrorCodes.UNAUTHORIZED);
    }

  }

  async verifyToken({ token }: { token: any }) {
    try {
      return { info: jwt.verify(token, SECRET_KEY) }
    } catch (err) {
      throw CreateError(ErrorCodes.INVALID_TOKEN);
    }
  }

  async getInfo({ token }: { token: any }) {
    return {user:jwt.verify(token, SECRET_KEY)}
  }

  async createGameToken({ text }: { text: string }) {
    const payload = {
      content: text
    }
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn:'9999 years',  issuer: 'zempie' })

    return { token };

  }

  async verifyGameToken(token: string) {

    return { decodedToken: jwt.verify(token, SECRET_KEY) }
  }

}


export default new GameAuthController()