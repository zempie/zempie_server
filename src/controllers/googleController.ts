const { TranslationServiceClient } = require('@google-cloud/translate');

const projectId = 'zempie-dev'
const location = 'global';
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
      mimeType: 'text/html', // mime types: text/plain, text/html
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