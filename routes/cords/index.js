const express        = require( "express" );
const auth           = require( "../../controllers/E-Auth" );
const cordController = require( "../../controllers/Cords" );
const Multer         = require( "multer" );
const uploadPath     = "uploads";
const upload         = Multer( { dest : `${uploadPath}/` } );

let router = express.Router();

/**
 * @method GET
 * @description Retrieve cords (paginated by default to 10 items per page)
 * @param limit {number} Optionally pass in to adjust page size
 * @param skip {number} Optionally pass in to control item offset for page
 * @param query {string} Optionally pass in to control the query performed by MongoDB
 * @returns Status code 200 and data if query successful. 500 if an error occurs
 */
router.get( "/", /*auth.validateApp,*/ cordController.getCords );

/**
 * @method POST
 * @description Create a cord, provided that all required keys are provided
 * @param body {object} Object used to create the document
 * @returns Status code 200 if successful with created document, 500 if error occurs
 */
router.post( "/", /*auth.validateApp,*/ cordController.createCord );

/**
 * @method POST
 * @description Upload a file for a cord
 * @param body {object} Object used to create the document
 * @returns Status code 200 if successful with created document, 500 if error occurs
 */
router.post( "/upload/:id", auth.validateApp, upload.single('cordFile'), cordController.upload );


/**
 * @method GET
 * @description Retrieve files for a cord
 * @param id {string} Object ID of the Cord to retrieve files for
 * @returns Status code 200 if successful with created document, 500 if error occurs
 */
router.get( "/files/:id", /*auth.validateApp,*/ cordController.getFilesByCordId );
/**
 * @method GET
 * @description Retrieve a cord by the provided object id
 * @param id {string} Object ID of the Cord to retrieve
 * @returns Status code 200 if successful with retrieved document, 500 if error occurs
 */
router.get( "/:id", /*auth.validateApp,*/ cordController.getCordById );

/**
 * @method PUT
 * @description Update a cord, provided that all required keys are provided
 * @param id {string} Object ID of document to update
 * @returns Status code 200 if successful with updated document, 500 if error occurs
 */
router.put( "/:id", /*auth.validateApp, */cordController.updateCord );


/**
 * @method DELETE
 * @description Delete a cord, provided that the ID provided matches a document
 * @param id {string} Object ID of document to delete
 * @returns Status code 200 if successful with created document, 500 if error occurs
 */
router.delete( "/:id", auth.validateApp, cordController.deleteCord );

/**
 * @method GET
 * @description Retrieve documents matching the status provided
 * @param status {string} Status of the documents to retrieve
 * @returns Status code 200 if successful with retrieved documents, 500 if error occurs
 */
router.get( "/status/:status", /*auth.validateApp,*/ cordController.getCordByStatus );

/**
 * @method GET
 * @description Retrieve documents matching the user provided
 * @param user {string} User object to retrieve cords for
 * @returns Status code 200 if successful with retrieved documents, 500 if error occurs
 */
router.get( "/user/:user", /*auth.validateApp,*/ cordController.getCordForUser );

/**
 * @method GET
 * @description Retrieve statistics for user matching ID provided
 * @param status {string} User to retrieve statistics for
 * @returns Status code 200 if successful with retrieved documents, 500 if error occurs
 */
router.get( "/stats/:user", /*auth.validateApp, */cordController.getUserStats );

/**
 * @method PUT
 * @description Update a cord's rescuers, provided that all required keys are provided
 * @param id {string} Object ID of document to update
 * @param body {object} Body to update document with
 * @returns Status code 200 if successful with updated document, 500 if error occurs
 */
router.put( "/rescuers/:id",/* auth.validateApp,*/ cordController.updateRescuers );

/**
 * @method GET
 * @description Retrieve all categories
 * @returns Status code 200 if successful with retrieved document, 500 if error occurs
 */
router.get( "/category/list", /*auth.validateApp,*/ cordController.getCategoryList );

module.exports = router;
