/* eslint-disable */
const assert = require( "chai" ).assert;
const mocha = require( "mocha" );
const mongoose = require( "mongoose" );
const Cords = require( "../../models/Cords" );
const CordService = require( "../../services/CordService" );
const CordsWhitelists = require( "../../config/keysWhitelists/cords" );

// Connect to the database before running tests
before( ( done ) => {
  const mongooseOptions = {
    useCreateIndex: true,
    useNewUrlParser: true,
    autoReconnect: true
  };

  mongoose.Promise = global.Promise;
  mongoose.connect( "mongodb://localhost/smoke-signal-test", mongooseOptions )
    .then( () => {
      console.log( "DB Connection successful\n" );
      done();
    } )
    .catch( err => {
      console.error( "Connection error", err );
    } );
} );

// Performed after all tests are finished
after( ( done ) => {
  mongoose.connection.db.dropDatabase( ( err, result ) => {
    if ( err ) {
      console.error( "Unable to drop database", err );
    } else {
      console.log( "Database dropped", result );
    }

    mongoose.connection.close();
    done();
  } );
} );

// Test Cord Service functionality
mocha.describe( "Cords Service", () => {
  const CordServiceInstance = new CordService( Cords );
  let cordToRetrieve;

  it( "Should expose the cordModel via a method", () => {
    assert.isFunction( CordServiceInstance.getCordModel );
  } );

  it( "Model should be populated", () => {
    assert.exists( CordServiceInstance.getCordModel() );
  } );

  it( "Should expose the mongooseInstance via a method", () => {
    assert.isFunction( CordServiceInstance.getMongooseServiceInstance );
  } );

  it( "Mongoose instance should be populated", () => {
    assert.exists( CordServiceInstance.getMongooseServiceInstance() );
  } );

  it( "Should be able to create a record", async () => {
    const newCord = {
      app: "Knowledge Catalog",
      category: "Authentication",
      description: "Here is a test description from the DB",
      openedOn: "2019-02-19T20:57:00.009Z",
      puller: { "_id": 1, "username": "eevabec" },
      rescuers: [],
      status: "Open",
      title: "500 Status code on login"
    };

    const result = await CordServiceInstance.create( newCord );

    assert.exists( result );
    assert.containsAllKeys( result._doc, CordsWhitelists.get );

    cordToRetrieve = result;
  } );

  it( "Should be able to find documents with query", async () => {
    const query = { status: "Open" };
    const result = await CordServiceInstance.find( query );

    assert.exists( result );
    assert.lengthOf( result, 1 );
    assert.containsAllKeys( result[ 0 ], CordsWhitelists.get );
  } );

  it( "Should be able to find a document by ID", async () => {
    const result = await CordServiceInstance.findById( cordToRetrieve._id );

    assert.exists( result );
    assert.containsAllKeys( result, CordsWhitelists.get );
  } );

  it( "Should be able to delete document by ID", async () => {
    const result = await CordServiceInstance.delete( cordToRetrieve._id );

    assert.exists( result );
  } );
} );
