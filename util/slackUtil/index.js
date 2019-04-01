const logger 			= require( '../../config/logger' );

function getTemplate(data){

  try {

    const text  	= (data.action) ? `New cord ${data.title} has been created` : `The ${data.title} cord has been modified`;

    const source 	= text +` by ${data.username} in ${data.app} application with following details, \n` +
        `1. Title: ${data.title}  \n ` +
        `2. Description: ${data.description} \n`+
        `3. Category: ${data.category} \n`+
        `For more details logon to smoke signal app, ${data.url} and be a Hero !`;
    return source;

  } catch ( err ) {
    logger.error( `Error sending slack notification template: ${err}` );
  }

}

module.exports 		= 	{ getTemplate };
