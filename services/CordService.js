const ObjectId = require( "mongoose" ).Types.ObjectId;
const Messages = require( "../config/messages" );

// For file uploads
const loki = require( "lokijs" );
const LokiService = require( "./LokiService" );
const dbName = "db.json";
const collectionName = "files";
const uploadPath = "uploads";
const db = new loki( `${uploadPath}/${dbName}`, { persistenceMethod: "fs" } );

// Services
const MongooseService = require( "./MongooseService" );
const UserService = require( "./UserService" );

// Models
const Users = require( "../models/User" );

class CordService {
  /**
   * @description Initializes a new instance of the CordService
   * @param CordModel {mongoose.model} Required: Instance of Mongoose model
   */
  constructor ( CordModel ) {
    this.cordModel = CordModel;

    this.mongooseServiceInstance = new MongooseService( this.cordModel );
    this.userServiceInstance = new UserService( Users );
  }

  /**
   * @description Retrieve the cordModel for the instance
   * @returns {mongoose.model}
   */
  getCordModel () {
    return this.cordModel;
  }

  /**
   * @description Retrieve the mongooseServiceInstance for the instance
   * @returns {MongooseService}
   */
  getMongooseServiceInstance () {
    return this.mongooseServiceInstance;
  }

  /**
   * @description Create a single new cord document
   * @param cord {object} Required: Data to populate cord with
   * @returns {Promise} Returns result of Mongoose query
   */
  async create ( cord ) {
    return await this.mongooseServiceInstance.create( cord );
  }

  /**
   * @description Add an answer to the cord matching the provided object id
   * @param id {string} MongoDB Object ID for the cord to add the answer to
   * @param data {object} Answer containing properties: user, and answer
   * @returns {Promise<void>}
   */
  async createAnswer ( id, data ) {
    // Determine if ID and Body provided
    const isValidId = id && ObjectId.isValid( id );
    const isValidBody = data && typeof data === "object";

    // Determine if user and answer are provided and valid
    const userIsProvided = isValidBody
      && data.user
      && typeof data.user === "object"
      && data.user._id;
    const answerIsProvided = isValidBody
      && data.answer
      && typeof data.answer === "string";

    if ( !userIsProvided ) {
      throw new Error( Messages.responses.userNotProvided );
    } else if ( !answerIsProvided ) {
      throw new Error( Messages.responses.answerNotProvided );
    } else if ( !isValidId ) {
      throw new Error( Messages.responses.invalidIdProvided );
    } else if ( !isValidBody ) {
      throw new Error( Messages.responses.invalidBodyProvided );
    } else {
      // Verify that the user provided exists
      const user = await this.userServiceInstance.findById( data.user._id );

      // No user exists with the provided ID
      if ( !user ) {
        throw new Error( Messages.responses.userNotFound );
      }

      // Retrieve the cord to add the answer to
      let cord = await this.mongooseServiceInstance.findById( id, {}, {} );

      // No cord exists with the provided ID
      if ( !cord ) {
        throw new Error( Messages.response.cordNotFound );
      }

      // Check that the cord is not resolved
      const allowedStatus = "Open";
      if ( cord.status !== allowedStatus ) {
        throw new Error( Messages.responses.cordUneditable );
      }

      // Make sure that there is an answers property for the cord
      if ( !( cord.answers && cord.answers.length >= 0 ) ) {
        cord.answers = [];
      }

      // Add necessary  fields to answer
      data.createdOn = new Date();
      data._id = ObjectId();
      cord.answers.push( data );

      return await cord.save();
    }
  }

  /**
   * @description Remove an answer from the cord matching the provided object id
   * @param id {string} MongoDB Object ID for the cord to remove the answer from
   * @param answerId {string} MongoDB Object ID for the answer to remove
   * @returns {Promise<void>}
   */
  async deleteAnswer ( id, answerId ) {
    // Determine if ID and Body provided
    const isValidId = id && ObjectId.isValid( id );
    const isValidAnswerId = answerId && ObjectId.isValid( answerId );

    if ( !isValidId ) {
      throw new Error( Messages.responses.invalidIdProvided );
    } else if ( !isValidAnswerId ) {
      throw new Error( Messages.responses.invalidIdProvided );
    } else {
      // Retrieve the cord to delete the answer from
      let cord = await this.mongooseServiceInstance.findById( id, {}, {} );

      // No cord exists with the provided ID
      if ( !cord ) {
        throw new Error( Messages.response.cordNotFound );
      }

      // Check that the cord is not resolved
      const allowedStatus = "Open";
      if ( cord.status !== allowedStatus ) {
        throw new Error( Messages.responses.cordUneditable );
      }

      // Make sure that there is an answers property for the cord
      if ( !( cord.answers || cord.answers.length ) ) {
        throw new Error( Messages.responses.answerNotFound );
      }

      // Find the answer to delete
      const answerIndex = cord.answers.findIndex( elem => elem._id.equals( answerId ) );

      if ( answerIndex !== -1 ) {
        cord.answers.splice( answerIndex, 1 );
      } else {
        throw new Error( Messages.responses.answerNotFound );
      }

      return await cord.save();
    }
  }

  /**
   * @description Retrieve list of distinct values for the field, in
   * documents returned form the provided query
   * @param query {object} Required: Query to execute on the Collection
   * @param field {string} The field to retrieve distinct values for
   * @returns {Promise}
   */
  async findDistinct ( query, field ) {
    return await this.mongooseServiceInstance.findDistinct( query, field );
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
   * @description Retrieve a single document by query
   * @param query {object} Required: Mongoose query object
   * @param  projection [object] Optional: Mongoose query object
   * @returns {Promise<void>}
   */
  async findOne ( query, projection = { __v: 0 } ) {
    return await this.mongooseServiceInstance.findOne( query, projection );
  }

  /**
   * @description Retrieve files for the cord matching the provided ID
   * @param id {string} Required: Object ID for the cord
   * @param {object} [projection] Optional: Fields to return or not return from
   * query
   * @param {string} [options] Optional: options to provide query
   * @returns {Promise<void>}
   */
  async getFilesByCordId ( id, projection = { __v: 0 }, options ) {
    const defaultQueryOptions = { lean: true };
    const col = await LokiService.loadCollection( collectionName, db );

    options = Object.assign( {}, defaultQueryOptions, options );
    const cordData = await this.mongooseServiceInstance.findById( id, projection, options );
    return col.findOne( { filename: cordData.files } );
  }

  /**
   * @description
   * @param user {object} Required: User to retrieve statistics for
   * @returns {object} Returns results of Mongoose query
   */
  async getUserStats ( user ) {
    if ( user && user.hasOwnProperty( "_id" ) && user.hasOwnProperty( "username" ) ) {
      const cordsPulledQuery = { puller: user };
      const rescuesProvidedQuery = { rescuers: user };
      const mostActiveAppPipeline = [
        { $match: cordsPulledQuery },
        { $group: { _id: "$app", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 1 }
      ];

      return {
        cordsPulled: await this.mongooseServiceInstance.count( cordsPulledQuery ),
        rescuesProvided: await this.mongooseServiceInstance.count( rescuesProvidedQuery ),
        mostActiveApp: await this.mongooseServiceInstance.aggregate( mostActiveAppPipeline )
      };
    } else {
      throw new Error( "Invalid User" );
    }
  }

  /**
   * @description Update a single cord document
   * @param id  {string} Mongoose Object ID for document
   * @param cord {object} Data to populate cord with
   * @returns {Promise<any>} Returns result of Mongoose query
   */
  async update ( id, cord ) {
    const isValidId = id && ObjectId.isValid( id );
    const isValidBody = cord && typeof cord === "object";
    if ( isValidId && isValidBody ) {
      return await this.mongooseServiceInstance.update( id, cord );
    } else {
      throw new Error( "Invalid ID or body provided" );
    }
  }

  /**
   * @description Upload a file and associate it to a Cord
   * @param id  {string} Mongoose Object ID for document
   * @param file {object} File to upload
   * @returns {Promise} Returns result of Mongoose query
   */
  async upload ( id, file ) {
    const col = await LokiService.loadCollection( collectionName, db );
    const data = col.insert( file );

    // Save the file to the database
    db.saveDatabase();

    const queryOptions = { lean: true, new: true };
    const query = { files: data.filename };
    return await this.mongooseServiceInstance.update( id, query, queryOptions );
  }

  /**
   * @description Retrieve a file
   * @param fileName {string} Filename to retrieve from DB
   * @returns {Promise} Returns result of Mongoose query
   */
  static async getFile ( fileName ) {
    const col = await LokiService.loadCollection( collectionName, db );
    return col.findOne( { "filename": fileName } );
  }

  /**
   * @description Delete a single cord document
   * @param id {string} Mongoose Object ID for document
   * @returns {Promise<any>} Returns result of Mongoose query
   */
  async delete ( id ) {
    return await this.mongooseServiceInstance.delete( id );
  }

  /**
   * @description Retrieve Categories using query
   * @param query {object} Required: Query to execute on Collection
   * @returns {Promise}
   */
  async getCategoryList ( query ) {
    const sort = { name: 1 };
    const projection = { __v: 0 };
    let data = await this.mongooseServiceInstance.find( query, projection, sort );

    if ( !data.length ) {
      data = [
        { name: "Bug" },
        { name: "Deployment" },
        { name: "Other" },
        { name: "Troubleshooting" }
      ];
    }

    return data;
  }
}

module.exports = CordService;
