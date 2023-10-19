import { dbs } from "../commons/globals";

class MetaController{
  constructor() {

  }

  getInfo = async () => {
   const result = await dbs.Meta.getRecetnVersion()
   
   return {
    and_build_no: result.and_build_no,
    ios_build_no: result.ios_build_no,
    updated_at: result.updated_at
   }
  }
}

export default new MetaController()
