const Handlebars 	= 	require('handlebars');
const logger 		= require( "../../../config/logger" );

function getTemplate(data){

	try {
		var text  	= (data.action) ? "New cord {{title}} has been created" : "The {{title}} cord has been modified";

		var source 	= text +" by {{username}} in {{app}} application with following details, \n" +
						"1. Title: {{title}}  \n " +
						"2. Description: {{description}} \n"+
						"3. Category: {{category}} \n"+  
						"For more details logon to smoke signal app, {{url}} and be a Hero !";

		var template = Handlebars.compile(source);

		return template(data);
		
	} catch ( err ) {
		logger.error( `Error sending slack notification template: ${err}` );
	}

}

module.exports 		= 	{ getTemplate };

