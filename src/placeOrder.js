import { PAGES } from './constants';
import assert from './helper/assert';

/**
 * Runs the SDK for Placing Order
 * @function
 * @param {Object} options
 * @param {String} options.key the API Key found on your Application settings page
 * @param {String} [options.environment] enviornment sandbox | production
 */

// TODO: write the parameter descriptions

export default function placeOrder(order_details, callback) {
  try {
    // validate client data
    assert.check(
      this.clientData,
      { type: 'object', message: 'init data is invalid' },
      {
        key: { type: 'string', message: "'key' is required string." },
        environment: {
          optional: true,
          type: 'string',
          message: "'environment' must be string."
        }
      }
    );

    // validate order_details
    assert.check(
      order_details,
      {
        type: 'object',
        message: "'order_details' is not valid."
      },
      {
        productId: {
          type: 'string',
          message: "'productId' is required string."
        },
        refId: { type: 'string', message: "'refId' is required string." },
        photo: {
          optional: true,
          type: 'string',
          message: "'photo' must be string."
        },
        video: {
          optional: true,
          type: 'string',
          message: "'video' must be string."
        },
        prefill: {
          optional: true,
          type: 'object',
          message: "'prefill' must be object."
        },
        animation: {
          optional: true,
          type: 'string',
          message: "'animation' must be string."
        },
        theme: {
          optional: true,
          type: 'object',
          message: "'theme' must be object."
        },
        logo: {
          optional: true,
          type: 'object',
          message: "'logo' must be string."
        }
      }
    );

    // validate callback function
    assert.check(callback, {
      type: 'function',
      message: "'callback' is required function."
    });

    // save order_details
    this.order_details = order_details;

    // render the success UI
    let url = `${PAGES.main}`;

    this.callback = callback;
    this.renderWithRetry(url);
  } catch (err) {
    if (callback && typeof callback === 'function') {
      // render error UI
      let url = `${PAGES.error}/Something went wrong!`;
      this.renderWithRetry(url);
      // callback to client with error
      callback({ code: 400, message: err.message }, null);
    } else {
      throw "'callback' is required function.";
    }
  }

  // TODO : Add image error handling
}
