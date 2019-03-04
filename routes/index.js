const config         = require( "../config" ),
      routesTemplate = require( "./routes-template" ),
      auth           = require( "../controllers/E-Auth" ),
      cords          = require( "./cords" );

const routes = app => {
  app.use( ( req, res, next ) => {
    res.setHeader( "Access-Control-Allow-Origin", "*" );
    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, OPTIONS, PUT, PATCH, DELETE"
    );
    res.setHeader(
        "Access-Control-Allow-Headers",
        "X-Requested-With,content-type, x-access-token"
    );
    res.setHeader( "Access-Control-Allow-Credentials", true );
    res.removeHeader( "X-Powered-By" );
    next();
  } );

  // app.use( "/", routesTemplate );
  app.use( "/cords", auth.validateApp, cords );
};

module.exports = routes;
