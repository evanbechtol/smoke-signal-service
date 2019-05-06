const express = require( "express" );
const auth = require( "../../middlewares/eAuth" );
const token = require( "../../middlewares/token" );
const Validator = require( "../../middlewares/validators/Cords" );
const notificationController = require( "../../controllers/Notifications" );

let router = express.Router();

/**
 * @method GET
 * @description Retrieve notifications (paginated by default to 10 items per
 *   page)
 * @param limit {number} Optionally pass in to adjust page size
 * @param skip {number} Optionally pass in to control item offset for page
 * @param query {string} Optionally pass in to control the query performed by
 *   MongoDB
 * @returns Status code 200 and data if query successful. 500 if an error
 *   occurs
 */
router.get( "/list",
  token.validateToken,
  auth.validateApp,
  notificationController.getToolNotificationUnreadList
);
/**
 * @method PUT
 * @description Update a notification, provided that all required keys are
 *   provided
 * @param id {string} Object ID of document to update
 * @returns Status code 200 if successful with updated document, 500 if error
 *   occurs
 */
router.put( "/:id",
  Validator.idIsPresent,
  Validator.bodyIsPresent,
  token.validateToken,
  auth.validateApp,
  notificationController.updateNotification
);

module.exports = router;
