const mongoose = require( "mongoose" );

const schema = mongoose.Schema( {
  
  notifyReceiver : {
    _id      : {
      type     : String,
      required : true
    },
    userName : {
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
  readTimeStamp  : {
    type : Date,
	default : null
  },
  createdTimeStamp  : {
    type : Date,
	default  : Date.now()
  },
  cord : {
    _id      : {
      type     : String,
      required : true
    }
  },
  createdBy : {
    _id      : {
      type     : String,
      required : true
    },
    userName : {
      type     : String,
      required : true
    }
  }  
   
} );

schema.index( { notifyReceiver : 1, readTimeStamp : 1 } );
schema.index( { notifyReceiver : 1 } );
schema.index( { readTimeStamp : 1 } );
schema.index( { status : 1 } );
module.exports = mongoose.model( "tool_notifications", schema );
