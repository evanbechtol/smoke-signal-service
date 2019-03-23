const toolNotification = require( "../../models/toolNotification" );
const qUtil          = require( "../../util/queryUtil" );
const resUtil        = require( "../../util/responseUtil" );
const objectUtil     = require( "../../util" );
const logger         = require( "../../config/logger" );
const fs             = require( "fs" );
const loki           = require( "lokijs" );
const dbName         = "db.json";

module.exports = {
  getToolNotificationUnreadList,
  updateNotification
}; 

function getToolNotificationUnreadList(req, res) {
	console.log('body',req.body)
	const queryStrings = qUtil.getDbQueryStrings( req.query );
	//console.log(queryStrings);
	
	//to get unread count
	var notificationCount = 0;
	toolNotification.count(queryStrings.query, function(err, count) {
        if (!err) {
            notificationCount = count;
        } else {

            return res.send(err);
        }
    });
	
	console.log('queryStrings',queryStrings.query);
	//to get list of unread notification
	toolNotification
      .find(queryStrings.query)
      .sort( { created_timestamp: 'desc' } )
      .limit( queryStrings.limit )
	  .exec( function ( err, results ) {
        if ( err ) {
          return res.status( 500 ).send( resUtil.sendError( err ) );
        }
		console.log('results==',results)
		const response = { 'notificationCount': notificationCount, 'notificationList':results };
        return res.send( resUtil.sendSuccess( response ) );
      } );
}


function updateNotification(req, res) {
	const _id = req.query.id || req.params.id || null;
	
	if ( _id ){
		const updatedData = { $set: { read_timestamp: new Date() } };
		
		toolNotification.findByIdAndUpdate(_id, updatedData, function(err, result) {
			if (!err) { 
				 req.query =  req.body; 
				 getToolNotificationUnreadList(req, res);
			} else {

				return res.send(err); // 500 error
			}
		});
	}
}
 
 
