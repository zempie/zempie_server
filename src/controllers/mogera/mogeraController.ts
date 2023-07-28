import { dbs } from '../../commons/globals';
import { CreateError, ErrorCodes } from '../../commons/errorCodes';
import { IRoute, IZempieClaims } from '../_interfaces';
import {Transaction} from "sequelize";
import admin from 'firebase-admin';
import DecodedIdToken = admin.auth.DecodedIdToken;
import { uploadVersionFile } from '../studio/studioController';
import { v4 as uuid } from 'uuid';

interface ICreateMogeraFile{
  // user_uid: string,
  startFile: string,
  size:number
}

class MegeraController {
    async createGameFile( params : ICreateMogeraFile, { uid }: DecodedIdToken, { req: { files } }: IRoute ) {

      return dbs.MogeraFile.getTransaction( async (transaction : Transaction)=>{
        const subDir = `/mogera/user/${uid}/${uuid()}`;
        const url = await uploadVersionFile(files, uid, subDir, files.startFile.name)
        
        const paylod = {
          user_uid : uid,
          url,
          is_uploaded: false,
          size:params.size
        }
        return await dbs.MogeraFile.create( paylod, transaction );
      
      })

    }

    async getGameFile( params : ICreateMogeraFile, { uid } : DecodedIdToken ) {

      const files = await dbs.MogeraFile.findAll({ user_uid: uid, is_uploaded: false },{
        order: [['created_at', 'desc']],
        limit: 2
       })

      return files
    }
}




export default new MegeraController()
