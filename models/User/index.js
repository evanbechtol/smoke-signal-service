const mongoose = require( "mongoose" );

const schema = mongoose.Schema( {

  user: {
    _id: {
      type: String,
      index: true,
      required: true
    },
    username: {
      type: String,
      required: true
    }
  },

  teams: [
    {
      _id: { type: String },
      name: { type: String }
    }
  ],

  firstName: {
    type: String,
    required: true
  },

  lastName: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    index: true,
    unique: true
  },

  apps: {
    type: Array
  }

} );


module.exports = mongoose.model( "Users", schema );
