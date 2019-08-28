// Models
const Cords = require( "../../models/Cords" );
const CategoryList = require( "../../models/CategoryList/index.js" );
const Notifications = require( "../../models/Notifications" );
const Users = require( "../../models/User" );

// Services
const CordService = require( "../../services/CordService" );
const NotificationService = require( "../../services/NotificationService" );
const SlackService = require( "../../services/SlackService" );
const UserService = require( "../../services/UserService" );

// Utils
const CordsWhitelist = require( "../../config/keysWhitelists/cords" );
const logger = require( "../../services/Logger" );
const Messages = require( "../../config/messages" );
const qUtil = require( "../../util/queryUtil" );
const Sentry = require( "@sentry/node" );

// Middlewares
const resUtil = require( "../../middlewares/response" );

// Required for retrieving uploaded files
const path = require( "path" );
const fs = require( "fs" );
const uploadPath = "uploads";

// Create usable instance of services
const CategoryServiceInstance = new CordService( CategoryList );
const CordServiceInstance = new CordService( Cords );
const NotificationServiceInstance = new NotificationService( Notifications );
const ObjectService = require( "../../services/ObjectService" );
const SlackServiceInstance = new SlackService();
const UserServiceInstance = new UserService( Users );

module.exports = {
  createAnswer,
  createCord,
  deleteAnswer,
  deleteCord,
  getCategoryList,
  getCordById,
  getCordByStatus,
  getCordForUser,
  getCords,
  getFile,
  getFilesByCordId,
  getUserStats,
  updateAnswer,
  updateCord,
  updateRescuers,
  upload
};

Sentry.configureScope( scope => {
  scope.setTag( "route", "cords" );
} );

/**
 * @description Create an answer for a cord with the provided body
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
async function createAnswer ( req, res ) {
  try {
    // Remove keys that are not allowed
    const data = ObjectService.pick( req.body, CordsWhitelist.answer );
    const updatedCord = await CordServiceInstance.createAnswer( req.id, data );
    return res.send( resUtil.sendSuccess( updatedCord ) );
  } catch ( err ) {
    logger.error( err );
    res.status( 500 ).send( resUtil.sendError( err.message ) );
    throw err;
  }
}

/**
 * @description Create a cord with the provided body
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
async function createCord ( req, res ) {
  try {
    // Create Cord
    const body = ObjectService.pick( req.body, CordsWhitelist.post );

    // Make sure that answers property exists
    if ( !body.answers ) {
      body.answers = [];
    }

    const createdCord = await CordServiceInstance.create( body );

    // Retrieve User Apps
    const userQuery = {
      apps: createdCord.app,
      "user.username": { $ne: createdCord.puller.username }
    };
    const userResult = await UserServiceInstance.find( userQuery );

    // Send Slack message
    req.body.header = req.header( "Referer" );
    await SlackServiceInstance.sendNotification( req.body, true );

    // Create Notification
    createdCord.subject = Messages.notifications.cordCreated;
    const notifications = await NotificationServiceInstance.create( createdCord, userResult );

    const responseBody = notifications && notifications.length ? notifications : createdCord._doc;
    return res.send( resUtil.sendSuccess( responseBody ) );
  } catch ( err ) {
    logger.error( err );
    res.status( 500 ).send( resUtil.sendError( err.message ) );
    throw err;
  }
}

/**
 * @description Delete an answer for a cord matching the provided ID
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
async function deleteAnswer ( req, res ) {
  try {
    // Remove keys that are not allowed
    const updatedCord = await CordServiceInstance.deleteAnswer( req.id, req.params.answerId );
    return res.send( resUtil.sendSuccess( updatedCord ) );
  } catch ( err ) {
    logger.error( err );
    res.status( 500 ).send( resUtil.sendError( err.message ) );
    throw err;
  }
}

/**
 * @description Delete a cord matching the provided ID
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
async function deleteCord ( req, res ) {
  try {
    const data = await CordServiceInstance.delete( req.id );
    return res.send( resUtil.sendSuccess( data ) );
  } catch ( err ) {
    logger.error( err );
    res.status( 500 ).send( resUtil.sendError( err.message ) );

    // Capture the error with users information provided
    Sentry.withScope( scope => {
      scope.setTag( "id", req.id );
      Sentry.captureException( err );
    } );
  }
}

/**
 * @description Retrieve items from the Category Collection
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
async function getCategoryList ( req, res ) {
  try {
    const query = {};
    const data = await CategoryServiceInstance.getCategoryList( query );
    return res.send( resUtil.sendSuccess( data ) );
  } catch ( err ) {
    logger.error( err );
    res.status( 500 ).send( resUtil.sendError( err.message ) );
    throw err;
  }
}

/**
 * @description Retrieve one or many cords. Accepts an optional JSON query
 * to be performed on the Mongo Collection
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
async function getCords ( req, res ) {
  const queryStrings = qUtil.getDbQueryStrings( req.query );

  try {
    const data = await CordServiceInstance.find( queryStrings.query );
    return res.send( resUtil.sendSuccess( data ) );
  } catch ( err ) {
    logger.error( err );
    res.status( 500 ).send( resUtil.sendError( err.message ) );

    // Capture the error with users information provided
    Sentry.withScope( scope => {
      scope.setTag( "query", queryStrings.query );
      Sentry.captureException( err );
    } );
  }
}

/**
 * @description Retrieve a single cord by the Object ID
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
async function getCordById ( req, res ) {
  try {
    const data = await CordServiceInstance.findById( req.id );
    return res.send( resUtil.sendSuccess( data ) );
  } catch ( err ) {
    logger.error( err );
    res.status( 500 ).send( resUtil.sendError( err.message ) );

    // Capture the error with users information provided
    Sentry.withScope( scope => {
      scope.setTag( "id", req.id );
      Sentry.captureException( err );
    } );
  }
}

/**
 * @description Retrieve one or many cords by their status
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
async function getCordByStatus ( req, res ) {
  const query = { status: req.status };

  try {
    const data = await CordServiceInstance.find( query, { openedOn: -1 } );
    return res.send( resUtil.sendSuccess( data ) );
  } catch ( err ) {
    logger.error( err );
    res.status( 500 ).send( resUtil.sendError( err.message ) );

    // Capture the error with users information provided
    Sentry.withScope( scope => {
      scope.setTag( "status", req.status );
      Sentry.captureException( err );
    } );
  }
}

/**
 * @description Retrieve cords by their status and by the users who pulled
 * the cord
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
async function getCordForUser ( req, res ) {
  const status = req.query.status || req.params.status || "Open";
  const query = { puller: req.user, status };

  try {
    const data = await CordServiceInstance.find( query, { openedOn: -1 } );
    return res.send( resUtil.sendSuccess( data ) );
  } catch ( err ) {
    logger.error( err );
    res.status( 500 ).send( resUtil.sendError( err.message ) );

    // Capture the error with users information provided
    Sentry.withScope( scope => {
      scope.setUser( req.user );
      Sentry.captureException( err );
    } );
  }
}

/**
 * @description Retrieve all files for a cord matching the provided ID
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
async function getFilesByCordId ( req, res ) {
  try {
    const projection = { files: 1 };
    const data = await CordServiceInstance.getFilesByCordId( req.id, projection );

    return res.send( resUtil.sendSuccess( data ) );
  } catch ( err ) {
    logger.error( err );
    res.status( 500 ).send( resUtil.sendError( err.message ) );

    // Capture the error with users information provided
    Sentry.withScope( scope => {
      scope.setTag( "id", req.id );
      Sentry.captureException( err );
    } );
  }
}

/**
 * @description Retrieve a single file by ID
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
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
      res.status( 500 ).send( resUtil.sendError( err.message ) );
      throw err;
    }
  } else {
    return res.status( 400 ).send( resUtil.sendError( Messages.responses.idNotProvided ) );
  }
}

/**
 * @description Retrieve users statistics for cord related data
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
async function getUserStats ( req, res ) {
  try {
    const data = await CordServiceInstance.getUserStats( req.user );
    return res.send( resUtil.sendSuccess( data ) );
  } catch ( err ) {
    logger.error( err );
    res.status( 500 ).send( resUtil.sendError( err.message ) );

    // Capture the error with users information provided
    Sentry.withScope( scope => {
      scope.setUser( req.user );
      Sentry.captureException( err );
    } );
  }
}

/**
 * @description Update a answer with the provided keys
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
async function updateAnswer ( req, res ) {
  try {
    // Retrieve the cord
    let retrievedCord = await CordServiceInstance.findOne( { _id: req.id }, {}, { lean: false } );

    // No matching cord was found
    if ( !retrievedCord ) {
      return res.status( 404 ).send( resUtil.sendError( Messages.responses.cordNotFound ) );
    }

    // Find the answer and update
    retrievedCord.answers = retrievedCord.answers.map( answer => {
      if ( answer._id.toString() === req.body._id ) {
        return req.body;
      }
      return answer;
    } );

    // Save changes to database
    const updatedCord = await retrievedCord.save();

    return res.send( resUtil.sendSuccess( updatedCord ) );
  } catch ( err ) {
    logger.error( err );
    res.status( 500 ).send( resUtil.sendError( err.message ) );

    // Capture the error with users information provided
    Sentry.withScope( scope => {
      scope.setTag( "id", req.id );
      Sentry.captureException( err );
    } );
  }
}

/**
 * @description Update a cord with the provided by, matching the provided
 * Object ID
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
async function updateCord ( req, res ) {
  const body = ObjectService.pick( req.body, CordsWhitelist.put );

  try {
    // Update the cord
    const updatedCord = await CordServiceInstance.update( req.id, body );

    // Send slack notification
    await SlackServiceInstance.sendNotification( updatedCord, false );

    // Send tool notification
    const notificationResult = NotificationServiceInstance.userDiscussion( updatedCord );
    return res.send( resUtil.sendSuccess( notificationResult ) );
  } catch ( err ) {
    logger.error( err );
    res.status( 500 ).send( resUtil.sendError( err.message ) );

    // Capture the error with users information provided
    Sentry.withScope( scope => {
      scope.setTag( "id", req.id );
      Sentry.captureException( err );
    } );
  }
}

/**
 * @description Update the rescuers on the cord matching the provided Object ID
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
async function updateRescuers ( req, res ) {

  if ( req.body.rescuers ) {
    const body = ObjectService.pick( req.body, CordsWhitelist.rescuers );
    const query = { $addToSet: { "rescuers": { $each: body.rescuers } } };

    try {
      const data = await CordServiceInstance.update( req.id, query );

      return res.send( resUtil.sendSuccess( data ) );
    } catch ( err ) {
      logger.error( err );
      res.status( 500 ).send( resUtil.sendError( err.message ) );

      // Capture the error with users information provided
      Sentry.withScope( scope => {
        scope.setTag( "id", req.id );
        Sentry.captureException( err );
      } );
    }
  } else {
    return res.status( 400 ).send( resUtil.sendError( Messages.responses.bodyNotProvided ) );
  }
}

/**
 * @description Upload a file and associate it to the cord matching the
 * provided ID
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
async function upload ( req, res ) {
  try {
    const data = await CordServiceInstance.upload( req.id, req.file );
    return res.send( resUtil.sendSuccess( data ) );
  } catch ( err ) {
    logger.error( err );
    res.status( 500 ).send( resUtil.sendError( err.message ) );

    // Capture the error with users information provided
    Sentry.withScope( scope => {
      scope.setTag( "id", req.id );
      Sentry.captureException( err );
    } );
  }
}

