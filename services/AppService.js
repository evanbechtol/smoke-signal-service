const MongooseService = require( "./MongooseService" );

class AppService {
  /**
   * @description Initializes a new instance of the AppService
   * @param AppModel {mongoose.model} Required: Instance of Mongoose model
   */
  constructor ( AppModel ) {
    this.appModel = AppModel;
    this.mongooseServiceInstance = new MongooseService( this.appModel );
  }

  /**
   * @description Get multiple documents by ID
   * @param query {object} Required: Query to execute on Model
   * @param {object} [sort] Optional: argument to sort data
   * @returns {Promise} Returns result of Mongoose query
   */
  async find ( query, sort ) {
    return await this.mongooseServiceInstance.find( query, { __v: 0 }, sort );
  }
}

module.exports = AppService;
