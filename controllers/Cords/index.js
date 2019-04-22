const Cords = require( "../../models/Cords" );
const CordService = require( "../../services/CordService" );
const SlackService = require( "../../services/SlackService" );
const CategoryList = require( "../../models/CategoryList/index.js" );
const qUtil = require( "../../util/queryUtil" );
const resUtil = require( "../../middlewares/response" );
const logger = require( "../../services/Logger" );
const CordsWhitelist = require( "../../config/keysWhitelists/cords" );
const Sentry = require( "@sentry/node" );

// Required for retrieving uploaded files
const path = require( "path" );
const fs = require( "fs" );
const ObjectService = require( "../../services/ObjectService" );
const Messages = require( "../../config/messages" );
const uploadPath = "uploads";

// Create a usable instance of the Cord Service
const CordServiceInstance = new CordService( Cords );
const CategoryServiceInstance = new CordService( CategoryList );

// Create a usable instance of the Slack Service
const SlackServiceInstance = new SlackService();

module.exports = {
  createCord,
  deleteCord,
  getCategoryList,
  getCordById,
  getCordByStatus,
  getCordForUser,
  getCords,
  getFile,
  getFilesByCordId,
  getUserStats,
  updateCord,
  updateRescuers,
  upload
};

Sentry.configureScope( scope => {
  scope.setTag( "route", "cords" );
} );

async function getCords ( req, res ) {

  try {
    const queryStrings = qUtil.getDbQueryStrings( req.query );
    const data = await CordServiceInstance.find( queryStrings.query );
    return res.send( resUtil.sendSuccess( data ) );
  } catch ( err ) {
    logger.error( err );
    res.status( 500 ).send( resUtil.sendError( err ) );
    throw err;
  }
}

async function getCategoryList ( req, res ) {
  try {
    const query = {};
    const data = await CategoryServiceInstance.getCategoryList( query );
    return res.send( resUtil.sendSuccess( data ) );
  } catch ( err ) {
    logger.error( err );
    res.status( 500 ).send( resUtil.sendError( err ) );
    throw err;
  }
}

async function getCordById ( req, res ) {
  try {
    const data = await CordServiceInstance.findById( req.id );
    return res.send( resUtil.sendSuccess( data ) );
  } catch ( err ) {
    logger.error( err );
    res.status( 500 ).send( resUtil.sendError( err ) );
    throw err;
  }
}

async function getCordByStatus ( req, res ) {
  const query = { status: req.status };

  try {
    const data = await CordServiceInstance.find( query, { openedOn: -1 } );
    return res.send( resUtil.sendSuccess( data ) );
  } catch ( err ) {
    logger.error( err );
    res.status( 500 ).send( resUtil.sendError( err ) );
    throw err;
  }
}

async function getCordForUser ( req, res ) {
  const status = req.query.status || req.params.status || "Open";
  const query = { puller: req.user, status };

  try {
    const data = await CordServiceInstance.find( query, { openedOn: -1 } );
    return res.send( resUtil.sendSuccess( data ) );
  } catch ( err ) {
    logger.error( err );
    res.status( 500 ).send( resUtil.sendError( err ) );
    throw err;
  }
}

async function getUserStats ( req, res ) {
  try {
    const data = await CordServiceInstance.getUserStats( req.user );
    return res.send( resUtil.sendSuccess( data ) );
  } catch ( err ) {
    logger.error( err );
    res.status( 500 ).send( resUtil.sendError( err ) );
    throw err;
  }
}

async function createCord ( req, res ) {
  const body = ObjectService.pick( req.body, CordsWhitelist.post );

  try {
    const data = await CordServiceInstance.create( body );

    req.body.header = req.header( "Referer" );
    await SlackServiceInstance.sendNotification( req.body, true );

    return res.send( resUtil.sendSuccess( data ) );
  } catch ( err ) {
    logger.error( err );
    res.status( 500 ).send( resUtil.sendError( err ) );
    throw err;
  }
}

async function updateCord ( req, res ) {
  const body = ObjectService.pick( req.body, CordsWhitelist.put );

  try {
    const data = await CordServiceInstance.update( req.id, body );

    await SlackServiceInstance.sendNotification( req.body, false );

    return res.send( resUtil.sendSuccess( data ) );
  } catch ( err ) {
    logger.error( err );
    res.status( 500 ).send( resUtil.sendError( err ) );
    throw err;
  }
}

async function updateRescuers ( req, res ) {

  if ( req.body.rescuers ) {
    const body = ObjectService.pick( req.body, CordsWhitelist.rescuers );
    const query = { $addToSet: { "rescuers": { $each: body.rescuers } } };

    try {
      const data = await CordServiceInstance.update( req.id, query );

      return res.send( resUtil.sendSuccess( data ) );
    } catch ( err ) {
      logger.error( err );
      res.status( 500 ).send( resUtil.sendError( err ) );
      throw err;
    }
  } else {
    return res.status( 400 ).send( resUtil.sendError( Messages.responses.bodyNotProvided ) );
  }
}

async function upload ( req, res ) {
  try {
    const data = await CordServiceInstance.upload( req.id, req.file );
    return res.send( resUtil.sendSuccess( data ) );
  } catch ( err ) {
    logger.error( err );
    res.status( 500 ).send( resUtil.sendError( err ) );
    throw err;
  }
}

async function getFilesByCordId ( req, res ) {
  try {
    const projection = { files: 1 };
    const data = await CordServiceInstance.getFilesByCordId( req.id, projection );

    return res.send( resUtil.sendSuccess( data ) );
  } catch ( err ) {
    logger.error( err );
    res.status( 500 ).send( resUtil.sendError( err ) );
    throw err;
  }
}

async function getFile ( req, res ) {
  const fileName = req.query.id || req.params.id || null;

  if ( fileName ) {
    try {
      const result = await CordService.getFile( fileName );

      if ( !result ) {
        return res.sendStatus( 404 );
      }

      res.setHeader( "Content-Type", result.mimetype );
      fs.createReadStream( path.join( uploadPath, result.filename ) ).pipe( res );
    } catch ( err ) {
      logger.error( err );
      res.status( 500 ).send( resUtil.sendError( err ) );
      throw err;
    }
  } else {
    return res.status( 400 ).send( resUtil.sendError( Messages.responses.idNotProvided ) );
  }
}

async function deleteCord ( req, res ) {
  try {
    const data = await CordServiceInstance.delete( req.id );
    return res.send( resUtil.sendSuccess( data ) );
  } catch ( err ) {
    logger.error( err );
    res.status( 500 ).send( resUtil.sendError( err ) );
    throw err;
  }
}
