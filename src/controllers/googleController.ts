const path = require('path');

const { TranslationServiceClient } = require('@google-cloud/translate');

const projectId = 'zempie-dev'
const location = 'global';
const GOOGLE_APPLICATION_CREDENTIALS = './config/firebase/client-secret.json'
class GoogleController {

  detectLanguage = async (text: string) => {
    const translationClient = new TranslationServiceClient();

    const request = {
      parent: `projects/${projectId}/locations/${location}`,
      content: text,
    };

    const [response] = await translationClient.detectLanguage(request);

    return response.languages;
  }


  translateText = async (params: { text: string, target: string }) => {
    const translationClient = new TranslationServiceClient();

    const { languageCode, confidence } = await this.detectLanguage(params.text)


    const request = {
      parent: `projects/${projectId}/locations/${location}`,
      contents: [params.text],
      mimeType: 'text/plain', // mime types: text/plain, text/html
      sourceLanguageCode: languageCode,
      targetLanguageCode: params.target,
    };

    const [response] = await translationClient.translateText(request);

    for (const translation of response.translations) {
      console.log(`Translation: ${translation.translatedText}`);
    }

    return response
  }

}

export default new GoogleController()