const express        = require( "express" );
const auth           = require( "../../controllers/E-Auth" );
const notificationController = require( "../../controllers/Notifications" );

let router = express.Router();

/**
 * @method GET
 * @description Retrieve notifications (paginated by default to 10 items per page)
 * @param limit {number} Optionally pass in to adjust page size
 * @param skip {number} Optionally pass in to control item offset for page
 * @param query {string} Optionally pass in to control the query performed by MonogDB
 * @returns Status code 200 and data if query successful. 500 if an error occurs
 */
router.get( "/list", auth.validateApp, notificationController.getToolNotificationUnreadList );
/**
 * @method PUT
 * @description Update a notification, provided that all required keys are provided
 * @param id {string} Object ID of document to update
 * @returns Status code 200 if successful with updated document, 500 if error occurs
 */
router.put( "/:id", auth.validateApp, notificationController.updateNotification );

module.exports = router;
