class MongooseService {
  /**
   * @description Create an instance of the MongooseService class
   * @param Model {mongoose.model} Mongoose Model to use for the instance
   */
  constructor ( Model ) {
    this.model = Model;
  }

  /**
   * @description Create a new document on the Model
   * @param body {object} Body object to create the new document with
   * @returns {Promise<any>}
   */
  create ( body ) {
    return this.model.create( body ).exec();
  }

  /**
   * @description Delete an existing document on the Model
   * @param id {string} ID for the object to delete
   * @returns {Promise<any>}
   */
  delete ( id ) {
    return this.model.findByIdAndDelete( id ).exec();
  }

  /**
   * @description Retrieve distinct "fields" which are in the provided status
   * @param query {object} Object that maps to the status to retrieve docs for
   * @param field {string} The distinct field to retrieve
   * @returns {Promise<any>}
   */
  findDistinct ( query, field ) {
    return this.model
        .find( query )
        .distinct( field )
        .exec();
  }

  /**
   * @description Retrieve a single document from the Model with the provided query
   * @param query {object} Query to be performed on the Model
   * @returns {Promise<any>}
   */
  findOne ( query ) {
    return this.model
        .findOne( query, "-__v", { lean : true } )
        .select( { __v : 0 } )
        .exec();
  }

  /**
   * @description Retrieve multiple documents from the Model with the provided query
   * @param query {object} - Query to be performed on the Model
   * @param {object} [sort] - Optional argument to sort data
   * @returns {Promise<any>}
   */
  find ( query, sort = { id: 1 } ) {
    return this.model
        .find( query, "-__v", { lean : true } )
        .sort( sort )
        .select( { __v : 0 } )
        .exec();
  }

  /**
   * @description Retrieve a single document matching the provided ID, from the Model
   * @param id {string} ID for the object to retrieve
   * @returns {Promise<any>}
   */
  findById ( id ) {
    return this.model
        .findById( id, "-__v", { lean : true } )
        .exec();
  }

  /**
   * @description Update a document matching the provided ID, with the body
   * @param id {string} ID for the document to update
   * @param body {object} Body to update the document with
   * @returns {Promise<any>}
   */
  update ( id, body ) {
    return this.model
        .findByIdAndUpdate( id, body, { lean : true, new : true } )
        .exec();
  }
}

module.exports = MongooseService;
