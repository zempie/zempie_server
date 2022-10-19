
var jwt = require('jsonwebtoken');
import * as _ from "lodash";
import { CreateError, ErrorCodes } from '../commons/errorCodes';
import { dbs } from "../commons/globals";
const crypto = require('crypto');
const secretKey = crypto.randomBytes(48).toString('hex');

class GameAuthController {

  async createUserToken({ uid }: { uid: string }) {

    const user = await dbs.User.getInfo({ uid });

    if (user) {
      const payload = {
        uid: uid,
        created_time: Date.now(),
        email: user.email,
        picture: user.picture,
        name: user.name
      }
      return { token: jwt.sign(payload, secretKey, { expiresIn: 60 * 60, issuer: 'zempie' }) };
    } else {
      throw CreateError(ErrorCodes.UNAUTHORIZED);
    }

  }

  async verifyToken({ token }: { token: string }) {

    try {
      return { info: jwt.verify(token, secretKey) }

    } catch (err) {
      throw CreateError(ErrorCodes.INVALID_TOKEN);
    }
  }

  async getInfo({ }, { uid }: any) {
    const user = await dbs.User.getInfo({ uid })

    return { user: user }

  }

  // async createGameToken() {
  //   crypto.createCipheriv

  // }

}


export default new GameAuthController()
