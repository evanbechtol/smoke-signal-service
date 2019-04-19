const Cords = require( "../../models/Cords" );
const CordService = require( "../../services/CordService" );
const SlackService = require( "../../services/SlackService" );
const CategoryList = require( "../../models/CategoryList/index.js" );
const qUtil = require( "../../util/queryUtil" );
const resUtil = require( "../../util/responseUtil" );
const objectUtil = require( "../../util" );
const logger = require( "../../config/logger" );

// Todo: Remove all unused dependencies after refactor complete
const path = require( "path" );
const fs = require( "fs" );
const loki = require( "lokijs" );
const dbName = "db.json";
const collectionName = "files";
const uploadPath = "uploads";
const db = new loki( `${uploadPath}/${dbName}`, { persistenceMethod: "fs" } );
const config = require( "../../config" );
const slack = ( config.slackWebhookUrl !== undefined ) ? require( "slack-notify" )( `${config.slackWebhookUrl}` ) : false;
const slackNotificationUtil = require( "../../util/slackUtil" );

// Create a usable instance of the Cord Service
const CordServiceInstance = new CordService( Cords );

// Create a usable instance of the Slack Service
const SlackServiceInstance = new SlackService();

// Todo: Refactor this to be in file and in validator
const cordsKeyWhitelist = [
  "status",
  "description",
  "app",
  "category",
  "puller",
  "rescuers",
  "openedOn",
  "title",
  "likes",
  "tags"
];

module.exports = {
  getCords,
  getCordById,
  getCordByStatus,
  getCordForUser,
  getFile,
  getFilesByCordId,
  getUserStats,
  createCord,
  updateCord,
  updateRescuers,
  upload,
  deleteCord,
  getCategoryList
};

async function getCords ( req, res ) {
  const queryStrings = qUtil.getDbQueryStrings( req.query );

  try {
    const data = await CordServiceInstance.find( queryStrings.query );
    return res.send( resUtil.sendSuccess( data ) );
  } catch ( err ) {
    return res.status( 500 ).send( resUtil.sendError( err ) );
  }
}

// Todo: Refactor this to use Cord Service
function getCategoryList ( req, res ) {
  CategoryList
    .find( {} )
    .then( results => {
      if ( !results.length ) {
        results = [
          { name: "Bug" },
          { name: "Troubleshooting" },
          { name: "Deployment" },
          { name: "Others" }
        ];
      }
      return res.send( resUtil.sendSuccess( results ) );
    } )
    .catch( err => {
      return res.status( 500 ).send( resUtil.sendError( err ) );
    } );
}

async function getCordById ( req, res ) {
  const id = req.query.id || req.params.id || null;

  try {
    const data = await CordServiceInstance.findById( id );
    return res.send( resUtil.sendSuccess( data ) );
  } catch ( err ) {
    return res.status( 500 ).send( resUtil.sendError( err ) );
  }
}

async function getCordByStatus ( req, res ) {
  const status = req.query.status || req.params.status || null;
  const query = { status };

  try {
    const data = await CordServiceInstance.find( query, { openedOn: -1 } );
    return res.send( resUtil.sendSuccess( data ) );
  } catch ( err ) {
    return res.status( 500 ).send( resUtil.sendError( err ) );
  }
}

async function getCordForUser ( req, res ) {
  let user = req.query.user || req.params.user || null;
  let status = req.query.status || req.params.status || "Open";

  // Todo: Refactor this to be in validator
  try {
    user = JSON.parse( user );
  } catch ( e ) {
    logger.error( `Error parsing user object: ${user}` );
    return res.status( 500 ).send( resUtil.sendError( "Invalid JSON object provided" ) );
  }

  const query = { puller: user, status };

  try {
    const data = await CordServiceInstance.find( query, { openedOn: -1 } );
    return res.send( resUtil.sendSuccess( data ) );
  } catch ( err ) {
    return res.status( 500 ).send( resUtil.sendError( err ) );
  }
}

async function getUserStats ( req, res ) {
  let user = req.query.user || req.params.user || null;

  // Todo: refactor this into a middleware
  try {
    user = JSON.parse( user );
  } catch ( e ) {
    logger.error( `Error parsing user object: ${user}` );
    return res.status( 500 ).send( resUtil.sendError( "Invalid JSON object provided" ) );
  }

  try {
    const data = await CordServiceInstance.getUserStats( user );
    return res.send( resUtil.sendSuccess( data ) );
  } catch ( err ) {
    return res.status( 500 ).send( resUtil.sendError( err ) );
  }
}

// Todo: create callback to send notification when cord created
async function createCord ( req, res ) {
  if ( req.body ) {
    const body = objectUtil.whitelist( req.body, cordsKeyWhitelist );

    try {
      const data = await CordServiceInstance.create( body );

      // Todo validator to check for this
      req.body.header = req.header( "Referer" );
      await SlackServiceInstance.sendNotification( req.body, true );

      return res.send( resUtil.sendSuccess( data ) );
    } catch ( err ) {
      return res.status( 500 ).send( resUtil.sendError( err ) );
    }
  } else {
    return res.status( 400 ).send( resUtil.sendError( "Request body not provided" ) );
  }
}

async function updateCord ( req, res ) {
  const id = req.query.id || req.params.id || null;

  // Todo Refactor this to be in validator
  const updateCordWhitelist = [
    "status",
    "description",
    "discussion",
    "app",
    "category",
    "rescuers",
    "resolvedOn",
    "title",
    "tags"
  ];
  if ( id && req.body ) {
    const body = objectUtil.whitelist( req.body, updateCordWhitelist );
    try {
      const data = await CordServiceInstance.update( id, body );

      await SlackServiceInstance.sendNotification( req.body, false );

      return res.send( resUtil.sendSuccess( data ) );
    } catch ( err ) {
      return res.status( 500 ).send( resUtil.sendError( err ) );
    }
  } else {
    return res.status( 400 ).send( resUtil.sendError( "Request ID or Body was not provided" ) );
  }
}

async function updateRescuers ( req, res ) {
  const id = req.query.id || req.params.id || null;

  const updateCordWhitelist = [ "rescuers" ];

  if ( id && req.body && req.body.rescuers ) {
    const body = objectUtil.whitelist( req.body, updateCordWhitelist );
    const query = { $addToSet: { "rescuers": { $each: body.rescuers } } };

    try {
      const data = await CordServiceInstance.update( id, query );

      return res.send( resUtil.sendSuccess( data ) );
    } catch ( err ) {
      return res.status( 500 ).send( resUtil.sendError( err ) );
    }

  } else {
    return res.status( 400 ).send( resUtil.sendError( "Request ID or Body was not provided" ) );
  }
}

// Todo: refactor this to use Cord Service
async function upload ( req, res ) {
  const _id = req.query.id || req.params.id || null;
  if ( _id ) {
    try {
      const col = await objectUtil.loadCollection( collectionName, db );
      const data = col.insert( req.file );

      db.saveDatabase();
      if ( data && data.filename ) {
        Cords.findByIdAndUpdate( _id, { "files": data.filename }, { new: true } )
          .then( response => {
            return res.send( response );
          } )
          .catch( err => {
            throw err;
          } );
      } else {
        return res.status( 500 ).send( resUtil.sendError( "Error uploading file, please try again" ) );
      }

    } catch ( err ) {
      return res.status( 400 ).send( resUtil.sendError( err ) );
    }
  } else {
    return res.status( 400 ).send( resUtil.sendError( "Invalid request: ID is required" ) );
  }
}

async function getFilesByCordId ( req, res ) {
  const id = req.query.id || req.params.id || null;

  if ( id ) {
    try {
      const projection = { files: 1 };

      const data = await CordServiceInstance.getFilesByCordId( id, projection );

      return res.send( resUtil.sendSuccess( data ) );
    } catch ( err ) {
      return res.status( 500 ).send( resUtil.sendError( err ) );
    }
  } else {
    return res.status( 400 ).send( resUtil.sendError( "Invalid request: ID is required" ) );
  }
}

// Todo: Refactor this to use CordService
async function getFile ( req, res ) {
  const fileName = req.query.id || req.params.id || null;
  const col = await objectUtil.loadCollection( collectionName, db );

  if ( fileName ) {
    try {
      const result = col.findOne( { "filename": fileName } );

      if ( !result ) {
        return res.sendStatus( 404 );
      }

      res.setHeader( "Content-Type", result.mimetype );
      fs.createReadStream( path.join( uploadPath, result.filename ) ).pipe( res );
    } catch ( err ) {
      return res.status( 400 ).send( resUtil.sendError( err ) );
    }
  } else {
    return res.status( 400 ).send( resUtil.sendError( "Invalid request: ID is required" ) );
  }
}

async function deleteCord ( req, res ) {
  const id = req.query.id || req.params.id || null;

  if ( id ) {
    try {
      const data = await CordServiceInstance.delete( id );
      return res.send( resUtil.sendSuccess( data ) );
    } catch ( err ) {
      return res.status( 500 ).send( resUtil.sendError( err ) );
    }

  } else {
    return res.status( 400 ).send( resUtil.sendError( "Request ID was not provided" ) );
  }
}
