/* eslint-disable */
const assert = require( "chai" ).assert;
const mocha = require( "mocha" );
const mongoose = require( "mongoose" );
const Cords = require( "../../models/Cords" );
const CordService = require( "../../services/CordService" );
const CordsWhitelists = require( "../../config/keysWhitelists/cords" );

let cordToRetrieve;

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

  mocha.describe( "Create instance of service", () => {
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
  } );

  mocha.describe( "Create a document", () => {
    context( "When proper body provided", () => {
      let createdDoc;

      it( "Should create a document and return it", async () => {
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

        createdDoc = await CordServiceInstance.create( newCord );

        assert.exists( createdDoc );
        cordToRetrieve = createdDoc._doc;
      } );

      it( "Should be an object", () => {
        assert.isObject( createdDoc );
      } );

      it( "Should have all required keys", () => {
        assert.containsAllKeys( createdDoc._doc, CordsWhitelists.get );
        cordToRetrieve = createdDoc._doc;
      } );
    } );

    context( "When proper body not provided", () => {
      let error;

      it( "Should throw an error", async () => {
        const newCord = {
          description: "Here is a test description from the DB",
          openedOn: "2019-02-19T20:57:00.009Z",
          rescuers: [],
          status: "Open"
        };
        try {
          await CordServiceInstance.create( newCord );
        } catch ( e ) {
          assert.exists( e );
          error = e;
        }
      } );

      it( "Should be an object", () => {
        assert.isObject( error );
      } );

      it( "Should be a ValidationError", () => {
        assert.strictEqual( error.name, "ValidationError" );
      } );
    } );
  } );

  mocha.describe( "Find documents", () => {

    mocha.describe( "With Query", () => {

      context( "Find one or more documents", () => {
        let result;

        it( "Should return at least one document", async () => {
          const query = { status: "Open" };
          result = await CordServiceInstance.find( query );

          assert.exists( result );
        } );

        it( "Should have length of at least 1", () => {
          assert.isAtLeast( result.length, 1 );
        } );

        it( "Should be an object", () => {
          assert.isObject( result[ 0 ] );
        } );

        it( "Should contain all required keys", () => {
          assert.containsAllKeys( result[ 0 ], CordsWhitelists.get );
        } );
      } );

      context( "Find one document", () => {
        let result;

        it( "Should return a single document", async () => {
          const query = { status: "Open" };
          result = await CordServiceInstance.findOne( query );

          assert.exists( result );


        } );

        it( "Should be an object", () => {
          assert.isObject( result );
        } );

        it( "Should be identical to created document", () => {
          assert.deepEqual( result._id, cordToRetrieve._id );
        } );

        it( "Should contain all required keys", () => {
          assert.containsAllKeys( result, CordsWhitelists.get );
        } );
      } );
    } );

    mocha.describe( "With ID", () => {
      context( "When valid ID provided", () => {
        let result;

        it( "Should find a single document by ID", async () => {
          result = await CordServiceInstance.findById( cordToRetrieve._id );

          assert.exists( result );
        } );

        it( "Should be an object", () => {
          assert.isObject( result );
        } );

        it( "Should contain all required keys", () => {
          assert.containsAllKeys( result, CordsWhitelists.get );
        } );
      } );

      context( "When invalid ID provided", () => {
        let error;

        it( "Should throw an error", async () => {
          const _id = "";
          try {
            await CordServiceInstance.findById( _id );
          } catch ( e ) {
            error = e;
            assert.exists( error );
          }
        } );

        it( "Should be an object", () => {
          assert.isObject( error );
        } );

        it( "Should have a name property", () => {
          assert.property( error, "name" );
        } );

        it( "Should be a CastError", () => {
          assert.strictEqual( error.name, "CastError" );
        } );
      } );
    } );
  } );

  mocha.describe( "Update a document", () => {
    context( "When valid ID provided", () => {
      it( "Should update a document", async () => {
        const tags = [ "testing", "update2" ];
        const updateData = { tags };
        const result = await CordServiceInstance.update( cordToRetrieve._id, updateData );

        assert.exists( result );
        assert.isObject( result );
        assert.isArray( result.tags );
        assert.deepEqual( result.tags, tags );
      } );
    } );

    context( "When invalid ID provided", () => {
      it( "Should throw an error", async () => {
        const tags = [ "testing", "update2" ];
        const updateData = { tags };
        try {
          await CordServiceInstance.update( "", updateData );
        } catch ( e ) {
          assert.exists( e );
          assert.strictEqual( e.message, "Invalid ID or body provided" );
        }
      } );
    } );
  } );

  mocha.describe( "User stats", () => {
    context( "When valid user provided", () => {
      it( "Should get user stats", async () => {
        const expectedKeys = [ "cordsPulled", "rescuesProvided", "mostActiveApp" ];
        const result = await CordServiceInstance.getUserStats( cordToRetrieve.puller );

        assert.exists( result );
        assert.isObject( result );
        assert.containsAllKeys( result, expectedKeys );
      } );
    } );

    context( "When invalid user provided", () => {
      it( "Should throw an error", async () => {
        try {
          const query = {};
          await CordServiceInstance.getUserStats( query );
        } catch ( e ) {
          assert.exists( e );
          assert.strictEqual( e.message, "Invalid User" );
        }
      } );
    } );
  } );

  mocha.describe( "Distinct fields", () => {
    context( "When valid field provided", () => {
      it( "Should retrieve distinct fields", async () => {
        const query = { status: "Open" };
        const result = await CordServiceInstance.findDistinct( query, "category" );

        assert.exists( result );
        assert.isArray( result );
        assert.isAtLeast( result.length, 1 );
      } );
    } );

    context( "When invalid field provided", () => {
      it( "Should be empty", async () => {
        const query = { status: "Open" };
        const result = await CordServiceInstance.findDistinct( query, "someBadField" );

        assert.exists( result );
        assert.isArray( result );
        assert.lengthOf( result, 0 );
      } );
    } );
  } );

  mocha.describe( "Files", () => {
    mocha.describe( "Upload", () => {
      context( "When valid file object provided", () => {
        it( "Should upload a file", async () => {
          const fakeFileData = { filename: "1a2b3c4d5e" };
          const result = await CordServiceInstance.upload( cordToRetrieve._id, fakeFileData );

          assert.exists( result );
          assert.isObject( result );
          assert.exists( result.files );
          assert.isAtLeast( result.files.length, 1 );

          // Update the cord we are holding onto
          cordToRetrieve = result;
        } );
      } );

      context( "When invalid file object provided", () => {
        it( "Should throw an error", async () => {
          const fakeFileData = "1a2b3c4d5e";
          try {
            await CordServiceInstance.upload( cordToRetrieve._id, fakeFileData );
          } catch ( e ) {
            assert.exists( e );
            assert.strictEqual( e.message, "Document needs to be an object" );
          }
        } );
      } );
    } );

    mocha.describe( "Retrieve", () => {
      it( "Should get a file", async () => {
        const expectedKeys = [ "filename", "meta", "$loki" ];
        const result = await CordService.getFile( cordToRetrieve.files );

        assert.exists( result );
        assert.isObject( result );
        assert.containsAllKeys( result, expectedKeys );
      } );

      it( "Should get a file by Cord ID", async () => {
        const expectedKeys = [ "filename", "meta", "$loki" ];
        const result = await CordServiceInstance.getFilesByCordId( cordToRetrieve._id );

        assert.exists( result );
        assert.isObject( result );
        assert.containsAllKeys( result, expectedKeys );
      } );
    } );
  } );

  mocha.describe( "Delete a document", () => {
    it( "Should delete document by ID", async () => {
      const result = await CordServiceInstance.delete( cordToRetrieve._id );

      assert.exists( result );
      assert.isObject( result );
    } );
  } );

  mocha.describe( "Category list", () => {
    it( "Should retrieve Category list", async () => {
      const result = await CordServiceInstance.getCategoryList( {} );

      assert.exists( result );
      assert.isArray( result );
      assert.isAtLeast( result.length, 1 );
    } );
  } );
} );
