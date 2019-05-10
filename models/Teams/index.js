const mongoose = require( "mongoose" );

const schema = mongoose.Schema( {
  name: {
    type: String,
    required: true,
    index: true
  },

  members: [
    {
      user: {
        type: Object
      }
    }
  ],

  createdOn: {
    type: Date,
    required: true
  },

  lastModifiedOn: {
    type: Date
  }
} );

module.exports = mongoose.model( "Teams", schema );
