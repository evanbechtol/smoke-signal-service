const config = require( "../config" );
const logger = require( "../services/Logger" );
const resUtil = require( "./responseMiddleware" );
const request = require( "request" );

module.exports = { validateApp };

function validateApp ( req, res, next ) {
  // Todo: Refactor this into a token middleware
  let token = ( req.headers && req.headers.authorization !== undefined ) ? req.headers.authorization.slice( 7 ) : req.query.appToken || req.params.appToken || req.body.appToken;
  const endpoint = "e_auth/validate/apps";
  const url = `${config.eAuthUrl}/${endpoint}?token=${token}`;
  const options = { auth: { bearer: token } };

  if ( token ) {
    request.get( url, options, function ( err, response, body ) {
      if ( err ) {
        return res.status( 500 ).send( resUtil.sendError( err ) );
      }

      let data;

      if ( typeof body === "object" ) {
        data = body;
      } else {
        try {
          data = JSON.parse( body );
        } catch ( e ) {
          logger.error( JSON.stringify( e ) );
        }
      }

      if ( data && data.success === false ) {
        return res.status( 400 ).send( resUtil.sendError( data && data.data ? data.data.message : JSON.stringify( data ) ) );
      }

      next();
    } );
  } else {
    // Todo: Refactor hard-coded message into a constant
    return res.status( 400 ).send( resUtil.sendError( "appToken must be included in querystring/params/body for request" ) );
  }
}
