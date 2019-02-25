const logger     = require( "../../config/logger" );
const Cords      = require( "../../models/Cords" );
const qUtil      = require( "../../util/queryUtil" );
const resUtil    = require( "../../util/responseUtil" );
const objectUtil = require( "../../util" );

module.exports = ( io, socket ) => {
  socket.on( "REFRESH_GRID", function ( socket ) {
    const queryStrings = qUtil.getDbQueryStrings( socket.query || {} );

    Cords
        .find( queryStrings.query )
        .select( { __v : 0, description : 0 } )
        .sort( queryStrings.sort )
        .limit( queryStrings.limit )
        .exec( function ( err, results ) {
          io.emit( "SOCKET_REFRESH_GRID", results );
        } );
  } );

  socket.on( "REFRESH_ITEM", function ( socket ) {
    const _id = socket._id || null;
    Cords
        .findById( _id )
        .then( results => {
          io.emit( "SOCKET_REFRESH_ITEM", results );
        } )
        .catch( err => {
          logger.error( `Error refreshing item: ${err}`);
        } );
  } );

  socket.on( "REFRESH_DISCUSSION", function ( socket ) {
    logger.info( "Discussion Refresh called" );
  } );
};
