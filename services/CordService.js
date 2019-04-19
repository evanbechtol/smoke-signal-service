const MongooseService = require( "./MongooseService" );
const ObjectUtil = require( "../util" );
const loki = require( "lokijs" );
const dbName = "db.json";
const collectionName = "files";
const uploadPath = "uploads";
const db = new loki( `${uploadPath}/${dbName}`, { persistenceMethod: "fs" } );

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
   * @description Create a single new cord document
   * @param cord {object} Required: Data to populate cord with
   * @returns {Promise<any>} Returns result of Mongoose query
   */
  async create ( cord ) {
    return await this.mongooseServiceInstance.create( cord );
  }

  /**
   * @description Get multiple documents by ID
   * @param query {object} Required: Query to execute on Model
   * @param {object} [sort] Optional: argument to sort data
   * @returns {Promise<any>} Returns result of Mongoose query
   */
  async find ( query, sort ) {
    return await this.mongooseServiceInstance.find( query, sort );
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
   * @description Retrieve files for the cord matching the provided ID
   * @param id {string} Required: Object ID for the cord
   * @param {object} [projection] Optional: Fields to return or not return from
   * query
   * @param {string} [options] Optional: options to provide query
   * @returns {Promise<void>}
   */
  async getFilesByCordId ( id, projection = { __v: 0 }, options ) {
    const defaultQueryOptions = { lean: true };
    const col = await ObjectUtil.loadCollection( collectionName, db );

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
    const cordsPulledQuery = { puller: user };
    const rescuesProvidedQuery = { rescuers: user };
    const mostActiveAppPipeline = [
      { $match: cordsPulledQuery },
      { $group: { _id: "$app", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ];

    return {
      cordsPulledData: await this.mongooseServiceInstance.count( cordsPulledQuery ),
      rescuesProvidedData: await this.mongooseServiceInstance.count( rescuesProvidedQuery ),
      mostActiveAppData: await this.mongooseServiceInstance.aggregate( mostActiveAppPipeline )
    };
  }

  /**
   * @description Update a single cord document
   * @param id  {string} Mongoose Object ID for document
   * @param cord {object} Data to populate cord with
   * @returns {Promise<any>} Returns result of Mongoose query
   */
  async update ( id, cord ) {
    return await this.mongooseServiceInstance.update( id, cord );
  }

  /**
   * @description Delete a single cord document
   * @param id {string} Mongoose Object ID for document
   * @returns {Promise<any>} Returns result of Mongoose query
   */
  async delete ( id ) {
    return await this.mongooseServiceInstance.delete( id );
  }
}

module.exports = CordService;
