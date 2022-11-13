import closeIframe from './closeIFrame';
import assert from './helper/assert';
import placeOrder from './placeOrder';
import receiveMessage from './receiveMessage';
import renderWithRetry from './renderWithRetry';
import sendMessage from './sendMessage';

/**
 * Initializes a SDK instance
 * @constructor
 * @param {Object} options
 * @param {String} options.key the API Key found on your Application settings page
 * @param {String} [options.environment] enviornment SANDBOX | PRODUCTION
 */
function init(options) {
  /* eslint-disable */

  // validate the client's input for 'init'
  try {
    assert.check(
      options,
      { type: 'object', message: 'init parameter is not valid.' },
      {
        key: { type: 'string', message: "'key' is required string." },
        environment: {
          optional: true,
          type: 'string',
          message: "'environment' must be string."
        }
      }
    );
  } catch (err) {
    // assert method above throws error with given message which we further throw to client.
    if (err && err.message) {
      throw err.message;
    }
    throw 'Please try again';
  }

  // set environment to 'PRODUCTION' if stated by client, otherwise 'SANDBOX'
  options.environment =
    options &&
    typeof options.environment === 'string' &&
    options.environment.toUpperCase() === 'PRODUCTION'
      ? 'PRODUCTION'
      : 'SANDBOX';

  // save options to clientData
  this.clientData = options;

  /* eslint-enable */
}

// core methods
init.prototype.renderWithRetry = renderWithRetry;
init.prototype.placeOrder = placeOrder;
init.prototype.receiveMessage = receiveMessage;
init.prototype.sendMessage = sendMessage;
init.prototype.close = closeIframe;

export default init;
