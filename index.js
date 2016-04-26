var botkit = require('botkit')
var logger = require('morgan')

// Beep Boop specifies the port you should listen on default to 8080 for local dev
var PORT = process.env.PORT || 8080

var controller = botkit.slackbot()

// Detect if we're running in single-team of multi-team mode
// realistically you probably know which one of these approaches you need
if (process.env.SLACK_TOKEN) {
  // single team mode
  // botkit depends on team info being populated in it's storage
  populateTeamInfo(controller, process.env.SLACK_TOKEN)
} else {
  // multi-team mode
  require('beepboop-botkit').start(controller, { debug: true })
}

controller.setupWebserver(PORT, function (err, webserver) {
  if (err) {
    console.error(err)
    process.exit(1)
  }

  webserver.use(logger('tiny'))
  // Setup our slash command webhook endpoints
  controller.createWebhookEndpoints(webserver)
})

controller.on('slash_command', function (bot, message) {
  switch (message.command) {
    case '/beepboop':
      bot.replyPrivate(message, 'boopbeep')
      break
    default:
      bot.replyPrivate(message, "Sorry, I'm not sure what that command is")
  }
})

controller.hears(['hello', 'hi'], ['direct_message', 'direct_mention', 'mention'], function (bot, message) {
  bot.reply(message, 'Hola!')
})

// Need to populate team info for single team slack bot
function populateTeamInfo (controller, token) {
  var bot = controller.spawn({ token: token }).startRTM(function (err, bot, payload) {
    if (err) {
      console.error(err)
    }
  })

  bot.api.team.info({}, function (err, res) {
    if (err) {
      return console.error(err)
    }

    controller.storage.teams.save({id: res.team.id}, (err) => {
      if (err) {
        console.error(err)
      }
    })
  })
}
