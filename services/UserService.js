const ObjectId = require( "mongoose" ).Types.ObjectId;
const MongooseService = require( "./MongooseService" );
const ObjectService = require( "../services/ObjectService" );
const usersKeyWhitelist = require( "../config/whitelists" ).users;
const Messages = require( "../config/messages" );
const TeamsService = require( "./TeamService" );
const Teams = require( "../models/Teams" );

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

  /**
   * @description Update teams user is a member of, or no longer a member of
   * @param id  {string} Mongoose Object ID for document
   * @param data {object} Data to populate user with
   * @returns {Promise<any>} Returns result of Mongoose query
   */
  async updateTeams ( id, data ) {
    const isValidId = id && ObjectId.isValid( id );
    const isValidBody = data && typeof data === "object";

    if ( !isValidId ) {
      throw new Error( Messages.response.invalidIdProvided );
    } else if ( !isValidBody ) {
      throw new Error( Messages.response.invalidBodyProvided );
    } else {
      // Retrieve the old user doc to compare teams property with new data
      const oldUserDocument = await this.mongooseServiceInstance.findById( data._id );
      const TeamServiceInstance = new TeamsService( Teams );

      const comparer = function ( otherArray ) {
        return function ( current ) {
          return otherArray.filter( function ( other ) {
            return other.value === current.value && other.display === current.display;
          } ).length === 0;
        };
      };

      // If only in old, we need to remove the user from the teams
      const onlyInOld = oldUserDocument.teams.filter( comparer( data.teams ) );
      // If only in new, we need to add the user to the teams
      const onlyInNew = data.teams.filter( comparer( oldUserDocument.teams ) );

      if ( onlyInOld.length > 0 ) {
        const updateData = { action: "remove", member: data };
        await this._updateTeams( onlyInOld, updateData, TeamServiceInstance.updateMembers );
      }

      if ( onlyInNew.length > 0 ) {
        const updateData = { action: "add", member: data };
        await this._updateTeams( onlyInNew, updateData, TeamServiceInstance.updateMembers );
      }

      return await this.mongooseServiceInstance.update( id, data );
    }
  }

  /**
   * @description Utility method to update teams that the user has added
   * or removed from their account
   * @param teams {array} Array of teams objects
   * @param data {object} Data to be used in team update
   * @param cb {function} Callback method to be performed
   * @returns {Promise<*>}
   * @private
   */
  async _updateTeams ( teams, data, cb ) {
    return await teams.map( async team => {
      await cb( team._id, data );
    } );
  }
}

module.exports = UserService;
