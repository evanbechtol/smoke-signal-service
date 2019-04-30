const Sentry = require( "@sentry/node" );
const FnUtil = require( "../util/functionUtils" );
const logger = require( "../services/Logger" );

class SentryLoader {
  constructor ( dsn = FnUtil.isRequired, environment = FnUtil.isRequired, release = FnUtil.isRequired ) {
    this.dsn = dsn;
    this.environment = environment;
    this.release = release;
  }

  init () {
    Sentry.init( {
      dsn: this.dsn,
      environment: this.environment,
      release: this.release
    } );

    Sentry.configureScope( scope => {
      // eslint-disable-next-line
      scope.addEventProcessor( ( event, hint ) => {
        // Add anything to the event here
        // returning null will drop the event
        logger.info( `Sentry event logged: ${JSON.stringify( event )}` );
        return event;
      } );
    } );
  }
}

module.exports = SentryLoader;
