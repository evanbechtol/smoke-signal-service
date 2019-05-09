const MongooseService = require( "./MongooseService" );
const logger = require( "./Logger" );

class AuthService {
  /**
   * @description Initializes a new instance of the AuthService
   * @param UserModel {mongoose.model} Required: Instance of Mongoose model
   */
  constructor ( UserModel ) {
    this.model = UserModel;
    this.mongooseServiceInstance = new MongooseService( this.model );
  }

  /**
   * @description Get multiple documents by ID
   * @param user {object} Required: User to attempt to authenticate
   * @returns {Promise} Returns result of Mongoose query
   */
  async login ( user ) {
    try {
      return await this.mongooseServiceInstance.findOne( user, { __v: 0 } );
    } catch ( err ) {
      logger.error( err );
    }
  }
}

module.exports = AuthService;
