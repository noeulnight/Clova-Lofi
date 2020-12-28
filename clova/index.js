const uuid = require('uuid').v4
const _ = require('lodash')
const { STUDY, SLEEP, IMAGE } = require('../config')

class Directive {
  constructor({namespace, name, payload}) {
    this.header = { messageId: uuid(), namespace: namespace, name: name }
    this.payload = payload
  }
}

function sleeplofi() {
  episodeId = Math.floor(Math.random() * 1000)
  return new Directive({ 
    namespace: 'AudioPlayer',
    name: 'Play',
    payload : {
      audioItem : {
        audioItemId : uuid(),
        episodeId : episodeId,
        stream : {
          beginAtInMilliseconds : 0,
          token : 'eJyr5lIqSSyITy4tKs4vUrJSUE',
          url : SLEEP,
          urlPlayable : true
        },
        type : "podcast"
      },
      source : {
        name : 'lofi hip hop radio - beats to sleep/chill to',
        logoUrl : IMAGE
      },
      playBehavior : "REPLACE_ALL"
    }
  })
}

function studylofi() {
  episodeId = Math.floor(Math.random() * 1000)
  return new Directive({ 
    namespace: 'AudioPlayer',
    name: 'Play',
    payload : {
      audioItem : {
        audioItemId : uuid(),
        episodeId : episodeId,
        stream : {
          beginAtInMilliseconds : 0,
          token : 'eJyr5lIqSSyITy4tKs4vUrEKSC',
          url : STUDY,
          urlPlayable : true
        },
        type : "podcast"
      },
      source : {
        name : 'lofi hip hop radio - beats to relax/study to',
        logoUrl : IMAGE
      },
      playBehavior : "REPLACE_ALL"
    }
  })
}

function meta() {
  return new Directive({ 
    namespace: 'TemplateRuntime', 
    name: 'RenderPlayerInfo', 
    payload: { 
      controls: [
        { 
          enabled: true, 
          name: "PLAY_PAUSE", 
          selected: false, 
          type: "BUTTON" 
        }, 
        { 
          enabled: false, 
          name: "NEXT", 
          selected: false, 
          type: "BUTTON" 
        }, 
        { 
          enabled: false, 
          name: "PREVIOUS", 
          selected: false, 
          type: "BUTTON" 
        }
      ], 
      displayType: "list", 
      playableItems: [
        {
          artImageUrl: 'https://cdn.trinets.xyz/d/kcLnJ4T~Hq.jpeg', 
          controls: [
            { 
              enabled: false, 
              name: "LIKE_DISLIKE", 
              selected: false, 
              type: "BUTTON" 
            }
          ], 
          headerText: "Lofi", 
          lyrics: [
            { 
              data: null, 
              format: "PLAIN", 
              url: null 
            }
          ], 
          isLive: true, 
          showAdultIcon: false, 
          titleSubText1: "Lofi hip hop radio / Chilled Cow", 
          titleText: "Beats to sleep/chill to", 
          token: "eJyr5lIqSSyITy4tKs4vUrJSUE"
        },
        {
          artImageUrl: 'https://cdn.trinets.xyz/d/TKDj3fujpo.jpeg', 
          controls: [
            { 
              enabled: false, 
              name: "LIKE_DISLIKE",
              selected: false, 
              type: "BUTTON" 
            }
          ], 
          headerText: "Lofi", 
          lyrics: [
            { 
              data: null, 
              format: "PLAIN", 
              url: null 
            }
          ], 
          isLive: true, 
          showAdultIcon: false, 
          titleSubText1: "Lofi hip hop radio / Chilled Cow", 
          titleText: "Beats to relax/study to", 
          token: "eJyr5lIqSSyITy4tKs4vUrEKSC" 
        }
      ], 
      provider: { 
        logoUrl: IMAGE, 
        name: "ChilledCow", 
        smallLogoUrl: "" 
      }
    }
  })
}

function stop() {
  return new Directive({ namespace: "PlaybackController", name: "Pause", payload: {}})
}

class CEKRequest {
  constructor (httpReq) {
    this.request = httpReq.body.request
    this.context = httpReq.body.context
    this.session = httpReq.body.session
  }

  do(cekResponse) {
    switch (this.request.type) {
      case 'LaunchRequest':
        return this.launchRequest(cekResponse)
      case 'IntentRequest':
        return this.intentRequest(cekResponse)
      case 'SessionEndedRequest':
        return this.sessionEndedRequest(cekResponse)
    }
  }

  launchRequest(cekResponse) {
    console.log('launchRequest')
    cekResponse.appendSpeechText("무슨 로파이를 재생할까요?")
    cekResponse.setMultiturn({
      intent: 'PlayLofi',
    })
  }

  intentRequest(cekResponse) {
    const intent = this.request.intent.name
    const slots = this.request.intent.slots
    switch (intent) {
      case 'PlayLofi':
        const TypeofLofi = slots.lofi.value
        switch (TypeofLofi) {
          case 'study': {
            cekResponse.appendSpeechText("공부할때 듣는 로파이를 시작합니다.")
            cekResponse.addDirective(studylofi())
            cekResponse.addDirective(meta())
            cekResponse.addDirective(new Directive({ namespace: "PlaybackController", name: "Play", payload: {}}))
            break
          }
          case 'sleep': {
            cekResponse.appendSpeechText("잘때 듣는 로파이를 시작합니다.")
            cekResponse.addDirective(sleeplofi())
            cekResponse.addDirective(meta())
            cekResponse.addDirective(new Directive({ namespace: "PlaybackController", name: "Play", payload: {}}))
            break
          }
          case 'help': {
            cekResponse.appendSpeechText("공부할때 듣는 로파이 또는 잘때 든는 로파이 틀어줘, 라고 시도해보세요.")
            cekResponse.setMultiturn({
              intent: 'PlayLofi',
            })
          }
          default:{
            cekResponse.appendSpeechText("없는 로파이 종류입니다")
            cekResponse.appendSpeechText("로파이 종류 알려줘, 라고 시도해보세요.")
            cekResponse.setMultiturn({
              intent: 'PlayLofi',
            })
            break
          }
        }
        break
      case 'StopLofi': {
        cekResponse.addDirective(stop())
        cekResponse.appendSpeechText("로파이를 중지했습니다.")
        break
      }
      case Clova.GuideIntent: {
        cekResponse.appendSpeechText("없는 로파이 종류입니다")
        cekResponse.appendSpeechText("로파이 종류 알려줘, 라고 시도해보세요.")
        cekResponse.setMultiturn({
          intent: 'PlayLofi',
        })
        break
      }
    }
  }

  sessionEndedRequest(cekResponse) {
    cekResponse.setSimpleSpeechText("로파이 플레이어를 종료합니다.")
    cekResponse.clearMultiturn()
  }
}

class CEKResponse {
  constructor () {
    console.log('CEKResponse constructor')
    this.response = {
      directives: [],
      shouldEndSession: true,
      outputSpeech: {},
    }
    this.version = "0.1.0"
    this.sessionAttributes = {}
  }

  setMultiturn(sessionAttributes) {
    this.response.shouldEndSession = false
    this.sessionAttributes = _.assign(this.sessionAttributes, sessionAttributes)
  }

  clearMultiturn() {
    this.response.shouldEndSession = true
    this.sessionAttributes = {}
  }

  addDirective(directive) {
    this.response.directives.push(directive)
  }

  setSimpleSpeechText(outputText) {
    this.response.outputSpeech = {
      type: "SimpleSpeech",
      values: {
          type: "PlainText",
          lang: "ko",
          value: "outputText",
      },
    }
  }

  appendSpeechText(outputText) {
    const outputSpeech = this.response.outputSpeech
    if (outputSpeech.type != 'SpeechList') {
      outputSpeech.type = 'SpeechList'
      outputSpeech.values = []
    }
    if (typeof(outputText) == 'string') {
      outputSpeech.values.push({
        type: 'PlainText',
        lang: 'ko',
        value: outputText,
      })
    } else {
      outputSpeech.values.push(outputText)
    }
  }
}

const clovaReq = function (httpReq, httpRes, next) {
  cekResponse = new CEKResponse()
  cekRequest = new CEKRequest(httpReq)
  cekRequest.do(cekResponse)
  console.log('CEK Response')
  console.log(JSON.stringify(cekResponse))
  return httpRes.send(cekResponse)
}

module.exports = clovaReq
