import { PAGES } from './constants';
import assert from './helper/assert';

export default async function placeOrder(order_details, callback) {
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
        message: "'order details' is not valid."
      },
      {
        first_name: {
          type: 'string',
          message: "'first_name' is required string."
        },
        last_name: {
          type: 'string',
          message: "'last_name' is required string."
        }
      }
    );

    // save order_details
    this.order_details = order_details;

    // render the success UI
    let url = `${PAGES.main}`;

    this.callback = callback;

    await this.renderWithRetry(url);
  } catch (err) {
    if (callback && typeof callback === 'function') {
      // render error UI
      let url = `${PAGES.error}/Please try again`;
      await this.renderWithRetry(url);
      // callback to client with error
      await callback({ code: 400, message: err.message }, null);
    } else {
      throw "'callback' is required function.";
    }
  }
  document.activeElement.blur();
}
