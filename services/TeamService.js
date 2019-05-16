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
    body.createdOn = new Date();
    body.lastModifiedOn = body.createdOn;
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
   * @param data {object} Data to update team with
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
   * @description Update members property for a team
   * @param id  {string} Mongoose Object ID for document
   * @param data {object} Data to update team with
   * @returns {Promise<any>} Returns result of Mongoose query
   */
  async updateMembers ( id, data ) {
    // Determine if ID and Body provided
    const isValidId = id && ObjectId.isValid( id );
    const isValidBody = data && typeof data === "object";

    // Determine if action property is provided and valid
    const actionIsProvided = isValidBody && data.action && typeof data.action === "string";
    const isValidAction = actionIsProvided && [ "add", "remove" ].includes( data.action );

    // Determine if member property is provided and valid
    const memberIsProvided = isValidBody
      && data.member
      && typeof data.member === "object";
    const isValidMember = memberIsProvided
      && ObjectService.hasAllRequiredKeys( data.member, teamsKeyWhitelist.members );

    if ( !isValidId ) {
      throw new Error( Messages.response.invalidIdProvided );
    } else if ( !isValidBody ) {
      throw new Error( Messages.response.invalidBodyProvided );
    } else if ( !isValidAction ) {
      throw new Error( Messages.response.invalidActionProvided );
    } else if ( !isValidMember ) {
      throw new Error( Messages.response.invalidMemberProvided );
    } else {
      // Find the team to update members for
      const findTeamProjection = { members: 1, name: 1, _id: 1 };
      const team = await this.mongooseServiceInstance.findById( id, findTeamProjection );

      if ( team ) {
        // Make sure that member property only contains whitelisted keys
        data.member = ObjectService.pick( data.member, teamsKeyWhitelist.members );

        // Determine what action to take
        if ( data.action === "add" ) {
          return await this._addTeamMember( team, data.member );
        } else if ( data.action === "remove" ) {
          return await this._removeTeamMember( team, data.member );
        }
      } else {
        throw new Error( Messages.response.teamNotFound );
      }
    }
  }

  /**
   * @description Add a user to the teams list of members
   * @param team {object} Team to add a user to
   * @param user {object} User to add to the members list
   * @returns {Promise<*>} Returns the updated team
   * @private
   */
  async _addTeamMember ( team, user ) {
    const filteredTeamMembers = team.members.filter( teamMember => teamMember._id.equals( user._id ) );

    // User is already on this team
    if ( filteredTeamMembers.length ) {
      return await team;
    }

    // User is not on this team
    else if ( filteredTeamMembers.length === 0 ) {
      team.members.push( user );
      const updateQuery = { $set: { members: team.members } };
      return await this.mongooseServiceInstance.update( team._id, updateQuery );
    }
  }

  /**
   * @description Remove a team member from the team
   * @param team {object} Team to remove the user from
   * @param user {object} User to remove from the members list
   * @returns {Promise<*>} Returns the updated team
   * @private
   */
  async _removeTeamMember ( team, user ) {
    const filteredTeamMembers = team.members.filter( teamMember => teamMember._id.equals( user._id ) );

    // User is not on this team
    if ( !filteredTeamMembers.length ) {
      return await team;
    }

    // User is on this team
    else if ( filteredTeamMembers.length >= 1 ) {
      team.members = team.members.filter( teamMember => !teamMember._id.equals( user._id ) );
      const updateQuery = { $set: { members: team.members } };
      return await this.mongooseServiceInstance.update( team._id, updateQuery );
    }
  }
}

module.exports = TeamService;
