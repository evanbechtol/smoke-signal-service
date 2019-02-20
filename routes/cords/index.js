const express        = require( "express" );
const cordController = require( "../../controllers/Cords" );

let router = express.Router();

/**
 * @method GET
 * @description Retrieve cords (paginated by default to 10 items per page)
 * @param limit {number} Optionally pass in to adjust page size
 * @param skip {number} Optionally pass in to control item offset for page
 * @param query {string} Optionally pass in to control the query performed by MonogDB
 * @returns Status code 200 and data if query successful. 500 if an error occurs
 */
router.get( "/", cordController.getCords );

/**
 * @method POST
 * @description Create a cord, provided that all required keys are provided
 * @param body {object} Object used to create the document
 * @returns Status code 200 if successful with created document, 500 if error occurs
 */
router.post( "/", cordController.createCord );

/**
 * @method GET
 * @description Retrieve a cord by the provided object id
 * @param id {string} Object ID of the Cord to retrieve
 * @returns Status code 200 if successful with retrieved document, 500 if error occurs
 */
router.get( "/:id", cordController.getCordById );

/**
 * @method PUT
 * @description Update a cord, provided that all required keys are provided
 * @param id {string} Object ID of document to update
 * @returns Status code 200 if successful with updated document, 500 if error occurs
 */
router.put( "/:id", cordController.updateCord );


/**
 * @method DELETE
 * @description Delete a cord, provided that the ID provided matches a document
 * @param id {string} Object ID of document to delete
 * @returns Status code 200 if successful with created document, 500 if error occurs
 */
router.delete( "/:id", cordController.deleteCord );

/**
 * @method GET
 * @description Retrieve documents matching the status provided
 * @param status {string} Status of the documents to retrieve
 * @returns Status code 200 if successful with retrieved documents, 500 if error occurs
 */
router.get( "/status/:status", cordController.getCordByStatus );

module.exports = router;
