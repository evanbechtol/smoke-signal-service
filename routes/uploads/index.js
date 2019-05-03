const express = require( "express" );
const auth = require( "../../middlewares/eAuth" );
const cordController = require( "../../controllers/Cords" );
const token = require( "../../middlewares/token" );

let router = express.Router();

/**
 * @method GET
 * @description Retrieve cords (paginated by default to 10 items per page)
 * @param limit {number} Optionally pass in to adjust page size
 * @param skip {number} Optionally pass in to control item offset for page
 * @param query {string} Optionally pass in to control the query performed
 * by MongoDB
 * @returns Status code 200 and data if query successful. 500 if an error occurs
 */
router.get( "/:id",
  token.validateToken,
  auth.validateApp,
  cordController.getFile
);

module.exports = router;
