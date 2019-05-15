const resUtil = require( "../../middlewares/response" );
const TeamService = require( "../../services/TeamService" );
const Teams = require( "../../models/Teams" );
const logger = require( "../../services/Logger" );
const qUtil = require( "../../util/queryUtil" );

const TeamServiceInstance = new TeamService( Teams );

module.exports = {
  createTeam,
  getTeam,
  getTeamById,
  updateTeam
};

async function createTeam ( req, res ) {
  try {
    await TeamServiceInstance.create( req.body );
    return res.status( 204 ).send( resUtil.sendSuccess() );
  } catch ( err ) {
    logger.error( err );
    res.status( 500 ).send( resUtil.sendError( err ) );
    throw new Error( err );
  }
}

async function getTeam ( req, res ) {
  try {
    const queryStrings = qUtil.getDbQueryStrings( req.query );
    const user = await TeamServiceInstance.findOne( queryStrings.query );
    return res.send( resUtil.sendSuccess( user ) );
  } catch ( err ) {
    logger.error( err );
    throw new Error( err );
  }
}

async function getTeamById ( req, res ) {
  try {
    const user = await TeamServiceInstance.findById( req.id );
    return res.send( resUtil.sendSuccess( user ) );
  } catch ( err ) {
    logger.error( err );
    throw new Error( err );
  }
}

async function updateTeam ( req, res ) {
  try {
    const user = await TeamServiceInstance.update( req.id, req.body );
    return res.send( resUtil.sendSuccess( user ) );
  } catch ( err ) {
    logger.error( err );
    res.send( resUtil.sendError( err ) );
    throw new Error( err );
  }
}
