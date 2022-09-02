import closeIframe from './closeIFrame';
import assert from './helper/assert';
import placeOrder from './placeOrder';
import receiveMessage from './receiveMessage';
import renderWithRetry from './renderWithRetry';
import sendMessage from './sendMessage';

/**
 * Handles all the browser's AuthN/AuthZ flows
 * @constructor
 * @param {Object} options
 * @param {String} options.key the API Key found on your Application settings page
 * @param {String} [options.environment] enviornment sandbox | production
 * @param {String} [options.name] name of client
 * @param {String} [options.logoUrl] client's brand logo url
 * @param {String} [options.email] client's support email for error page
 * @param {String} [options.phone] client's support phone for error page
 */
function init(options) {
  /* eslint-disable */
  try {
    assert.check(
      options,
      { type: 'object', message: 'clientData parameter is not valid' },
      {
        key: { type: 'string', message: 'key is required' },
        environment: {
          optional: true,
          type: 'string',
          message: 'environment is required'
        }
      }
    );

    if (options.overrides) {
      assert.check(options.overrides, {
        type: 'object',
        message: 'overrides option is not valid'
      });
    }
  } catch (err) {
    throw new Error(err.message);
  }

  options.environment =
    options &&
    typeof options.environment === 'string' &&
    options.environment.toUpperCase() === 'PRODUCTION'
      ? 'PRODUCTION'
      : 'SANDBOX';

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
