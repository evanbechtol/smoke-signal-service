const assert = require( "chai" ).assert;
const expect = require( "chai" ).expect;
const mocha = require( "mocha" );
const config = require( "../../config" );
const Cords = require( "../../models/Cords" );
const CordService = require( "../../services/CordService" );
const mongoose = require( "mongoose" );

before( ( done ) => {
  const mongooseOptions = {
    useCreateIndex: true,
    useNewUrlParser: true,
    autoReconnect: true
  };

  mongoose.Promise = global.Promise;
  mongoose.connect( "mongodb://localhost/smoke-signal-test", mongooseOptions )
    .then( () => {
      console.log( "DB Connection successful" );
      done();
    } )
    .catch( err => {
      console.error( "connection error", err );
    } );
} );

describe( "Cords Service", () => {
  const CordServiceInstance = new CordService( Cords );

  it( "Should have a cord model", () => {
    assert.exists( CordServiceInstance.getCordModel() );
  } );

  it( "Should have a mongoose service instance", () => {
    assert.exists( CordServiceInstance.getMongooseServiceInstance() );
  } );
} );
