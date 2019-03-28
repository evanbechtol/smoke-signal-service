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
  files       : {
    type    : String,
    default : null
  },
  discussion  : [
    {
      time : {
        type     : Date,
        required : true,
        default  : Date.now()
      },
      user : {
        type     : Object,
        required : true
      },
      data : {
        type     : String,
        required : true
      },
      comments  : [
        {
          time : {
            type     : Date,
            required : true,
            default  : Date.now()
          },
          user : {
            type     : Object,
            required : true
          },
          data : {
            type     : String,
            required : true
          }
        }
      ]
    }
  ],
  app         : {
    type     : String,
    required : true,
    index    : true
  },
  openedOn    : {
    type     : Date,
    required : true
  },
  resolvedOn  : {
    type : Date
  },
  category    : {
    type     : String,
    required : true,
    index    : true
  },
  rescuers    : [
    {
      _id      : {
        type     : String,
        required : true
      },
      username : {
        type     : String,
        required : true
      }
    }
  ],
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
  title       : {
    type     : String,
    required : true,
    index    : true
  },
  likes       : {
    type    : Number,
    default : 0
  },
  tags        : {
    type    : Array,
    index   : true,
    default : []
  }
} );

schema.index( { app : 1, category : 1 } );
schema.index( { app : 1, category : 1, status : 1 } );
schema.index( { category : 1, status : 1 } );
schema.index( { puller : 1 } );
schema.index( { puller : 1, status : 1 } );

module.exports = mongoose.model( "Cords", schema );
