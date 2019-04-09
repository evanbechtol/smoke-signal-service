const mongoose = require( "mongoose" );

const schema = mongoose.Schema( {
  notifyReceiver: {
    _id: {
      type: String,
      required: true
    },
    username: {
      type: String,
      required: true
    }
  },
  subject: {
    type: String,
    required: true,
    index: true
  },
  cord: {
    _id: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true,
      index: true
    },
    status: {
      type: String,
      required: true,
      index: true,
      default: "Open"
    },
    app: {
      type: String,
      required: true,
      index: true
    }
  },
  readTimeStamp: {
    type: Date,
    default: null
  },
  createdTimeStamp: {
    type: Date,
    default: Date.now()
  },
  createdBy: {
    _id: {
      type: String,
      required: true
    },
    username: {
      type: String,
      required: true
    }
  }
});

schema.index( { notifyReceiver : 1, readTimeStamp: 1 } );
schema.index( { notifyReceiver : 1 } );
schema.index( { readTimeStamp : 1 } );
module.exports = mongoose.model( "tool_notifications", schema );
