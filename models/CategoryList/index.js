const mongoose = require( "mongoose" );

const categoryListSchema = mongoose.Schema( {
  name      : {
    type     : String,
    default : ""
  },
  description : {
    type    : String,
    default : ""
  },
  is_active    : {
    type     : Boolean,
    default : true
  },
}, {collection: 'category_list'});

module.exports = mongoose.model( "category_list", categoryListSchema );

