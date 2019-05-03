class LokiService {
  /**
   * @description A generic function to retrieve a LokiJs collection if exists,
   *   or create a new one if it doesn't
   * @param colName
   * @param db
   */
  static loadCollection ( colName, db ) {
    return new Promise( resolve => {
      db.loadDatabase( {}, () => {
        const _collection = db.getCollection( colName ) || db.addCollection( colName );
        return resolve( _collection );
      } );
    } );
  }
}

module.exports = LokiService;
