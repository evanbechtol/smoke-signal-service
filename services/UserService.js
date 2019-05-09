const MongooseService = require( "./MongooseService" );
const ObjectService = require( "../services/ObjectService" );
const usersKeyWhitelist = require( "../config/whitelists" ).users;

class UserService {
  /**
   * @description Initializes a new instance of the UserService
   * @param UserModel {mongoose.model} Required: Instance of Mongoose model
   */
  constructor ( UserModel ) {
    this.userModel = UserModel;
    this.mongooseServiceInstance = new MongooseService( this.userModel );
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

  /**
   * @description Get a single document by ID
   * @param id {string} Required: Mongoose Object ID for document
   * @returns {Promise<any>} Returns result of Mongoose query
   */
  async findById ( id ) {
    return await this.mongooseServiceInstance.findById( id );
  }

  /**
   * @description Create a single new cord document
   * @param body {object} Required: Data to populate cord with
   * @returns {Promise} Returns result of Mongoose query
   */
  async create ( body ) {
    const data = ObjectService.pick( body, usersKeyWhitelist.model );
    return await this.mongooseServiceInstance.create( data );
  }
}

module.exports = UserService;
