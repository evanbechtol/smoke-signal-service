const mongoose = require( "mongoose" );

const schema = mongoose.Schema( {
  _id         : {
    type : ObjectId
  },
  status      : {
    type     : String,
    required : true,
    index    : true
  },
  description : {
    type    : String,
    default : ""
  },
  app         : {
    type     : String,
    required : true,
    index    : true
  },
  openedOn    : {
    type    : Date,
    default : new Date()
  },
  resolvedOn  : {
    type : Date
  },
  category    : {
    type     : String,
    required : true,
    index    : true
  },
  rescuers    : {
    type    : Array,
    default : []
  },
  puller      : {
    type     : Object,
    required : true,
    index    : true
  }
} );

schema.index( { app : 1, category : 1 } );
schema.index( { app : 1, category : 1, status: 1 } );
schema.index( { category : 1, status: 1 } );

module.exports = mongoose.model( "Cords", schema );
