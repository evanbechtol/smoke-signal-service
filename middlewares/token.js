const Messages = require( "../config/messages" );
const resUtil = require( "./response" );
module.exports = { validateToken };

function validateToken ( req, res, next ) {
  const token = ( req.headers && req.headers.authorization !== undefined )
    ? req.headers.authorization.slice( 7 )
    : req.query.appToken || req.params.appToken || req.body.appToken;

  if ( token ) {
    req.token = token;
    next();
  } else {
    return res.status( 400 ).send( resUtil.sendError( Messages.responses.appTokenNotProvided ) );
  }
}
