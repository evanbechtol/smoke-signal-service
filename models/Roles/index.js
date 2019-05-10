const mongoose = require( "mongoose" );

const schema = mongoose.Schema( {
  name: {
    type: String,
    required: true,
    index: true
  },

  permissions: {
    type: Array,
    default: []
  },

  createdOn: {
    type: Date,
    required: true
  },

  lastModifiedOn: {
    type: Date
  }
} );

module.exports = mongoose.model( "Cords", schema );
