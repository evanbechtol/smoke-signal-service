const express        = require( "express" );
const auth = require( "../../middlewares/eAuth" );
const appsController = require( "../../controllers/Apps" );

let router = express.Router();


/**
 * @method GET
 * @description Retrieve Apps
 * @param query {string} Optionally pass in to control the query performed by
 *   MongoDB
 * @returns Status code 200 and data if query successful. 500 if an error
 *   occurs
 */
router.get( "/", auth.validateApp, appsController.getApps );

module.exports = router;
