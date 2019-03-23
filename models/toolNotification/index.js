const mongoose = require( "mongoose" );

const schema = mongoose.Schema( {
  
  notify_receiver : {
    _id      : {
      type     : String,
      required : true
    },
    username : {
      type     : String,
      required : true
    }
  },
  puller      : {
    _id      : {
      type     : String,
      required : true
    },
    username : {
      type     : String,
      required : true
    }
  },
  subject      : {
    type     : String,
    required : true,
    index    : true
  },
  app         : {
    type     : String,
    required : true,
    index    : true
  },
  status      : {
    type     : String,
    required : true,
    index    : true,
    default  : "Open"
  },
  title       : {
    type     : String,
    required : true,
    index    : true
  },
  read_timestamp  : {
    type : Date,
	default : null
  },
  created_timestamp  : {
    type : Date,
	default  : Date.now()
  } 
   
} );

schema.index( { notify_receiver : 1, read_timestamp : 1 } );
module.exports = mongoose.model( "tool_notifications", schema );
