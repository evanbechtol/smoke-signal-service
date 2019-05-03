const AppService = require( "../../services/AppService" );
const resUtil = require( "../../middlewares/response" );
const qUtil = require( "../../util/queryUtil" );
const Apps = require( "../../models/Apps" );
const logger = require( "../../services/Logger" );
const Sentry = require( "@sentry/node" );

// Create a usable instance of the Cord Service
const AppServiceInstance = new AppService( Apps );

module.exports = {
  getApps
};

async function getApps ( req, res ) {
  const queryStrings = qUtil.getDbQueryStrings( req.query );

  try {
    const data = await AppServiceInstance.find( queryStrings.query );
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
