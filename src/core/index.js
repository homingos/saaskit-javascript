import { handleListener } from '../helper/messageHandlers';
import IframeHandler from '../helper/iframe-handler';
import assert from '../helper/assert';

import { placeOrder } from './placeOrder';

/**
 * Initializes a SDK instance
 * @constructor
 * @param {Object} options
 * @param {String} options.key the API Key found on your Application settings page
 * @param {String} [options.environment] enviornment SANDBOX | PRODUCTION
 */
function init(options) {
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

  options.environment =
    options &&
    typeof options.environment === 'string' &&
    options.environment.toUpperCase() === 'PRODUCTION'
      ? 'PRODUCTION'
      : 'SANDBOX';

  try {
    localStorage.setItem('options', JSON.stringify(options));
    window.addEventListener(
      'message',
      e => {
        handleListener(e.data);
      },
      false
    );
    const handler = new IframeHandler({
      url: 'http://localhost:3000'
    });

    handler.init();
  } catch (err) {
    console.log(err);
  }
}

init.prototype.placeOrder = placeOrder;

export default init;
