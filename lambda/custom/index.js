/* eslint-disable  func-names */
/* eslint-disable  no-console */


const Alexa = require('ask-sdk');
const aws = require('aws-sdk');
const constants = require('./constants.js');
const helpers = require('./helpers.js');
const interceptors = require('./interceptors.js');
const DYNAMODB_TABLE = constants.DYNAMODB_TABLE;

var special = ['zeroth','first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth', 'thirteenth', 'fourteenth', 'fifteenth', 'sixteenth', 'seventeenth', 'eighteenth', 'nineteenth'];
var deca = ['twent', 'thirt', 'fort', 'fift', 'sixt', 'sevent', 'eight', 'ninet'];

function stringifyNumber(n) {
  if (n < 20) return special[n];
  if (n%10 === 0) return deca[Math.floor(n/10)-2] + 'ieth';
  return deca[Math.floor(n/10)-2] + 'y-' + special[n%10];
}


const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    const launchCount = sessionAttributes['launchCount'];
//    const lastUseTimestamp = sessionAttributes['lastUseTimestamp'];
    const convCount = stringifyNumber(launchCount);

    // let convCount = "third";
    const speechText = 'Hello Ed, this is Sarah. This is our '+convCount+' conversation. How was your day?';
    // const speechText = 'Hello Ed, this is Sarah. How was your day?';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt("Are you still there?  How was your day?")
      .withSimpleCard('My Day', speechText)
      .getResponse();
  },
};

const HelloWorldIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'HelloWorldIntent';
  },
  handle(handlerInput) {
    const speechText = 'Sorry, I didn\'t understand you. Please start with my name, Sarah.';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt("Are you there? "+speechText)
      .withSimpleCard('My Day', speechText)
      .getResponse();
  },
};



function analyzeText(text) {
  var lambda = new aws.Lambda({
    region: 'arn:aws:lambda:us-east-1:484197412085:function:myDayFunction'
  });    
  var params = {
    FunctionName: "myDayFunction", 
    InvocationType: "RequestResponse", 
    LogType: "Tail", 
    payload: text
//    Payload: "<Stringified oject to pass parameters as event>"
  };

//  return;

  lambda.invoke(params, function(err, data) {
    if (err) {
      console.log(err, err.stack); // an error occurred
    } else {
      console.log(data);           // successful response
    }
  });
  
}




const StoryIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'story_intent';
  },
  handle(handlerInput) {
    let speech = handlerInput.requestEnvelope.request.intent.slots.story.value;

/*
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    const launchCount = sessionAttributes['launchCount'];
    const lastUseTimestamp = sessionAttributes['lastUseTimestamp'];

    const joinRank = '3'; // sessionAttributes['joinRank'];
    const skillUserCount = sessionAttributes['skillUserCount'];


    const thisTimeStamp = new Date(handlerInput.requestEnvelope.request.timestamp).getTime();
    // console.log('thisTimeStamp: ' + thisTimeStamp);

    const span = helpers.timeDelta(lastUseTimestamp, thisTimeStamp);

    let say = '';
    if (launchCount == 1) {
        say = 'welcome new user! '
            + ' You are the <say-as interpret-as="cardinal">' + joinRank + '</say-as> user to join!';
    } else {

        say = 'Welcome back! This is session ' + launchCount
            + ' and it has been ' + span.timeSpanDesc
            + '. There are now ' + skillUserCount + ' skill users. '
            + ' You joined as the <say-as interpret-as="cardinal">' + joinRank + '</say-as> user.';
    }
*/

    analyzeText(speech);

    var speechText = 'Tell me more about '+speech;
    var done = false;
    if (speech.search("hackathon") > -1) {
      speechText = "Congratulations!  Sounds like your day was good after all.  Let's celebrate."
      done = true;
    }

    if (done) {
      return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('My Day', speechText)
      .getResponse();
    }

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt("Are you there? "+speechText)
      .withSimpleCard('My Day', speechText)
    //   .addDirective({
    //     type: 'Alexa.Presentation.APL.RenderDocument',
    //     version: '1.0',
    //    document: require('./models/emotionIntent.json'),
    //     datasources: {
    //         "convoData": {
    //             "type": "object",
    //             "properties": {
    //                 "currentEmotion": "terrible",
    //                 "bgColor": "yellow",
    //                 "hintString": "My day was great!"
    //             },
    //             "transformers": [{
    //                 "inputPath": "hintString",
    //                 "transformer": "textToHint"
    //             }]
    //         }
    //     }
    // })
          .getResponse();
  },
};


const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechText = 'You can say hello to me!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('My Day', speechText)
      .getResponse();
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speechText = 'Goodbye!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('My Day', speechText)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Sorry, I didn\'t understand you. Please start with my name, Sarah.')
      .reprompt('Sorry, I can\'t understand the command. Please say again.')
      .getResponse();
  },
};

const skillBuilder = Alexa.SkillBuilders.standard();

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    HelloWorldIntentHandler,
    StoryIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .addRequestInterceptors(interceptors.RequestPersistenceInterceptor)
  .addRequestInterceptors(interceptors.RequestHistoryInterceptor)
  .addRequestInterceptors(interceptors.RequestJoinRankInterceptor)

  .addResponseInterceptors(interceptors.ResponsePersistenceInterceptor)
  .addResponseInterceptors(interceptors.SpeechOutputInterceptor)


 .withTableName(DYNAMODB_TABLE)
 .withAutoCreateTable(true)

  .lambda();
