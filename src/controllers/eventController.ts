import { CreateError, ErrorCodes } from "../commons/errorCodes";
import { dbs } from "../commons/globals";
import { IAdmin, IEvent, IRoute } from "./_interfaces";
import FileManager from "../services/fileManager";
import Opt from '../../config/opt';
const replaceExt = require('replace-ext');
import {Transaction} from "sequelize";


class EventController {

  async getEventList({category, sort = 'start_date'} : any){

    return await dbs.Event.findAll()
  }
  async creatEvent({title, desc, start_date, end_date, type, category}: IEvent, _admin: IAdmin, { req: { files: { file } } }: IRoute) {
    if (!file) {
      throw CreateError(ErrorCodes.INVALID_PARAMS);
  }
  const webp = await FileManager.convertToWebp(file, 80);
  const data: any = await FileManager.s3upload({
      bucket: Opt.AWS.Bucket.Static,
      key: replaceExt(`${title}`, '.webp'),
      filePath: webp[0].destinationPath,
      uid: '',
      subDir: '/event',
  });
  const url_img = data.Location;
  
  await dbs.Event.create({
      title,
      desc,
      url_img,
      start_date,
      end_date,
      type,
      category
    })
  }
  async updateEvent({id, title, desc, start_date, end_date, type, category}: IEvent){
    return dbs.Event.getTransaction(async (transaction : Transaction)=>{
      const event = await dbs.Event.findOne({id}, transaction)
      if ( !event ) {
        throw CreateError(ErrorCodes.INVALID_ACCESS_EVENT_ID);
      }
      
      if( title ){
        event.title = title
      }
      if( desc ){
        event.desc = desc
      }
      if( start_date ){
        event.start_date = start_date
      }
      if( end_date ){
        event.end_date = end_date
      }
      if( type ){
        event.type = type
      }
      if ( category ){
        event.category = category
      }
      await event.save({transaction})

    })
  }
  async deleteEvent(params : any) {
    
    return dbs.Event.getTransaction(async (transaction : Transaction)=>{
      const event = await dbs.Event.findOne({id: params.id})
      if ( !event ) {
        throw CreateError(ErrorCodes.INVALID_ACCESS_EVENT_ID);
      }
      return await dbs.Event.destroy( { id : params.id }, transaction );
    })
  }

 
}

export default new EventController()
