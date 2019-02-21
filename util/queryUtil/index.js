const logger = require( "../../config/logger" );

function getDbQueryStrings ( queryString ) {
  let query     = queryString.query || {},
      searchStr = queryString.searchstr || null,
      sort      = queryString.sort || null,
      skip      = Number( queryString.skip ) || 0,
      limit     = Number( queryString.limit ) || 100;

  if ( searchStr ) {
    searchStr = searchStr.toLowerCase();
  }

  if ( query && typeof query === "string" ) {
      try {
        query = JSON.parse( query );
        console.log( query );
      } catch ( e ) {
        logger.error( { error: e, query } );
        console.log( query );
      }
  }

  return { query, searchStr, skip, limit, sort };
}

module.exports = { getDbQueryStrings };
