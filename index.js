var botkit = require('botkit')
var morgan = require('morgan')

// default port to 8080 for local dev
var PORT = process.env.PORT || 8080

var controller = botkit.slackbot()
var beepboop = require('beepboop-botkit').start(controller, {
  debug: true
})

controller.setupWebserver(PORT, function (err, webserver) {
  if (err) {
    console.error(err)
    process.exit(1)
  }

  // Add an http logger
  webserver.use(morgan('dev'))
  // Setup our slash command webhook endpoints
  controller.createWebhookEndpoints(webserver)
})

// Send a message to the user that added the bot right after it connects
beepboop.on('add_resource', function (message) {
  var slackTeamId = message.resource.SlackTeamID
  var slackUserId = message.resource.SlackUserID

  // TODO: flip this bit once it's launched
  if (!message.IsNew && slackUserId) {
    var bot = beepboop.botByTeamId(slackTeamId)
    if (!bot) {
      return console.log('Error looking up botkit bot for team %s', slackTeamId)
    }

    bot.startPrivateConversation({user: slackUserId}, function (err, convo) {
      if (err) {
        return console.log(err)
      }

      convo.next()
      convo.say('I am a bot that has just joined your team')
      convo.say('You must now /invite me to a channel so that I can be of use!')
    })
  }
})

controller.on('slash_command', function (bot, message) {
  switch (message.command) {
    case '/beepboop':
      var response = 'boopbeep'

      bot.replyPublic(message, response)
      break
    default:
      bot.replyPrivate(message, "Sorry, I'm not sure what that command is")
  }
})
