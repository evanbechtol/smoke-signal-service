const cords = require( "./cords" );
const uploads = require( "./uploads" );
const notifications = require( "./notifications" );
const users = require( "./users" );
const teams = require( "./teams" );
const apps = require( "./apps" );
const auth = require( "./auth" );

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
  app.use( "/users", users );
  app.use( "/teams", teams );
  app.use( "/apps", apps );
  app.use( "/auth", auth );
};

module.exports = routes;
