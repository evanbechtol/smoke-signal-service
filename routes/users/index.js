const express = require( "express" );
const token = require( "../../middlewares/token" );
const Validator = require( "../../middlewares/validators/Cords" );
const userController = require( "../../controllers/Users" );
let router = express.Router();

/**
 * @method POST
 * @description Create a User, provided that all required keys are provided
 * @param body {object} Object used to create the document
 * @returns Status code 200 if successful with created document, 500 if error
 *   occurs
 */
router.post( "/",
  Validator.bodyIsPresent,
  token.validateToken,
  userController.createUser
);

router.put( "/:id",
  Validator.idIsPresent,
  Validator.bodyIsPresent,
  token.validateToken,
  userController.updateUser
);

router.get( "/",
  token.validateToken,
  userController.getUser
);

router.get( "/:id",
  Validator.idIsPresent,
  token.validateToken,
  userController.getUserById
);

module.exports = router;
