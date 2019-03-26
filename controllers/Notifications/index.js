const toolNotification = require( "../../models/toolNotification" );
const qUtil          = require( "../../util/queryUtil" );
const resUtil        = require( "../../util/responseUtil" );

module.exports = {
  getToolNotificationUnreadList,
  updateNotification
}; 

function getToolNotificationUnreadList(req, res) {
	const queryStrings = qUtil.getDbQueryStrings( req.query );

	//to get unread count
	var notificationCount = 0;
	toolNotification.count(queryStrings.query, function(err, count) {
        if (!err) {
            notificationCount = count;
        } else {

            return res.send(err);
        }
    });
	
	//to get list of unread notification
	toolNotification
      .find(queryStrings.query)
      .sort( { created_timestamp: 'desc' } )
      .limit( queryStrings.limit )
	  .exec( function ( err, results ) {
        if ( err ) {
          return res.status( 500 ).send( resUtil.sendError( err ) );
        }
		const response = { 'notificationCount': notificationCount, 'notificationList':results };
        return res.send( resUtil.sendSuccess( response ) );
      } );
}


function updateNotification(req, res) {
	const _id = req.query.id || req.params.id || null;
	
	if ( _id ){
		const updatedData = { $set: { readTimeStamp: new Date() } };
		
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
 
 
