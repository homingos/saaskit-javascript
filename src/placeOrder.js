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
        productId: {
          type: 'string',
          message: "'productId' is required string."
        },
        variantId: {
          type: 'string',
          message: "'variantId' is required string."
        },
        refId: { type: 'string', message: "'refId' is required string." },
        orderId: {
          optional: true,
          type: 'string',
          message: "'orderId' must be string."
        },
        photo: {
          optional: true,
          type: 'string',
          message: "'photo' must be string."
        },
        allowVideoLater: {
          optional: true,
          type: 'boolean',
          message: "'video_later' must be a boolean."
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
          type: 'string',
          message: "'logo' must be string."
        }
      }
    );

    // validate prefill
    if (order_details.prefill) {
      assert.check(
        order_details.prefill,
        {
          type: 'object',
          message: "'prefill' is not valid."
        },
        {
          hide: {
            optional: true,
            type: 'boolean',
            message: "'hide' must be boolean."
          },
          name: {
            optional: true,
            type: 'string',
            message: "'name' mus be string."
          },
          email: {
            optional: true,
            type: 'string',
            message: "'email' mus be string."
          },
          phone: {
            optional: true,
            type: 'string',
            message: "'phone' must be string."
          }
        }
      );
    }

    // validate theme
    if (order_details.theme) {
      assert.check(
        order_details.theme,
        {
          type: 'object',
          message: "'theme' is not valid."
        },
        {
          primaryColor: {
            optional: true,
            type: 'string',
            message: "'primary' must be string."
          }
        },
        {
          secondaryColor: {
            optional: true,
            type: 'string',
            message: "'secondary' must be string."
          }
        }
      );
    }

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

    await this.renderWithRetry(url);
  } catch (err) {
    if (callback && typeof callback === 'function') {
      // render error UI
      let url = `${PAGES.error}/Something went wrong!`;
      await this.renderWithRetry(url);
      // callback to client with error
      await callback({ code: 400, message: err.message }, null);
    } else {
      throw "'callback' is required function.";
    }
  }
  document.activeElement.blur();
}
