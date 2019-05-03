const cords = require( "./cords" );
const uploads = require( "./uploads" );
const notifications = require( "./notifications" );
const userApps = require( "./userApps" );
const apps = require( "./apps" );

const routes = app => {
  app.use( ( req, res, next ) => {
    res.setHeader( "Access-Control-Allow-Origin", "*" );
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, OPTIONS, PUT, PATCH, DELETE"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "X-Requested-With, content-type, x-access-token, authorization"
    );
    res.setHeader( "Access-Control-Allow-Credentials", true );
    res.removeHeader( "X-Powered-By" );
    next();
  } );

  app.use( "/cords", cords );
  app.use( "/uploads", uploads );
  app.use( "/notifications", notifications );
  app.use( "/user", userApps );
  app.use( "/apps", apps );
};

module.exports = routes;
