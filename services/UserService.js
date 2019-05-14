const ObjectId = require( "mongoose" ).Types.ObjectId;
const MongooseService = require( "./MongooseService" );
const ObjectService = require( "../services/ObjectService" );
const usersKeyWhitelist = require( "../config/whitelists" ).users;
const Messages = require( "../config/messages" );

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
   * @description Create a single new cord document
   * @param body {object} Required: Data to populate cord with
   * @returns {Promise} Returns result of Mongoose query
   */
  async create ( body ) {
    const data = ObjectService.pick( body, usersKeyWhitelist.model );
    return await this.mongooseServiceInstance.create( data );
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
   * @description Retrieve a single document by query
   * @param query {object} Required: Mongoose query object
   * @param  projection [object] Optional: Mongoose query object
   * @returns {Promise<void>}
   */
  async findOne ( query, projection = { __v: 0 } ) {
    return await this.mongooseServiceInstance.findOne( query, projection );
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
   * @description Update a single user document
   * @param id  {string} Mongoose Object ID for document
   * @param data {object} Data to populate user with
   * @returns {Promise<any>} Returns result of Mongoose query
   */
  async update ( id, data ) {
    const isValidId = id && ObjectId.isValid( id );
    const isValidBody = data && typeof data === "object";

    if ( isValidId && isValidBody ) {
      return await this.mongooseServiceInstance.update( id, data );
    } else {
      throw new Error( Messages.response.invalidIdProvided );
    }
  }
}

module.exports = UserService;
