const logger     = require( "../../config/logger" );
const Cords      = require( "../../models/Cords" );
const qUtil      = require( "../../util/queryUtil" );
const resUtil    = require( "../../util/responseUtil" );
const objectUtil = require( "../../util" );

module.exports = ( io, socket ) => {
  socket.on( "REFRESH_GRID", function ( socket = {} ) {
    getCords( socket )
        .then( response => {
          io.emit( "SOCKET_REFRESH_GRID", response );
        } )
        .catch( err => {
          logger.error( `Error refreshing grid: ${err}` );
          io.emit( "SOCKET_REFRESH_ERROR", err );
        } );
  } );

  socket.on( "REFRESH_ITEM", function ( _id ) {
    Cords
        .findById( _id )
        .then( results => {
          io.emit( "SOCKET_REFRESH_ITEM", results );
          return getCords({})
        } )
        .then( gridItems => {
          io.emit( "SOCKET_REFRESH_GRID", gridItems );
        })
        .catch( err => {
          logger.error( `Error refreshing item: ${err}` );
          io.emit( "SOCKET_REFRESH_ERROR", err );
        } );
  } );

  socket.on( "REFRESH_DISCUSSION", function ( socket ) {
    logger.info( "Discussion Refresh called" );
  } );
};

function getCords ( query = {} ) {
  return new Promise( ( resolve, reject ) => {
    const queryStrings = qUtil.getDbQueryStrings( query || {} );

    Cords
        .find( queryStrings.query )
        .select( { __v : 0, description : 0 } )
        .sort( queryStrings.sort )
        .limit( queryStrings.limit )
        .exec( function ( err, results ) {
          if ( err ) {
            return reject( err );
          }
          return resolve( results );
        } );
  } );
}
