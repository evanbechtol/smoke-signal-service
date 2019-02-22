const Cords             = require( "../../models/Cords" );
const qUtil             = require( "../../util/queryUtil" );
const resUtil           = require( "../../util/responseUtil" );
const objectUtil        = require( "../../util" );
const cordsKeyWhitelist = [
  "status",
  "description",
  "app",
  "category",
  "puller",
  "rescuers",
  "openedOn",
  "title"
];

module.exports = { getCords, getCordById, getCordByStatus, createCord, updateCord, updateRescuers, deleteCord };

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
      .exec( function ( err, results ) {
        if ( err ) {
          return res.status( 500 ).send( resUtil.sendError( err ) );
        }

        return res.send( resUtil.sendSuccess( results ) );
      } );
}

function createCord ( req, res ) {
  if ( req.body ) {
    const body = objectUtil.whitelist( req.body, cordsKeyWhitelist );

    Cords
        .create( body, function ( err, results ) {
          if ( err ) {
            return res.status( 500 ).send( resUtil.sendError( err ) );
          }

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
    "app",
    "category",
    "rescuers",
    "title"
  ];
  if ( _id && req.body ) {
    const body = objectUtil.whitelist( req.body, updateCordWhitelist );
    Cords
        .findByIdAndUpdate( _id, body, { new: true } )
        .exec( function ( err, results ) {
          if ( err ) {
            return res.status( 500 ).send( resUtil.sendError( err ) );
          }

          return res.send( resUtil.sendSuccess( results ) );
        } );
  } else {
    return res.status( 400 ).send( resUtil.sendError( "Request ID or Body was not provided" ) );
  }
}

function updateRescuers ( req, res ) {
  const _id                 = req.query.id || req.params.id || null;
  const updateCordWhitelist = [ "rescuers" ];
  if ( _id && req.body ) {
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
