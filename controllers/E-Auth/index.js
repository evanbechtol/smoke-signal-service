const config  = require( "../../config" );
const logger  = require( "../../config/logger" );
const resUtil = require( "../../util/responseUtil" );
const request = require( "request" );

module.exports = { validateApp };

function validateApp ( req, res, next ) {
  let token      = ( req.headers && req.headers.authorization !== undefined ) ? req.headers.authorization.slice( 7 ) : req.query.appToken || req.params.appToken || req.body.appToken;
  const endpoint = "e_auth/validate/apps";
  const url      = `${config.eAuthUrl}/${endpoint}?token=${token}`;
  const options  = { auth : { bearer : token } };

  if ( token ) {
    request.get( url, options, function ( err, response, body ) {
      const data = JSON.parse( body );
      //debugger;
      if ( data.success === false ) {
        return res.status( 400 ).send( resUtil.sendError( data.data.message ) );
      }
      next();
    } );
  } else {
    return res.status( 400 ).send( resUtil.sendError( "appToken must be included in querystring/params/body for request" ) );
  }


}
