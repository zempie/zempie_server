import { Readable } from 'stream';

import * as sharp from 'sharp'
import util from 'util';

class ImageManager {
  resizeImage = async (image : any, targetSize = 500) => {
    const typeMatch = image.name.match(/\.([^.]*)$/);
    if (!typeMatch) {
      console.log("Could not determine the image type.");
      return;
    }

    const imageType = typeMatch[1].toLowerCase();
    if (imageType != "jpg" && imageType != "png" && imageType != "webp") {
      console.log(`Unsupported image type: ${imageType}`);
      return;
    }

    let width : any= 500;

    try {    
      const metadata = await sharp(image.buffer).metadata()
      if( metadata.width! <= width){
          width =  metadata.width
      }
      return await sharp(image.buffer).resize(width).toBuffer();

    } catch (error) {
      console.log(error);
      return error
    }

  }
}
export default new ImageManager()

