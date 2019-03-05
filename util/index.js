module.exports = {
  loadCollection,
  whitelist : pick
};

/**
 * @description Remove keys which are not present on the whitelist, and return the
 *   object with only the whitelisted keys
 * @param obj {object} Object to filter using the whitelist
 * @param keys {array} List of whitelisted keys
 * @returns {object} Return object with only the whitelisted keys
 */
function pick ( obj, keys ) {
  return keys.map( k => k in obj ? { [ k ] : obj[ k ] } : {} )
      .reduce( ( res, o ) => Object.assign( res, o ), {} );
}

/**
 * @description A generic function to retrieve a LokiJs collection if exists, or create a new one if it doesn't
 * @param colName
 * @param db
 */
function loadCollection(colName, db) {
  return new Promise(resolve => {
    db.loadDatabase({}, () => {
      const _collection = db.getCollection(colName) || db.addCollection(colName);
      return resolve(_collection);
    })
  })
}
