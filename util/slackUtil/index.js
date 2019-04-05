const logger = require( "../../config/logger" );

function getTemplate ( data ) {
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

module.exports = { getTemplate };
