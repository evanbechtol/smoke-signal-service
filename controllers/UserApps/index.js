const resUtil              = require( "../../util/responseUtil" );
const objectUtil           = require( "../../util" );
const UserApps             = require( "../../models/userApps" );
const logger               = require( "../../config/logger" );
const userAppsKeyWhitelist = [ "user", "apps" ];

module.exports = {
  createUserApps
};

// Todo: create callback to create UserApps when user registered
function createUserApps ( req, res ) {
  if ( req.body ) {
    const body = objectUtil.whitelist( req.body, userAppsKeyWhitelist );
    UserApps.create( body, function ( err, results ) {
      if ( err ) {
        logger.error( err );
        return res.status( 500 ).send( resUtil.sendError( err ) );
      }
      return res.send( resUtil.sendSuccess( results ) );
    } );
  } else {
    logger.error( "Request body not provided" );
    return res.status( 400 ).send( resUtil.sendError( "Request body not provided" ) );
  }
}
