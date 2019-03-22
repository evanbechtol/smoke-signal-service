const express        = require( "express" );
const auth           = require( "../../controllers/E-Auth" );
const cordController = require( "../../controllers/Notification" );

let router = express.Router();

/**
 * @method GET
 * @description Retrieve cords (paginated by default to 10 items per page)
 * @param limit {number} Optionally pass in to adjust page size
 * @param skip {number} Optionally pass in to control item offset for page
 * @param query {string} Optionally pass in to control the query performed by MonogDB
 * @returns Status code 200 and data if query successful. 500 if an error occurs
 */
router.get( "/get/count", auth.validateApp, cordController.getToolNotificationUnreadCount );

/**
 * @method GET
 * @description Retrieve cords (paginated by default to 10 items per page)
 * @param limit {number} Optionally pass in to adjust page size
 * @param skip {number} Optionally pass in to control item offset for page
 * @param query {string} Optionally pass in to control the query performed by MonogDB
 * @returns Status code 200 and data if query successful. 500 if an error occurs
 */
router.get( "/get/list", auth.validateApp, cordController.getToolNotificationUnreadList );

/**
 * @method POST
 * @description Create a cord, provided that all required keys are provided
 * @param body {object} Object used to create the document
 * @returns Status code 200 if successful with created document, 500 if error occurs
 */
//router.post( "/create", auth.validateApp, cordController.createCord );
  
/**
 * @method PUT
 * @description Update a cord, provided that all required keys are provided
 * @param id {string} Object ID of document to update
 * @returns Status code 200 if successful with updated document, 500 if error occurs
 */
//router.put( "/:id", auth.validateApp, cordController.updateCord );

module.exports = router;
