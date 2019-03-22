const toolNotification = require( "../../models/toolNotification" );
const qUtil          = require( "../../util/queryUtil" );
const resUtil        = require( "../../util/responseUtil" );
const objectUtil     = require( "../../util" );
const logger         = require( "../../config/logger" );
const fs             = require( "fs" );
const loki           = require( "lokijs" );
const dbName         = "db.json";

module.exports = {
  getToolNotificationUnreadCount,
  getToolNotificationUnreadList
};

function getToolNotificationUnreadCount (req, res) {
	const queryStrings = qUtil.getDbQueryStrings( req.query );
	//{ 'read_timestamp': null, 'notify_receiver': queryStrings.user_email }
    toolNotification.count(queryStrings.query, function(err, count) {
        if (!err) {
            return res.json(count);
        } else {

            return res.send(err);
        }
    });
}

function getToolNotificationUnreadList(req, res) {

    /*toolNotification.find({
        read_timestamp: null,
        'user._id': req.query.user_id
    }).sort({ created_timestamp: 'desc' }).limit(5).exec(function(err, results) {
        if (!err) {
            const resultArr = [];
            for (let i = 0; i < results.length; i++) {
                resultArr[i] = results[i].subject;
            }
            return res.json(results);
        } else {
            return res.send(err);
        }
    }); */
	
	const queryStrings = qUtil.getDbQueryStrings( req.query );
	toolNotification
      .find( queryStrings.query )
      .sort( queryStrings.sort )
      .limit( queryStrings.limit )
      .exec( function ( err, results ) {
        if ( err ) {
          return res.status( 500 ).send( resUtil.sendError( err ) );
        }

        return res.send( resUtil.sendSuccess( results ) );
      } );
}
 
 
