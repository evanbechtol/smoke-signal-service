# Smoke Signal Service
Backend service for Smoke Signal app. Exposes a RESTful API and MongoDB database to interact with the application. 

### Contributing
If you wish to contribute to this repository, please feel free to clone/fork.
Issue Pull Requests or open issues for any changes that you make.

### Functionality
* Compression of responses
* Configurable application variables
* REST-ful API setup
* MongoDB support

### Pre-requisites
* [Node.js](https://nodejs.org)
* [MongoDB](https://www.mongodb.com/)

### Setup
Assumes that pre-requisites are met.
- Simply clone the repo
```git clone https://scmgr.eams.ericsson.net/incubation/smoke-singal-service.git```

- Install the dependencies 
   - Install application dependencies ```npm install```

### Project Structure
```
| -> config
      | -> keysWhitelists //Whitelists for keys that are acceptable in each HTTP verb
      | index.js //General application config variables
      | messages.js //Standardized application messages for responses & errors
| -> controllers //Interacts with Express and calls services for business logic, responds to requests
| -> loaders //Initialize essential app functionality; Expresss, & SocketIO
| -> middlewares //Perform route-level validation prior to Controller hand-off 
| -> models //Maps MongoDB Collections to Mongoose Schemas for validation
| -> routes //Defines Express API structure
| -> services //Contains all business logic and interacts with MongoDB. Does not have knowledge of Express functionality
| -> test //All tests live here and can be run using: npm test
| -> uploads //Directory is created when files are uploaded to the app
| -> util //Utility modules that are commonly used throughout the app, but are not necessarily services
| index.js //Entry point for application
```

### Commands 
* Run the command ```npm test``` to run the application in "development" mode.
* Run the command ```npm start``` to run the application in "production" mode.

### Questions & Concerns
Please contact Evan Bechtol <evan.bechtol@ericsson.com>
