const express = require( "express" );
const Cords   = require( "../../models/Cords" );
const qUtil   = require( "../../controllers/queryUtil" );
const resUtil = require( "../../controllers/responseUtil" );

let router = express.Router();

router.get( "/", ( req, res ) => {
  const queryStrings = qUtil.getDbQueryStrings( req.query );

  Cords
      .find( {} )
      .sort( queryStrings.sort )
      .limit( queryStrings.limit )
      .exec( function ( err, results ) {
        if ( err ) {
          return res.status( 500 ).send( resUtil.sendError( err ) );
        }

        return res.send( resUtil.sendSuccess( results ) );
      } );
} );

router.get( "/:id", ( req, res ) => {
  const id = req.query.id || req.params.id || null;
  Cords
      .findOne( { _id: id } )
      .exec( function ( err, results ) {
        if ( err ) {
          return res.status( 500 ).send( resUtil.sendError( err ) );
        }

        return res.send( resUtil.sendSuccess( results ) );
      } );
} );

module.exports = router;
