var botkit = require('botkit')
var morgan = require('morgan')

// default port to 8080 for local dev
var PORT = process.env.PORT || 8080

var controller = botkit.slackbot()
var beepboop = require('beepboop-botkit').start(controller)

// This is for populating botkit's storage w/ the corresponding team info so slash commands work
// Once a bot scales beyond 1 process this approach has some limitations
beepboop.on('add_resource', function (message) {
  var slackTeamId = message.resource.SlackTeamID

  // Get a handle on the team's botkit worker/bot
  var resource = Object.keys(beepboop.workers).filter(function (entry) {
    return entry.resource.SlackTeamID === slackTeamId
  })[0]
  if (!resource) {
    console.log('Cannot find a matching resource for team %s', slackTeamId)
    return
  }

  // Fill botkit's storage w/ corresponding team info
  resource.worker.api.team.info({}, function (err, response) {
    controller.saveTeam(response.team, function (err, team) {
      if (err) {
        console.log('Error getting team info for team %s: %s', slackTeamId, err.message)
        return
      }

      console.log("Saved the team information...")
    )
  })
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

controller.on('slash_command', function (bot, message) {
  switch (message.command) {
    case 'beepboop':
      var response = 'boopbeep'

      bot.replyPublic(message, response)
      break
    default:
      bot.replyPrivate(message, "Sorry, I'm not sure what that command is")
  }
})