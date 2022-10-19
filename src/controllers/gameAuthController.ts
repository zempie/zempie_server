
var jwt = require('jsonwebtoken');
import * as _ from "lodash";
import { CreateError, ErrorCodes } from '../commons/errorCodes';
import { dbs } from "../commons/globals";
const secretKey = require('crypto').randomBytes(48).toString('hex');

class GameAuthController {

  async createToken({ uid }: { uid: string }) {

    const user = await dbs.User.getInfo({ uid });

    if (user) {
      const payload = {
        uid: uid,
        created_time: Date.now(),
        email: user.email,
        picture: user.picture,
        name: user.name
      }
      return jwt.sign(payload, secretKey, { expiresIn: 60 * 1, issuer: 'zempie' });
    } else {
      throw CreateError(ErrorCodes.UNAUTHORIZED);
    }

  }

  async verifyToken({ token }: { token: string }) {

    try {
      return jwt.verify(token, secretKey)

    } catch (err) {
      throw CreateError(ErrorCodes.INVALID_TOKEN);
    }
  }

  async getInfo({ }, { uid }: any) {
    const user = await dbs.User.getInfo({ uid })

    return user

  }

}


export default new GameAuthController()
