const express = require( "express" );
const Cords   = require( "../../models/Cords" );
const qUtil   = require( "../../controllers/queryUtil" );

let router = express.Router();

router.get( "/", ( req, res ) => {
  const queryStrings = qUtil.getDbQueryStrings( req.query );

  Cords
      .find({})
      .sort(queryStrings.sort)
      .limit(queryStrings.limit)
      .exec(function(err, results) {
        if (err) {
          return res.status(500).send(err);
        }

        return res.send(results);
      });
} );

module.exports = router;
