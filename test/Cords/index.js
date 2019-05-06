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
    it( "Exposes the cordModel via a method", () => {
      assert.isFunction( CordServiceInstance.getCordModel );
    } );

    it( "Model is populated", () => {
      assert.exists( CordServiceInstance.getCordModel() );
    } );

    it( "Exposes the mongooseInstance via a method", () => {
      assert.isFunction( CordServiceInstance.getMongooseServiceInstance );
    } );

    it( "Mongoose instance is populated", () => {
      assert.exists( CordServiceInstance.getMongooseServiceInstance() );
    } );
  } );

  mocha.describe( "Create a document", () => {
    context( "When proper body provided", () => {
      let createdDoc;

      it( "Creates a document and returns it", async () => {
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

      it( "Is an object", () => {
        assert.isObject( createdDoc );
      } );

      it( "Has all required keys", () => {
        assert.containsAllKeys( createdDoc._doc, CordsWhitelists.get );
        cordToRetrieve = createdDoc._doc;
      } );
    } );

    context( "When proper body not provided", () => {
      let error;

      it( "Throws an error", async () => {
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

      it( "Is an object", () => {
        assert.isObject( error );
      } );

      it( "Should have a name property", () => {
        assert.exists( error.name );
      } );

      it( "Name is 'ValidationError'", () => {
        assert.strictEqual( error.name, "ValidationError" );
      } );
    } );
  } );

  mocha.describe( "Find documents", () => {

    mocha.describe( "With Query", () => {

      context( "Find one or more documents", () => {
        let result;

        it( "Retrieves at least one document", async () => {
          const query = { status: "Open" };
          result = await CordServiceInstance.find( query );

          assert.exists( result );
        } );

        it( "Has length of at least 1", () => {
          assert.isAtLeast( result.length, 1 );
        } );

        it( "Is an object", () => {
          assert.isObject( result[ 0 ] );
        } );

        it( "Has all required keys", () => {
          assert.containsAllKeys( result[ 0 ], CordsWhitelists.get );
        } );
      } );

      context( "Find one document", () => {
        let result;

        it( "Retrieves a single document", async () => {
          const query = { status: "Open" };
          result = await CordServiceInstance.findOne( query );

          assert.exists( result );
        } );

        it( "Is an object", () => {
          assert.isObject( result );
        } );

        it( "Is identical to created document", () => {
          assert.deepEqual( result._id, cordToRetrieve._id );
        } );

        it( "Has all required keys", () => {
          assert.containsAllKeys( result, CordsWhitelists.get );
        } );
      } );
    } );

    mocha.describe( "With ID", () => {
      context( "When valid ID provided", () => {
        let result;

        it( "Retrieves a single document by ID", async () => {
          result = await CordServiceInstance.findById( cordToRetrieve._id );

          assert.exists( result );
        } );

        it( "Is an object", () => {
          assert.isObject( result );
        } );

        it( "Has all required keys", () => {
          assert.containsAllKeys( result, CordsWhitelists.get );
        } );
      } );

      context( "When invalid ID provided", () => {
        let error;

        it( "Throws an error", async () => {
          const _id = "";
          try {
            await CordServiceInstance.findById( _id );
          } catch ( e ) {
            error = e;
            assert.exists( error );
          }
        } );

        it( "Is an object", () => {
          assert.isObject( error );
        } );

        it( "Has a name property", () => {
          assert.property( error, "name" );
        } );

        it( "Name is 'CastError'", () => {
          assert.strictEqual( error.name, "CastError" );
        } );
      } );
    } );
  } );

  mocha.describe( "Update a document", () => {
    context( "When valid ID provided", () => {
      let result;
      const tags = [ "testing", "update2" ];

      it( "Should update a document", async () => {
        const updateData = { tags };
        result = await CordServiceInstance.update( cordToRetrieve._id, updateData );

        assert.exists( result );
      } );

      it( "Is an object", () => {
        assert.isObject( result );
      } );

      it( "Has all required keys", () => {
        assert.containsAllKeys( result, CordsWhitelists.get );
      } );

      it( "Tags property is an array", () => {
        assert.isArray( result.tags );
      } );

      it( "Contains tags that were inserted", () => {
        assert.deepEqual( result.tags, tags );
      } );
    } );

    context( "When invalid ID provided", () => {
      let error;
      const tags = [ "testing", "update2" ];

      it( "Throws an error", async () => {
        const updateData = { tags };

        try {
          await CordServiceInstance.update( "", updateData );
        } catch ( e ) {
          assert.exists( e );

          error = e;
        }
      } );

      it( "Is an object", () => {
        assert.strictEqual( typeof error, "object" );
      } );

      it( "Has a message property", () => {
        assert.exists( error.message );
      } );

      it( "Has message 'Invalid ID or body provided'", () => {
        assert.strictEqual( error.message, "Invalid ID or body provided" );
      } );
    } );
  } );

  mocha.describe( "User stats", () => {
    context( "When valid users provided", () => {
      let result;

      it( "Retrieves users stats", async () => {
        result = await CordServiceInstance.getUserStats( cordToRetrieve.puller );

        assert.exists( result );
      } );

      it( "Is an object", () => {
        assert.isObject( result );
      } );

      it( "Has all required keys", () => {
        const expectedKeys = [ "cordsPulled", "rescuesProvided", "mostActiveApp" ];
        assert.containsAllKeys( result, expectedKeys );
      } );
    } );

    context( "When invalid users provided", () => {
      let error;

      it( "Throws an error", async () => {
        try {
          const query = {};
          await CordServiceInstance.getUserStats( query );
        } catch ( e ) {
          assert.exists( e );
          error = e;
        }
      } );

      it( "Is an object", () => {
        assert.strictEqual( typeof error, "object" );
      } );

      it( "Has a message of 'Invalid User'", () => {
        assert.strictEqual( error.message, "Invalid User" );
      } );
    } );
  } );

  mocha.describe( "Distinct fields", () => {
    context( "When valid field provided", () => {
      let result;

      it( "Retrieves distinct fields", async () => {
        const query = { status: "Open" };
        result = await CordServiceInstance.findDistinct( query, "category" );

        assert.exists( result );
      } );

      it( "Is an array", () => {
        assert.isArray( result );
      } );

      it( "Has a length of at least 1", () => {
        assert.isAtLeast( result.length, 1 );
      } );
    } );

    context( "When invalid field provided", () => {
      let result;

      it( "Retrieves empty array", async () => {
        const query = { status: "Open" };
        result = await CordServiceInstance.findDistinct( query, "someBadField" );

        assert.exists( result );
      } );

      it( "Is an array", () => {
        assert.isArray( result );
      } );

      it( "Has a length of 0", () => {
        assert.lengthOf( result, 0 );
      } );
    } );
  } );

  mocha.describe( "Files", () => {
    mocha.describe( "Upload", () => {
      context( "When valid file object provided", () => {
        let result;

        it( "Uploads a file", async () => {
          const fakeFileData = { filename: "1a2b3c4d5e" };
          result = await CordServiceInstance.upload( cordToRetrieve._id, fakeFileData );

          assert.exists( result );

          // Update the cord we are holding onto
          cordToRetrieve = result;
        } );

        it( "Is an object", () => {
          assert.isObject( result );
        } );

        it( "Has a files property", () => {
          assert.exists( result.files );
        } );

        it( "Files property is a string", () => {
          assert.isString( result.files );
        } );

        it( "Files has a length of at least 1", () => {
          assert.isAtLeast( result.files.length, 1 );
        } );
      } );

      context( "When invalid file object provided", () => {
        let error;

        it( "Throws an error", async () => {
          const fakeFileData = "1a2b3c4d5e";
          try {
            await CordServiceInstance.upload( cordToRetrieve._id, fakeFileData );
          } catch ( e ) {
            assert.exists( e );
            error = e;
          }
        } );

        it( "Is an object", () => {
          assert.strictEqual( typeof error, "object" );
        } );

        it( "Has a name property", () => {
          assert.exists( error.name );
        } );

        it( "Name property has message 'Document needs to be an object'", () => {
          assert.strictEqual( error.message, "Document needs to be an object" );
        } );
      } );
    } );

    mocha.describe( "Retrieve", () => {
      context( "File by name", () => {
        let result;

        it( "Retrieves a file", async () => {
          result = await CordService.getFile( cordToRetrieve.files );

          assert.exists( result );
        } );

        it( "Is an object", () => {
          assert.isObject( result );
        } );

        it( "Has all required keys", () => {
          const expectedKeys = [ "filename", "meta", "$loki" ];
          assert.containsAllKeys( result, expectedKeys );
        } );
      } );

      context( "File by Cord ID", () => {
        let result;

        it( "Retrieves a file by Cord ID", async () => {
          result = await CordServiceInstance.getFilesByCordId( cordToRetrieve._id );

          assert.exists( result );
        } );

        it( "Is an object", () => {
          assert.isObject( result );
        } );

        it( "Has all required keys", () => {
          const expectedKeys = [ "filename", "meta", "$loki" ];
          assert.containsAllKeys( result, expectedKeys );
        } );
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
    context( "Retrieve", () => {
      let result;

      it( "Should retrieve Category list", async () => {
        result = await CordServiceInstance.getCategoryList( {} );

        assert.exists( result );
      } );

      it( "Is an array", () => {
        assert.isArray( result );
      } );

      it( "Has length of at least 1", () => {
        assert.isAtLeast( result.length, 1 );
      } );
    } );
  } );
} );
