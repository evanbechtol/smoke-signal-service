const resUtil = require( "../../middlewares/response" );
const ObjectService = require( "../../services/ObjectService" );
const UserService = require( "../../services/UserService" );
const Users = require( "../../models/User" );
const logger = require( "../../services/Logger" );
const usersKeyWhitelist = require( "../../config/whitelists" ).users;

const UserServiceInstance = new UserService( Users );

module.exports = {
  createUser,
  getUserById
};

async function createUser ( req, res ) {
  try {
    const body = ObjectService.pick( req.body, usersKeyWhitelist.model );
    await UserServiceInstance.create( body );
    return res.status( 204 ).send( resUtil.sendSuccess() );
  } catch ( err ) {
    logger.error( err );
    res.status( 500 ).send( resUtil.sendError( err ) );
    throw new Error( err );
  }
}

async function getUserById ( req, res ) {
  try {
    const user = await UserServiceInstance.findById( req.id );
    return res.send( resUtil.sendSuccess( user ) );
  } catch ( err ) {
    logger.error( err );
    throw new Error( err );
  }
}
