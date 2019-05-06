const MongooseService = require( "./MongooseService" );
const ObjectId = require( "mongoose" ).Types.ObjectId;
const Messages = require( "../config/messages" );

class NotificationService {
  /**
   * @description Initializes a new instance of the NotificationService
   * @param NotificationModel {mongoose.model} Required: Instance of Mongoose
   *   model
   */
  constructor ( NotificationModel ) {
    this.notificationModel = NotificationModel;
    this.mongooseServiceInstance = new MongooseService( this.notificationModel );
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
   * @description Update a single cord document
   * @param id  {string} Mongoose Object ID for document
   * @param data {object} Data to populate cord with
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
   * @description Create a new notification
   * @param data
   * @param resp
   * @returns {Promise<*>}
   */
  async create ( data, resp ) {
    let promiseArr = [];

    resp.forEach( elem => {
      const createData = {
        notifyReceiver: elem.user,
        readTimeStamp: null,
        createdTimeStamp: new Date().toISOString(),
        cord: {
          _id: data._id,
          status: data.status,
          app: data.app,
          title: data.title
        },
        subject: data.subject,
        createdBy: data.puller
      };

      promiseArr.push( this.mongooseServiceInstance.create( createData ) );
    } );

    return Promise.all( promiseArr );
  }

  async userDiscussion ( data ) {
    let lookup = {};
    let result = [];
    const dataObj = data.discussion;
    if ( data.status === "Open" ) {
      if ( dataObj.length > 0 ) {
        let creator = dataObj[ dataObj.length - 1 ].user;

        dataObj.forEach( function ( item ) {
          let id = item.user._id;
          if ( !( id in lookup ) && id !== dataObj[ dataObj.length - 1 ].user._id ) {
            lookup[ id ] = 1;
            result.push( {
              user: { _id: item.user._id, username: item.user.username }
            } );
          }
        } );

        if ( !( data.puller._id in lookup ) ) {
          if ( data.puller._id !== dataObj[ dataObj.length - 1 ].user._id ) {
            result.push( {
              user: { _id: data.puller._id, username: data.puller.username }
            } );
          }
        }

        if ( result.length > 0 ) {
          data.puller = { _id: creator._id, username: creator.username };
          data.subject = "Responded to cord";
          return this.create( data, result );
        }
      }
    } else {
      dataObj.forEach( function ( item ) {
        let id = item.user._id;
        if ( !( id in lookup ) && id !== data.puller._id ) {
          lookup[ id ] = 1;
          result.push( {
            user: { _id: item.user._id, username: item.user.username }
          } );
        }
      } );
      if ( result.length > 0 ) {
        data.subject = "Cord has been resolved";
        return this.create( data, result );
      }
    }
  }
}

module.exports = NotificationService;
