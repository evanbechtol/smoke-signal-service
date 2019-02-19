function getDbQueryStrings ( queryString ) {
  let query     = {},
      searchStr = queryString.searchstr || null,
      sort      = queryString.sort || null,
      skip      = Number( queryString.skip ) || 0,
      limit     = Number( queryString.limit ) || 10;

  if ( searchStr ) {
    searchStr = searchStr.toLowerCase();
  }

  return { searchStr, skip, limit, sort };
}

module.exports = { getDbQueryStrings };
