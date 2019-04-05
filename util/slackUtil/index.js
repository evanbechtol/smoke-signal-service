const logger = require( "../../config/logger" );

function getTemplate ( data ) {
  try {
    return `A cord has been ${( data.action ) ? "pulled" : "updated"}!\n` +
        `- *User*: ${data.username}\n` +
        `- *Application*: ${data.app} \n` +
        `- *Title*: ${data.title}  \n ` +
        `- *Description*: ${data.description} \n` +
        `- *Category*: ${data.category} \n\n` +
        `_*<${data.url}|Click here for more details>*, and be a hero now!_`;
  } catch ( err ) {
    logger.error( `Error sending slack notification template: ${err}` );
  }
}

module.exports = { getTemplate };
