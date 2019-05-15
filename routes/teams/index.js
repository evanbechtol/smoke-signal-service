const express = require( "express" );
const token = require( "../../middlewares/token" );
const Validator = require( "../../middlewares/validators/Cords" );
const teamController = require( "../../controllers/Teams" );
let router = express.Router();

/**
 * @method POST
 * @description Create a Team, provided that all required keys are provided
 * @param body {object} Object used to create the document
 * @returns Status code 200 if successful with created document, 500 if error
 *   occurs
 */
router.post( "/",
  Validator.bodyIsPresent,
  token.validateToken,
  teamController.createTeam
);

router.put( "/:id",
  Validator.idIsPresent,
  Validator.bodyIsPresent,
  token.validateToken,
  teamController.updateTeam
);

router.get( "/",
  token.validateToken,
  teamController.getTeam
);

router.get( "/:id",
  Validator.idIsPresent,
  token.validateToken,
  teamController.getTeamById
);

module.exports = router;
