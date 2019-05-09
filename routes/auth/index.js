const express = require( "express" );
const token = require( "../../middlewares/token" );
const Validator = require( "../../middlewares/validators/Cords" );
const authController = require( "../../controllers/Auth" );
let router = express.Router();

/**
 * @method POST
 * @description Authenticate a user with their username & password
 * @param body {object} Object used to create the document
 * @returns Status code 200 if successful with created document, 500 if error
 *   occurs
 */
router.post( "/",
  Validator.bodyIsPresent,
  token.validateToken,
  authController.login
);

module.exports = router;
