const Cords                 = require( "../../models/Cords" );
const CategoryList          = require( "../../models/CategoryList/index.js" );
const qUtil                 = require( "../../util/queryUtil" );
const resUtil               = require( "../../util/responseUtil" );
const objectUtil            = require( "../../util" );
const logger                = require( "../../config/logger" );
const path                  = require( "path" );
const fs                    = require( "fs" );
const loki                  = require( "lokijs" );
const dbName                = "db.json";
const collectionName        = "files";
const uploadPath            = "uploads";
const db                    = new loki( `${uploadPath}/${dbName}`, { persistenceMethod : "fs" } );
const config                = require( "../../config" );
const slack                 = ( config.slackWebhookUrl !== undefined ) ? require( "slack-notify" )( `${config.slackWebhookUrl}` ) : false;
const slackNotificationUtil = require( "../../util/slackUtil" );

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

function getCords ( req, res ) {
  const queryStrings = qUtil.getDbQueryStrings( req.query );

  Cords
      .find( queryStrings.query )
      .select( { __v : 0, description : 0 } )
      .sort( queryStrings.sort )
      .limit( queryStrings.limit )
      .exec( function ( err, results ) {
        if ( err ) {
          return res.status( 500 ).send( resUtil.sendError( err ) );
        }

        return res.send( resUtil.sendSuccess( results ) );
      } );
}

function getCategoryList ( req, res ) {
  CategoryList
      .find( {} )
      .then( results => {
        if ( !results.length ) {
          results = [
            { name : "Bug" },
            { name : "Troubleshooting" },
            { name : "Deployment" },
            { name : "Others" }
          ];
        }
        return res.send( resUtil.sendSuccess( results ) );
      } )
      .catch( err => {
        return res.status( 500 ).send( resUtil.sendError( err ) );
      } );
}

function getCordById ( req, res ) {
  const _id = req.query.id || req.params.id || null;
  Cords
      .findById( _id )
      .then( results => {
        return res.send( resUtil.sendSuccess( results ) );
      } )
      .catch( err => {
        return res.status( 500 ).send( resUtil.sendError( err ) );
      } );
}

function getCordByStatus ( req, res ) {
  const status = req.query.status || req.params.status || null;
  Cords
      .find( { status } )
      .sort( { openedOn : -1 } )
      .exec( function ( err, results ) {
        if ( err ) {
          return res.status( 500 ).send( resUtil.sendError( err ) );
        }

        return res.send( resUtil.sendSuccess( results ) );
      } );
}

function getCordForUser ( req, res ) {
  let user   = req.query.user || req.params.user || null;
  let status = req.query.status || req.params.status || "Open";

  try {
    user = JSON.parse( user );
  } catch ( e ) {
    logger.error( `Error parsing user object: ${user}` );
    return res.status( 500 ).send( resUtil.sendError( "Invalid JSON object provided" ) );
  }

  Cords
      .find( { puller : user, status }, { __v : 0 } )
      .sort( { openedOn : -1 } )
      .exec( function ( err, results ) {
        if ( err ) {
          return res.status( 500 ).send( resUtil.sendError( err ) );
        }

        return res.send( resUtil.sendSuccess( results ) );
      } );
}

function getUserStats ( req, res ) {
  let user = req.query.user || req.params.user || null;

  try {
    user = JSON.parse( user );
  } catch ( e ) {
    logger.error( `Error parsing user object: ${user}` );
    return res.status( 500 ).send( resUtil.sendError( "Invalid JSON object provided" ) );
  }
  let stats = {};

  Cords
      .count( { puller : user } )
      .then( cordCount => {
        stats.cordsPulled = cordCount;
        return Cords.count( { rescuers : user } );
      } )
      .then( rescuedCount => {
        stats.rescuesProvided = rescuedCount;
        return Cords.aggregate( [
          { $match : { puller : user } },
          { $group : { _id : "$app", count : { $sum : 1 } } },
          { $sort : { count : -1 } },
          { $limit : 1 }
        ] );
      } )
      .then( appArray => {
        stats.mostActiveApp = appArray[ 0 ];
        return res.send( resUtil.sendSuccess( stats ) );
      } )
      .catch( err => {
        return res.status( 500 ).send( resUtil.sendError( err ) );
      } );
}

// Todo: create callback to send notification when cord created
function createCord ( req, res ) {
  if ( req.body ) {
    const body = objectUtil.whitelist( req.body, cordsKeyWhitelist );

    Cords
        .create( body, function ( err, results ) {
          if ( err ) {
            return res.status( 500 ).send( resUtil.sendError( err ) );
          }
          sendSlackNotifications( req, true );
          return res.send( resUtil.sendSuccess( results ) );
        } );
  } else {
    return res.status( 400 ).send( resUtil.sendError( "Request body not provided" ) );
  }
}

function updateCord ( req, res ) {
  const _id                 = req.query.id || req.params.id || null;
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
  if ( _id && req.body ) {
    const body = objectUtil.whitelist( req.body, updateCordWhitelist );
    Cords
        .findByIdAndUpdate( _id, body, { new : true } )
        .exec( function ( err, results ) {
          if ( err ) {
            return res.status( 500 ).send( resUtil.sendError( err ) );
          }
          sendSlackNotifications( req, false );
          return res.send( resUtil.sendSuccess( results ) );
        } );
  } else {
    return res.status( 400 ).send( resUtil.sendError( "Request ID or Body was not provided" ) );
  }
}

function updateRescuers ( req, res ) {
  const _id                 = req.query.id || req.params.id || null;
  const updateCordWhitelist = [ "rescuers" ];
  if ( _id && req.body && req.body.rescuers ) {
    const body = objectUtil.whitelist( req.body, updateCordWhitelist );
    Cords
        .findByIdAndUpdate( _id, { $addToSet : { "rescuers" : { $each : body.rescuers } } }, { new : true } )
        .then( results => {
          if ( !results ) {
            return res.status( 404 ).send( resUtil.sendError( "Document not found matching provided ID" ) );
          }
          return res.send( resUtil.sendSuccess( results ) );
        } )
        .catch( err => {
          return res.status( 500 ).send( resUtil.sendError( err ) );
        } );
  } else {
    return res.status( 400 ).send( resUtil.sendError( "Request ID or Body was not provided" ) );
  }
}

async function upload ( req, res ) {
  const _id = req.query.id || req.params.id || null;
  if ( _id ) {
    try {
      const col  = await objectUtil.loadCollection( collectionName, db );
      const data = col.insert( req.file );

      db.saveDatabase();
      if ( data && data.filename ) {
        Cords.findByIdAndUpdate( _id, { "files" : data.filename }, { new : true } )
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
  const _id = req.query.id || req.params.id || null;
  const col = await objectUtil.loadCollection( collectionName, db );

  if ( _id ) {
    try {
      Cords.findById( _id, { files : 1 } )
          .then( response => {
            return response.files;
          } )
          .then( files => {
            const result = col.findOne( { "filename" : files } );

            if ( !result ) {
              return res.sendStatus( 404 );
            }

            return res.send( resUtil.sendSuccess( result ) );
          } )
          .catch( err => {
            throw err;
          } );
    } catch ( err ) {
      return res.status( 400 ).send( resUtil.sendError( err ) );
    }
  } else {
    return res.status( 400 ).send( resUtil.sendError( "Invalid request: ID is required" ) );
  }
}

async function getFile ( req, res ) {
  const fileName = req.query.id || req.params.id || null;
  const col      = await objectUtil.loadCollection( collectionName, db );

  if ( fileName ) {
    try {
      const result = col.findOne( { "filename" : fileName } );

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

function deleteCord ( req, res ) {
  const _id = req.query.id || req.params.id || null;

  if ( _id ) {
    Cords
        .findByIdAndDelete( _id )
        .exec( function ( err, results ) {
          if ( err ) {
            return res.status( 500 ).send( resUtil.sendError( err ) );
          }

          return res.send( resUtil.sendSuccess( results ) );
        } );
  } else {
    return res.status( 400 ).send( resUtil.sendError( "Request ID was not provided" ) );
  }
}

/* send slack notifications on cord creation and modification */
function sendSlackNotifications ( req, create ) {
  if ( !slack ) {
    logger.error( "The parameter slackWebhookUrl is not defined, unable to send slack notification" );
    return false;
  }
  try {
    let body, data;

    data = {
      "action"      : create, "title" : req.body.title, "username" : req.body.puller.username, "app" : req.body.app,
      "description" : req.body.description, "category" : req.body.category, "url" : req.header( "Referer" )
    };

    body = slackNotificationUtil.getTemplate( data );

    slack.send( {
      channel      : `${config.slackChannel}`,
      icon_emoji     : `${config.iconEmoji}`,
      // text         : body,
      attachments: body.attachments,
      unfurl_links : 1,
      username     : `${config.slackUsername}`
    } );

    slack.onError = function ( err ) {
      logger.error( `Error sending slack notification: ${err}` );
    };

  } catch ( err ) {
    logger.error( `Error sending slack notification: ${err}` );
  }
}
