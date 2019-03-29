const mongoose = require( "mongoose" );

const categoryListSchema = mongoose.Schema( {
  name      : {
    type     : String,
    default : ""
  }
}, {collection: 'category_list'});

module.exports = mongoose.model( "category_list", categoryListSchema );

