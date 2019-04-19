const config = require( "../config" );
const logger = require( "./Logger" );
const Slack = ( config.slackWebhookUrl !== undefined ) ? require( "slack-notify" )( `${config.slackWebhookUrl}` ) : false;

class SlackService {
  /**
   * @description Initializes a new instance of the SlackService
   */
  constructor () {
  }

  /**
   * @description Sends a Slack notification with the body provided
   * @param body {object} Required: Body to use to create the notification
   * @param create {boolean} Optional: Controls the type of message being sent
   */
  async sendNotification ( body, create = false ) {
    if ( !Slack ) {
      logger.error( "The parameter slackWebhookUrl is not defined, unable to send Slack notification" );
      return false;
    }
    try {
      let data = {
        action: create,
        title: body.title,
        username: body.puller.username,
        app: body.app,
        description: body.description,
        category: body.category,
        url: body.header
      };

      const slackBody = SlackService.getTemplate( data );
      const slackOptions = {
        channel: `${config.slackChannel}`,
        icon_emoji: `${config.iconEmoji}`,
        attachments: slackBody.attachments,
        unfurl_links: 1,
        username: `${config.slackUsername}`
      };

      Slack.send( slackOptions );

      Slack.onError = function ( err ) {
        logger.error( `Error sending Slack notification: ${err}` );
      };

    } catch ( err ) {
      logger.error( `Error sending Slack notification: ${err}` );
    }
  }

  /**
   * @description Generates the template that is used for Slack messages
   * @param data {object} Required: Data object to generate template with
   * @returns {{attachments: {color: string, pretext: string, fields: {short: boolean, title: *, value: string}[], fallback: string}[], text: string}}
   */
  static getTemplate ( data ) {
    try {
      const text = `- *User*: ${data.username}\n` +
        `- *Application*: ${data.app} \n` +
        `- *Title*: ${data.title}  \n` +
        `- *Description*: ${data.description} \n` +
        `- *Category*: ${data.category}`;

      const attachments = {
        fallback : `A cord has been ${( data.action ) ? "pulled" : "updated"}! _*<${data.url}|Click here for more details>*_`,
        pretext  : `A cord has been ${( data.action ) ? "pulled" : "updated"}! _*<${data.url}|Click here for more details>*_`,
        color    : "#0084F0", // Can either be one of 'good', 'warning', 'danger', or any hex color code
        // Fields are displayed in a table on the message
        fields   : [
          {
            title : data.title, // The title may not contain markup and will be escaped for you
            value : text,
            short : false // Optional flag indicating whether the `value` is short enough to be displayed side-by-side with other values
          }
        ]
      };

      return { text, attachments: [ attachments ] };
    } catch ( err ) {
      logger.error( `Error sending slack notification template: ${err}` );
    }
  }
}

module.exports = SlackService;
