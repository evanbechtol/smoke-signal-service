const mongoose = require( "mongoose" );

const schema = mongoose.Schema( {
  status      : {
    type     : String,
    required : true,
    index    : true,
    default  : "Open"
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
    required: true
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
  },
  title: {
    type: String,
    required: true,
    index: true
  }
} );

schema.index( { app : 1, category : 1 } );
schema.index( { app : 1, category : 1, status: 1 } );
schema.index( { category : 1, status: 1 } );

module.exports = mongoose.model( "Cords", schema );
