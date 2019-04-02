const express        = require( "express" );
const auth           = require( "../../controllers/E-Auth" );
const appsController = require( "../../controllers/apps" );

let router = express.Router();


/**
 * @method GET
 * @description Retrieve apps
 * @param query {string} Optionally pass in to control the query performed by MonogDB
 * @returns Status code 200 and data if query successful. 500 if an error occurs
 */
router.get( "/apps", auth.validateApp, appsController.getApps );

module.exports = router;
