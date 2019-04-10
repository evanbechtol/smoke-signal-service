const ToolNotification = require( "../../models/ToolNotification" );
const qUtil            = require( "../../util/queryUtil" );
const resUtil          = require( "../../util/responseUtil" );
const logger           = require( "../../config/logger" );

module.exports = {
  getToolNotificationUnreadList,
  updateNotification,
  createNotification,
  userDiscussion
};

function getToolNotificationUnreadList ( req, res ) {
  const queryStrings = qUtil.getDbQueryStrings( req.query );

  //to get list of unread notification
  ToolNotification
      .find( queryStrings.query )
      .sort( { created_timestamp : "desc" } )
      .limit( queryStrings.limit )
      .exec( function ( err, results ) {
        if ( err ) {
          logger.error( err );
          return res.status( 500 ).send( resUtil.sendError( err ) );
        }
        return res.send( resUtil.sendSuccess( results ) );
      } );
}

function updateNotification ( req, res ) {
  const _id = req.query.id || req.params.id || null;
  if ( _id ) {
    const updatedData = { $set : { readTimeStamp : new Date() } };
    ToolNotification.findByIdAndUpdate( _id, updatedData, function ( err ) {
      if ( err ) {
        logger.error( err );
        return res.status( 500 ).send( resUtil.sendError( err ) );
      }
      req.query = req.body;
      getToolNotificationUnreadList( req, res );
    } );
  }
}

async function createNotification ( result, resp ) {
  return resp.forEach( function ( data ) {
    const inputData = {
      notifyReceiver   : data.user,
      readTimeStamp    : null,
      createdTimeStamp : new Date().toISOString(),
      cord             : {
        _id    : result._id,
        status : result.status,
        app    : result.app,
        title  : result.title
      },
      subject          : result.subject,
      createdBy        : result.puller
    };
    ToolNotification.create( inputData, function ( err, results ) {
      if ( err ) {
        logger.error( err );
        return err;
      }
      return results;
    } );
  } );
}

async function userDiscussion ( data ) {
  let lookup    = {};
  let result    = [];
  const dataObj = data.discussion;
  if ( data.status === "Open" ) {
    if ( dataObj.length > 0 ) {
      let creator = dataObj[ dataObj.length - 1 ].user;
      dataObj.forEach( function ( item ) {
        let id = item.user._id;
        if ( !( id in lookup ) && id !== dataObj[ dataObj.length - 1 ].user._id ) {
          lookup[ id ] = 1;
          result.push( {
            user : { _id : item.user._id, username : item.user.username }
          } );
        }
      } );

      if ( !( data.puller._id in lookup ) ) {
        if ( data.puller._id !== dataObj[ dataObj.length - 1 ].user._id ) {
          result.push( {
            user : { _id : data.puller._id, username : data.puller.username }
          } );
        }
      }

      if ( result.length > 0 ) {
        data.puller  = { _id : creator._id, username : creator.username };
        data.subject = "Responded to cord";
        return createNotification( data, result );
      }
    }
  } else {
    dataObj.forEach( function ( item ) {
      let id = item.user._id;
      if ( !( id in lookup ) && id !== data.puller._id ) {
        lookup[ id ] = 1;
        result.push( {
          user : { _id : item.user._id, username : item.user.username }
        } );
      }
    } );
    if ( result.length > 0 ) {
      data.subject = "Cord has been resolved";
      return createNotification( data, result );
    }
  }
}
