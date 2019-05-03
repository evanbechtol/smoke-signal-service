const Notifications = require( "../../models/ToolNotification" );
const qUtil = require( "../../util/queryUtil" );
const resUtil = require( "../../middlewares/response" );
const logger = require( "../../services/Logger" );
const Sentry = require( "@sentry/node" );

// Create a usable instance of Notification Service
const NotificationService = require( "../../services/NotificationService" );
const NotificationServiceInstance = new NotificationService( Notifications );

module.exports = {
  getToolNotificationUnreadList,
  updateNotification,
};

/**
 * @description Retrieve unread notifications using the provided query
 * @param req {object} Express req  object
 * @param res {object} Express res  object
 * @returns {Promise<*>}
 */
async function getToolNotificationUnreadList ( req, res ) {
  const queryStrings = qUtil.getDbQueryStrings( req.query );

  try {
    const sort = { created_timestamp: "desc" };
    const data = await NotificationServiceInstance.find( queryStrings.query, sort );
    return res.send( resUtil.sendSuccess( data ) );
  } catch ( err ) {
    logger.error( err );
    res.status( 500 ).send( resUtil.sendError( err ) );

    // Capture the error with user information provided
    Sentry.withScope( scope => {
      scope.setTag( "query", queryStrings.query );
      Sentry.captureException( err );
    } );
  }
}

/**
 * @description Attempt to update the notification matching the provided ID
 * @param req {object} Express req  object
 * @param res {object} Express res  object
 * @returns {Promise<*>}
 */
async function updateNotification ( req, res ) {
  try {
    const query = { $set: { readTimeStamp: new Date() } };
    await NotificationServiceInstance.update( req.id, query );

    req.query = req.body;
    return getToolNotificationUnreadList( req, res );
  } catch ( err ) {
    logger.error( err );
    res.status( 500 ).send( resUtil.sendError( err ) );

    // Capture the error with user information provided
    Sentry.withScope( scope => {
      scope.setTag( "id", req.id );
      Sentry.captureException( err );
    } );
  }
}
