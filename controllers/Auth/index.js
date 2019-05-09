const AuthService = require( "../../services/AuthService" );
const resUtil = require( "../../middlewares/response" );
const qUtil = require( "../../util/queryUtil" );
const Users = require( "../../models/User" );
const logger = require( "../../services/Logger" );
const Sentry = require( "@sentry/node" );
const Messages = require( "../../config/messages" );

// Create a usable instance of the Cord Service
const AuthServiceInstance = new AuthService( Users );

module.exports = {
  login
};

async function login ( req, res ) {
  const queryStrings = qUtil.getDbQueryStrings( req.query );

  try {
    const query = { "user.username": { $eq: req.body.username } };
    const data = await AuthServiceInstance.login( query );

    if ( data ) {
      return res.send( resUtil.sendSuccess( data ) );
    } else {
      return res.status( 403 ).send( resUtil.sendError( Messages.auth.unableToAuthenticate ) );
    }
  } catch ( err ) {
    logger.error( err );
    res.status( 500 ).send( resUtil.sendError( err ) );

    // Capture the error with users information provided
    Sentry.withScope( scope => {
      scope.setTag( "query", queryStrings.query );
      Sentry.captureException( err );
    } );
  }
}
