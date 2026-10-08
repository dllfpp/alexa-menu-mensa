const Alexa = require('ask-sdk-core');
const { speechFor } = require('./menu');

const TITLE = 'Menu Mensa';

// Versione parlata: pause brevi tra i piatti, più lunghe tra le frasi.
function toSsml(text) {
  return text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/: /g, ': <break time="300ms"/>')
    .replace(/ - /g, ' <break time="400ms"/> ')
    .replace(/\. /g, '. <break time="800ms"/> ');
}

function menuResponse(handlerInput) {
  const speech = speechFor();
  return handlerInput.responseBuilder
    .speak(toSsml(speech))
    .withSimpleCard(TITLE, speech)
    .withShouldEndSession(true)
    .getResponse();
}

const LaunchRequestHandler = {
  canHandle: (h) => Alexa.getRequestType(h.requestEnvelope) === 'LaunchRequest',
  handle: menuResponse,
};

const MenuOggiIntentHandler = {
  canHandle: (h) => Alexa.getRequestType(h.requestEnvelope) === 'IntentRequest'
    && Alexa.getIntentName(h.requestEnvelope) === 'MenuOggiIntent',
  handle: menuResponse,
};

const HelpIntentHandler = {
  canHandle: (h) => Alexa.getRequestType(h.requestEnvelope) === 'IntentRequest'
    && Alexa.getIntentName(h.requestEnvelope) === 'AMAZON.HelpIntent',
  handle: (h) => {
    const speech = "Chiedimi: cos'ha mangiato oggi Figlio, oppure: che cosa c'era di menu oggi.";
    return h.responseBuilder.speak(speech).reprompt(speech).getResponse();
  },
};

const FallbackIntentHandler = {
  canHandle: (h) => Alexa.getRequestType(h.requestEnvelope) === 'IntentRequest'
    && Alexa.getIntentName(h.requestEnvelope) === 'AMAZON.FallbackIntent',
  handle: menuResponse,
};

const CancelAndStopIntentHandler = {
  canHandle: (h) => Alexa.getRequestType(h.requestEnvelope) === 'IntentRequest'
    && ['AMAZON.CancelIntent', 'AMAZON.StopIntent'].includes(Alexa.getIntentName(h.requestEnvelope)),
  handle: (h) => h.responseBuilder.speak('Ciao!').getResponse(),
};

const SessionEndedRequestHandler = {
  canHandle: (h) => Alexa.getRequestType(h.requestEnvelope) === 'SessionEndedRequest',
  handle: (h) => h.responseBuilder.getResponse(),
};

const ErrorHandler = {
  canHandle: () => true,
  handle: (h, error) => {
    console.log(`Errore: ${error.stack}`);
    return h.responseBuilder.speak('Scusa, non sono riuscita a leggere il menu.').getResponse();
  },
};

exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler,
    MenuOggiIntentHandler,
    HelpIntentHandler,
    FallbackIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler,
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
