const express = require( "express" );
const token = require( "../../middlewares/token" );
const Validator = require( "../../middlewares/validators/Cords" );
const teamController = require( "../../controllers/Teams" );
let router = express.Router();

/**
 * @method POST
 * @description Create a Team
 */
router.post( "/",
  Validator.bodyIsPresent,
  token.validateToken,
  teamController.createTeam
);

/**
 * @method PUT
 * @description Update a Team
 */
router.put( "/:id",
  Validator.idIsPresent,
  Validator.bodyIsPresent,
  token.validateToken,
  teamController.updateTeam
);

/**
 * @method PUT
 * @description Update a Team's members
 */
router.put( "/members/:id",
  Validator.idIsPresent,
  Validator.bodyIsPresent,
  token.validateToken,
  teamController.updateMembers
);

/**
 * @method GET
 * @description Retrieve a Team's members
 */
router.get( "/members/:id",
  Validator.idIsPresent,
  token.validateToken,
  teamController.getTeamMembers
);

/**
 * @method GET
 * @description Retrieve teams, can provide a query to filter result set
 */
router.get( "/",
  token.validateToken,
  teamController.getTeam
);

/**
 * @method GET
 * @description Retrieve a single team by the MongoDB Object ID (_id)
 */
router.get( "/:id",
  Validator.idIsPresent,
  token.validateToken,
  teamController.getTeamById
);

module.exports = router;
