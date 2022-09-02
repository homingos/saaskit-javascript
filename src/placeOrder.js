import { PAGES } from './constants';
import assert from './helper/assert';

export default function placeOrder(order_details, callback) {
  this.order_details = order_details;
  try {
    assert.check(
      this.clientData,
      { type: 'object', message: 'init data is invalid' },
      {
        key: { type: 'string', message: 'key is required in init data' },
        environment: {
          optional: true,
          type: 'string',
          message: 'environment must be a string in init data'
        }
      }
    );

    assert.check(
      order_details,
      {
        type: 'object',
        message: 'options parameter is invalid'
      },
      {
        productId: { type: 'string', message: 'productId is required!' }
      },
      {
        refId: { type: 'string', message: 'refId is required!' }
      }
    );

    if (callback) {
      let url = `${PAGES.main}`;
      this.callback = callback;
      this.renderWithRetry({ url, error: false });
    } else {
      throw new Error('callback function is required!');
    }
  } catch (err) {
    if (callback) {
      let url = `${PAGES.error}/Something went wrong!`;
      this.renderWithRetry({
        url,
        error: true
      });
      callback({ code: 400, message: err.message }, null);
    } else {
      throw new Error('callback function is required!');
    }
  }
}
