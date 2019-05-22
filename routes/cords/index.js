const express = require( "express" );
const auth = require( "../../middlewares/eAuth" );
const token = require( "../../middlewares/token" );
const CordController = require( "../../controllers/Cords" );
const CordValidator = require( "../../middlewares/validators/Cords" );
const Multer = require( "multer" );
const uploadPath = "uploads";
const upload = Multer( { dest: `${uploadPath}/` } );
const router = express.Router();

/**
 * @method GET
 * @description Retrieve cords (paginated by default to 10 items per page)
 * @param limit {number} Optionally pass in to adjust page size
 * @param skip {number} Optionally pass in to control item offset for page
 * @param query {string} Optionally pass in to control the query performed by
 *   MongoDB
 * @returns Status code 200 and data if query successful. 500 if an error
 *   occurs
 */
router.get( "/",
  token.validateToken,
  auth.validateApp,
  CordController.getCords
);

/**
 * @method POST
 * @description Create a cord, provided that all required keys are provided
 * @param body {object} Object used to create the document
 * @returns Status code 200 if successful with created document, 500 if error
 *   occurs
 */
router.post( "/",
  CordValidator.bodyIsPresent,
  token.validateToken,
  auth.validateApp,
  CordController.createCord
);

/**
 * @method POST
 * @description Upload a file for a cord
 * @param body {object} Object used to create the document
 * @returns Status code 200 if successful with created document, 500 if error
 *   occurs
 */
router.post( "/upload/:id",
  CordValidator.idIsPresent,
  token.validateToken,
  auth.validateApp,
  upload.single( "cordFile" ),
  CordValidator.fileIsPresent,
  CordController.upload
);


/**
 * @method GET
 * @description Retrieve files for a cord
 * @param id {string} Object ID of the Cord to retrieve files for
 * @returns Status code 200 if successful with created document, 500 if error
 *   occurs
 */
router.get( "/files/:id",
  CordValidator.idIsPresent,
  token.validateToken,
  auth.validateApp,
  CordController.getFilesByCordId
);

/**
 * @method POST
 * @description Add an answer to a cord
 * @param id {string} Object ID of the Cord to retrieve
 * @returns Status code 200 if successful with document, 500 if error
 *   occurs
 */
router.post( "/answer/:id",
  CordValidator.idIsPresent,
  CordValidator.bodyIsPresent,
  token.validateToken,
  auth.validateApp,
  CordController.createAnswer
);

/**
 * @method GET
 * @description Retrieve a cord by the provided object id
 * @param id {string} Object ID of the Cord to retrieve
 * @returns Status code 200 if successful with retrieved document, 500 if error
 *   occurs
 */
router.get( "/:id",
  CordValidator.idIsPresent,
  token.validateToken,
  auth.validateApp,
  CordController.getCordById
);

/**
 * @method PUT
 * @description Update a cord, provided that all required keys are provided
 * @param id {string} Object ID of document to update
 * @returns Status code 200 if successful with updated document, 500 if error
 *   occurs
 */
router.put( "/:id",
  CordValidator.idIsPresent,
  CordValidator.bodyIsPresent,
  token.validateToken,
  auth.validateApp,
  CordController.updateCord
);


/**
 * @method DELETE
 * @description Delete a cord, provided that the ID provided matches a document
 * @param id {string} Object ID of document to delete
 * @returns Status code 200 if successful with created document, 500 if error
 *   occurs
 */
router.delete( "/:id",
  CordValidator.idIsPresent,
  token.validateToken,
  auth.validateApp,
  CordController.deleteCord
);

/**
 * @method GET
 * @description Retrieve documents matching the status provided
 * @param status {string} Status of the documents to retrieve
 * @returns Status code 200 if successful with retrieved documents, 500 if
 *   error occurs
 */
router.get( "/status/:status",
  CordValidator.statusIsPresent,
  token.validateToken,
  auth.validateApp,
  CordController.getCordByStatus
);

/**
 * @method GET
 * @description Retrieve documents matching the users provided
 * @param user {string} User object to retrieve cords for
 * @returns Status code 200 if successful with retrieved documents, 500 if
 *   error occurs
 */
router.get( "/user/:user",
  CordValidator.userIsPresent,
  token.validateToken,
  auth.validateApp,
  CordController.getCordForUser
);

/**
 * @method GET
 * @description Retrieve statistics for users matching ID provided
 * @param status {string} User to retrieve statistics for
 * @returns Status code 200 if successful with retrieved documents, 500 if
 *   error occurs
 */
router.get( "/stats/:user",
  CordValidator.userIsPresent,
  token.validateToken,
  auth.validateApp,
  CordController.getUserStats
);

/**
 * @method PUT
 * @description Update a cord's rescuers, provided that all required keys are
 *   provided
 * @param id {string} Object ID of document to update
 * @param body {object} Body to update document with
 * @returns Status code 200 if successful with updated document, 500 if error
 *   occurs
 */
router.put( "/rescuers/:id",
  CordValidator.idIsPresent,
  CordValidator.bodyIsPresent,
  token.validateToken,
  auth.validateApp,
  CordController.updateRescuers
);

/**
 * @method GET
 * @description Retrieve all categories
 * @returns Status code 200 if successful with retrieved document, 500 if error
 *   occurs
 */
router.get( "/category/list",
  token.validateToken,
  auth.validateApp,
  CordController.getCategoryList
);

module.exports = router;
