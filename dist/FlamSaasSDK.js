/**
 * flamsdk v0.0.1
 * Author: bucharitesh
 * Date: 2022-08-31
 * License: MIT
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.FlamSaasSDK = {}));
}(this, (function (exports) { 'use strict';

  function close() {
    window.removeEventListener('message', res);

    // remove the UI
    const element = document.getElementById('flam-sdk-wrapper');
    if (element) {
      element.remove();
    }

    // remove the styles
    const styleSheet = document.getElementById('saas-sdk-style');

    if (styleSheet) {
      styleSheet.remove();
    }
  }

  var toString = Object.prototype.toString;

  function attribute(o, attr, type, text) {
      type = type === 'array' ? 'object' : type;
      if (o && typeof o[attr] !== type) {
          throw new Error(text);
      }
  }

  function variable(o, type, text) {
      if (typeof o !== type) {
          throw new Error(text);
      }
  }

  function value(o, values, text) {
      if (values.indexOf(o) === -1) {
          throw new Error(text);
      }
  }

  function check(o, config, attributes) {
      if (!config.optional || o) {
          variable(o, config.type, config.message);
      }
      if (config.type === 'object' && attributes) {
          var keys = Object.keys(attributes);

          for (var index = 0; index < keys.length; index++) {
              var a = keys[index];
              if (!attributes[a].optional || o[a]) {
                  if (!attributes[a].condition || attributes[a].condition(o)) {
                      attribute(o, a, attributes[a].type, attributes[a].message);
                      if (attributes[a].values) {
                          value(o[a], attributes[a].values, attributes[a].value_message);
                      }
                  }
              }
          }
      }
  }

  /**
   * Wrap `Array.isArray` Polyfill for IE9
   * source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray
   *
   * @param {Array} array
   * @private
   */
  function isArray(array) {
      if (this.supportsIsArray()) {
          return Array.isArray(array);
      }

      return toString.call(array) === '[object Array]';
  }

  function supportsIsArray() {
      return Array.isArray != null;
  }

  var assert = {
      check: check,
      attribute: attribute,
      variable: variable,
      value: value,
      isArray: isArray,
      supportsIsArray: supportsIsArray
  };

  const SDK_BASE_URL = 'http://localhost:3000';

  const PAGES = {
    main: SDK_BASE_URL,
    error: `${SDK_BASE_URL}/error`
  };

  function placeOrder(order_details, callback) {
    // try {
    //   assert.check(
    //     options,
    //     { type: 'object', message: 'clientData parameter is not valid' },
    //     {
    //       key: { type: 'string', message: 'key is required' },
    //       environment: {
    //         type: 'string',
    //         message: 'environment is required'
    //       }
    //     }
    //   );
    // } catch (err) {}

    this.order_details = order_details;

    if (
      !this.clientData ||
      !this.clientData.environment ||
      !this.clientData.key ||
      !order_details.productId ||
      !order_details.refId ||
      !order_details.animation
    ) {
      if (callback) {
        let url = `${PAGES.error}/Something went wrong!`;
        this.renderWithRetry({
          url,
          error: true
        });
        callback({ code: 400, message: 'Insuficiant data!' }, null);
      } else {
        throw new Error('callback function is required!');
      }
    } else {
      if (!callback) {
        throw new Error('callback function is required!');
      } else {
        let url = `${PAGES.main}`;
        // this.product_id = product_id;
        this.callback = callback;
        this.renderWithRetry({ url, error: false });
      }
    }
  }

  function receiveMessage(event) {
    console.log(this);

    if (event.origin == PAGES.main) {
      switch (event.data.type) {
        case 'CLOSE':
          this.close();
          break;
        case 'READY_TO_RECEIVE':
          this.prototype.sendMessage(
            {
              type: 'INITIAL_DATA',
              payload: {
                client_data: this.clientData,
                // product_id: this.product_id,
                order_details: this.order_details
              }
            },
            '*'
          );
          break;
        case 'READY_TO_RECEIVE_ERR':
          this.prototype.sendMessage(
            {
              type: 'INITIAL_DATA_ERR',
              payload: {
                email: this.order_details.prefill.name || '',
                phone: this.order_details.prefill.phone || ''
              }
            },
            '*'
          );
          break;
        case 'CREATED':
          this.callback(null, {
            code: 201,
            data: event.data.payload,
            message: 'Order placed successfully'
          });
          this.close();
          break;
        case 'ERROR':
          this.callback(
            {
              code: event.data.payload.code,
              message: event.data.payload.message
            },
            null
          );
          // this.close(); // should we close the modal on error ?
          break;
      }
    }
  }

  async function renderWithRetry({ url, error }) {
    const body = document.querySelector('body');

    const styleSheet = document.createElement('style');
    styleSheet.type = 'text/css';
    styleSheet.id = 'saas-sdk-style';
    styleSheet.innerText = `
    .flam-sdk-bg {
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;

      min-height: 100vh;
      min-width: 100vw;
      border: none;
      background: rgba(0,0,0, 0.4);

      display: flex;
      justify-content: center;
      align-items: center;
    }

    #flam-sdk-iframe {
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;

      min-height: 100vh;
      min-width: 100vw;
      border: none;
    }

    .flam-sdk-loading {
      display: inline-block;
      position: relative;
      width: 80px;
      height: 80px;
    }
    .flam-sdk-loading div {
      box-sizing: border-box;
      display: block;
      position: absolute;
      width: 64px;
      height: 64px;
      margin: 8px;
      border: 3px solid #000;
      border-radius: 50%;
      animation: flam-sdk-loading 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
      border-color: #000 transparent transparent transparent;
    }
    .flam-sdk-loading div:nth-child(1) {
      animation-delay: -0.45s;
    }
    .flam-sdk-loading div:nth-child(2) {
      animation-delay: -0.3s;
    }
    .flam-sdk-loading div:nth-child(3) {
      animation-delay: -0.15s;
    }
    @keyframes flam-sdk-loading {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }
  `;

    await document.head.appendChild(styleSheet);

    const UI = await document.createElement('div');
    UI.id = 'flam-sdk-wrapper';
    UI.innerHTML = `
      <div class="flam-sdk-ui" id="flam-sdk-ui">
        <div class="flam-sdk-bg" id="flam-sdk-bg">
          <div class="flam-sdk-loading" id="flam-sdk-loading"><div></div><div></div><div></div><div></div></div>
        </div>
        <iframe id="flam-sdk-iframe" style="opacity: 0" name="flam-sdk-iframe" src="${url}" style="opacity: 0"></iframe>
      </div>
    `;

    await body.appendChild(UI);

    const iFrame = document.getElementById('flam-sdk-iframe');

    // iFrame.contentWindow.addEventListener('error', e => {
    //   console.log('Iframe Error', e);
    // });

    iFrame.addEventListener('load', async e => {
      e.preventDefault();
      // console.log('Iframe Load', e);

      try {
        if (this.clientData.environment == 'production') {
          await fetch(PAGES.main);
        }

        // hide loading
        document.getElementById('flam-sdk-bg').style.display = 'none';

        // Bring the iframe back
        iFrame.style.opacity = '1';

        // for receiving messages from iframe
        window.addEventListener('message', res);

        // for sending messages to iframe
        this.iWindow = document.getElementById('flam-sdk-iframe').contentWindow;
      } catch (err) {
        if (err.message === 'Failed to fetch') {
          this.close();
          this.callback({
            code: 500,
            message: 'SDK down!'
          });
        }
      }
    });
  }

  function sendMessage(message) {
      this.iWindow.postMessage(message, "*");
  }

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

    /* eslint-enable */
    this.clientData = options;
    /* eslint-enable */
  }
  init.prototype.renderWithRetry = renderWithRetry;
  init.prototype.placeOrder = placeOrder;
  init.prototype.receiveMessage = receiveMessage.bind(init);
  init.prototype.sendMessage = sendMessage;
  init.prototype.close = close;
  init.prototype.trackOrder = trackOrder;

  const res = trackOrder.bind(init)();

  function trackOrder() {
    return this.prototype.receiveMessage;
  }

  var version = { raw: '0.0.1' };

  var index = { version: version, init: init };

  exports.default = index;
  exports.init = init;
  exports.version = version;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
