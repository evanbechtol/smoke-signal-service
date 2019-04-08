const express        = require( "express" );
const auth           = require( "../../controllers/E-Auth" );
const userAppsController = require( "../../controllers/UserApps" );

let router = express.Router();

/**
 * @method POST
 * @description Create a UserApps, provided that all required keys are provided
 * @param body {object} Object used to create the document
 * @returns Status code 200 if successful with created document, 500 if error occurs
 */
router.post( "/", auth.validateApp, userAppsController.createUserApps );

module.exports = router;
