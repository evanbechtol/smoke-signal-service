const ObjectId = require( "mongoose" ).Types.ObjectId;
const MongooseService = require( "./MongooseService" );
const ObjectService = require( "../services/ObjectService" );
const teamsKeyWhitelist = require( "../config/whitelists" ).teams;
const Messages = require( "../config/messages" );

class TeamService {
  /**
   * @description Initializes a new instance of the TeamService
   * @param TeamModel {mongoose.model} Required: Instance of Mongoose model
   */
  constructor ( TeamModel ) {
    this.teamModel = TeamModel;
    this.mongooseServiceInstance = new MongooseService( this.teamModel );
  }

  /**
   * @description Create a single new cord document
   * @param body {object} Required: Data to populate cord with
   * @returns {Promise} Returns result of Mongoose query
   */
  async create ( body ) {
    const data = ObjectService.pick( body, teamsKeyWhitelist.model );
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
   * @description Update a single team document
   * @param id  {string} Mongoose Object ID for document
   * @param data {object} Data to populate team with
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

module.exports = TeamService;
