const resUtil = require( "../../middlewares/response" );
const UserService = require( "../../services/UserService" );
const Users = require( "../../models/User" );
const logger = require( "../../services/Logger" );
const qUtil = require( "../../util/queryUtil" );

const UserServiceInstance = new UserService( Users );

module.exports = {
  createUser,
  getUser,
  getUserById,
  updateUser
};

async function createUser ( req, res ) {
  try {
    await UserServiceInstance.create( req.body );
    return res.status( 204 ).send( resUtil.sendSuccess() );
  } catch ( err ) {
    logger.error( err );
    res.status( 500 ).send( resUtil.sendError( err ) );
    throw new Error( err );
  }
}

async function getUser ( req, res ) {
  try {
    const queryStrings = qUtil.getDbQueryStrings( req.query );
    const user = await UserServiceInstance.findOne( queryStrings.query );
    return res.send( resUtil.sendSuccess( user ) );
  } catch ( err ) {
    logger.error( err );
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

async function updateUser ( req, res ) {
  try {
    const user = await UserServiceInstance.update( req.id, req.body );
    return res.send( resUtil.sendSuccess( user ) );
  } catch ( err ) {
    logger.error( err );
    res.send( resUtil.sendError( err ) );
    throw new Error( err );
  }
}
