const express    = require( "express" );
const Cords      = require( "../../models/Cords" );
const qUtil      = require( "../../controllers/queryUtil" );
const resUtil    = require( "../../controllers/responseUtil" );
const objectUtil = require( "../../controllers" );

const cordsKeyWhitelist = [
  "status",
  "description",
  "app",
  "category",
  "puller",
  "rescuers",
  "title"
];

let router = express.Router();

/**
 * @method GET
 * @description Retrieve cords (paginated by default to 10 items per page)
 * @param limit {number} Optionally pass in to adjust page size
 * @param skip {number} Optionally pass in to control item offset for page
 * @param query {string} Optionally pass in to control the query performed by MonogDB
 * @returns Status code 200 and data if query successful. 500 if an error occurs
 */
router.get( "/", ( req, res ) => {
  const queryStrings = qUtil.getDbQueryStrings( req.query );

  Cords
      .find( queryStrings.query )
      .sort( queryStrings.sort )
      .limit( queryStrings.limit )
      .exec( function ( err, results ) {
        if ( err ) {
          return res.status( 500 ).send( resUtil.sendError( err ) );
        }

        return res.send( resUtil.sendSuccess( results ) );
      } );
} );

/**
 * @method POST
 * @description Create a cord, provided that all required keys are provided
 * @param body {object} Object used to create the document
 * @returns Status code 200 if successful with created document, 500 if error occurs
 */
router.post( "/", ( req, res ) => {
  if ( req.body ) {
    const body = objectUtil.whitelist( req.body, cordsKeyWhitelist );

    Cords
        .create( body, function ( err, results ) {
            if ( err ) {
              return res.status( 500 ).send( resUtil.sendError( err ) );
            }

            return res.send( resUtil.sendSuccess( results ) );
        } );
  } else {
    return res.status( 400 ).send( resUtil.sendError( "Request body not provided" ) );
  }
} );

/**
 * @method GET
 * @description Retrieve a cord by the provided object id
 * @param id {string} Object ID of the Cord to retrieve
 * @returns Status code 200 if successful with retrieved document, 500 if error occurs
 */
router.get( "/:id", ( req, res ) => {
  const _id = req.query.id || req.params.id || null;
  Cords
      .findById( _id )
      .exec( function ( err, results ) {
        if ( err ) {
          return res.status( 500 ).send( resUtil.sendError( err ) );
        }

        return res.send( resUtil.sendSuccess( results ) );
      } );
} );

/**
 * @method PUT
 * @description Update a cord, provided that all required keys are provided
 * @param id {string} Object ID of document to update
 * @returns Status code 200 if successful with updated document, 500 if error occurs
 */
router.put( "/:id", ( req, res ) => {
  const _id = req.query.id || req.params.id || null;

  if ( _id && req.body ) {
    const body = objectUtil.whitelist( req.body, cordsKeyWhitelist );

    Cords
        .findOneAndUpdate( { _id }, body )
        .exec( function ( err, results ) {
          if ( err ) {
            return res.status( 500 ).send( resUtil.sendError( err ) );
          }

          return res.send( resUtil.sendSuccess( results ) );
        } );
  } else {
    return res.status( 400 ).send( resUtil.sendError( "Request ID or Body was not provided" ) );
  }
} );


/**
 * @method DELETE
 * @description Delete a cord, provided that the ID provided matches a document
 * @param id {string} Object ID of document to delete
 * @returns Status code 200 if successful with created document, 500 if error occurs
 */
router.delete( "/:id", ( req, res ) => {
  const _id = req.query.id || req.params.id || null;

  if ( _id ) {
    Cords
        .findByIdAndDelete( _id )
        .exec( function ( err, results ) {
          if ( err ) {
            return res.status( 500 ).send( resUtil.sendError( err ) );
          }

          return res.send( resUtil.sendSuccess( results ) );
        } );
  } else {
    return res.status( 400 ).send( resUtil.sendError( "Request ID was not provided" ) );
  }
} );

/**
 * @method GET
 * @description Retrieve documents matching the status provided
 * @param status {string} Status of the documents to retrieve
 * @returns Status code 200 if successful with retrieved documents, 500 if error occurs
 */
router.get( "/status/:status", ( req, res ) => {
  const status = req.query.status || req.params.status || null;
  Cords
      .find( { status } )
      .exec( function ( err, results ) {
        if ( err ) {
          return res.status( 500 ).send( resUtil.sendError( err ) );
        }

        return res.send( resUtil.sendSuccess( results ) );
      } );
} );

module.exports = router;
