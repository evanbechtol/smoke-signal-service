const MongooseService = require( "./MongooseService" );
const loki = require( "lokijs" );
const LokiService = require( "./LokiService" );
const dbName = "db.json";
const collectionName = "files";
const uploadPath = "uploads";
const db = new loki( `${uploadPath}/${dbName}`, { persistenceMethod: "fs" } );
const ObjectId = require( "mongoose" ).Types.ObjectId;

class CordService {
  /**
   * @description Initializes a new instance of the CordService
   * @param CordModel {mongoose.model} Required: Instance of Mongoose model
   */
  constructor ( CordModel ) {
    this.cordModel = CordModel;

    this.mongooseServiceInstance = new MongooseService( this.cordModel );
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
