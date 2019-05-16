class ObjectService {
  /**
   * @description Remove keys which are not present on the whitelist, and
   *   return the object with only the whitelisted keys
   * @param obj {object} Object to filter using the whitelist
   * @param keys {array} List of whitelisted keys
   * @returns {object} Return object with only the whitelisted keys
   */
  static pick ( obj, keys ) {
    return keys
      .map( k => k in obj ? { [ k ]: obj[ k ] } : {} )
      .reduce( ( res, o ) => Object.assign( res, o ), {} );
  }

  /**
   * @description Validate that the provided object contains all of the
   * required keys
   * @param obj {object} Object to check for required keys
   * @param keys {array} List of required keys
   * @returns {boolean} Returns true if all required keys are present, false
   * otherwise
   */
  static hasAllRequiredKeys ( obj, keys ) {
    return keys.every( key => Object.keys( obj ).includes( key ) );
  }
}

module.exports = ObjectService;
