# Smoke Singal Service
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

- Add the routes you need under the `routes` directory, and include require them in your `routes/index.js` file.
```
| routes/
| index.js
|
|---> user/
     |---> index.js
|
|---> auth/
     |---> index.js
```

### Starting 
* Run the command ```npm test``` to run the application in "development" mode.
* Run the command ```npm start``` to run the application in "production" mode.

### Questions & Concerns
Please contact Evan Bechtol <evan.bechtol@ericsson.com>
