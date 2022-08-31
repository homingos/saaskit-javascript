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
    window.removeEventListener('message', e => this.receiveMessage(e));

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
    if (event.origin == PAGES.main) {
      switch (event.data.type) {
        case 'CLOSE':
          this.close();
          break;
        case 'READY_TO_RECEIVE':
          this.sendMessage(
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
          this.sendMessage(
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
        window.addEventListener('message', e => this.receiveMessage(e));

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
    console.log('THIS', this);
    this.iWindow.postMessage(message, '*');
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
          // name: { type: 'string', message: 'name is required' },
          // logoUrl: { type: 'string', message: 'logoUrl is required' },
          // email: { type: 'string', message: 'email is required' },
          // phone: { type: 'string', message: 'phone is required' }
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
    this.clientData = options;
    /* eslint-enable */
  }

  // core methods
  init.prototype.renderWithRetry = renderWithRetry;
  init.prototype.placeOrder = placeOrder;
  init.prototype.receiveMessage = receiveMessage;
  init.prototype.sendMessage = sendMessage;
  init.prototype.close = close;

  var version = { raw: '0.0.1' };

  var index = { version: version, init: init };

  exports.default = index;
  exports.init = init;
  exports.version = version;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRmxhbVNhYXNTREsuanMiLCJzb3VyY2VzIjpbIi4uL3NyYy9jbG9zZUlGcmFtZS5qcyIsIi4uL3NyYy9oZWxwZXIvYXNzZXJ0LmpzIiwiLi4vc3JjL2NvbnN0YW50cy5qcyIsIi4uL3NyYy9wbGFjZU9yZGVyLmpzIiwiLi4vc3JjL3JlY2VpdmVNZXNzYWdlLmpzIiwiLi4vc3JjL3JlbmRlcldpdGhSZXRyeS5qcyIsIi4uL3NyYy9zZW5kTWVzc2FnZS5qcyIsIi4uL3NyYy9zZGsuanMiLCIuLi9zcmMvdmVyc2lvbi5qcyIsIi4uL3NyYy9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjbG9zZSgpIHtcbiAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBlID0+IHRoaXMucmVjZWl2ZU1lc3NhZ2UoZSkpO1xuXG4gIC8vIHJlbW92ZSB0aGUgVUlcbiAgY29uc3QgZWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmbGFtLXNkay13cmFwcGVyJyk7XG4gIGlmIChlbGVtZW50KSB7XG4gICAgZWxlbWVudC5yZW1vdmUoKTtcbiAgfVxuXG4gIC8vIHJlbW92ZSB0aGUgc3R5bGVzXG4gIGNvbnN0IHN0eWxlU2hlZXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2Fhcy1zZGstc3R5bGUnKTtcblxuICBpZiAoc3R5bGVTaGVldCkge1xuICAgIHN0eWxlU2hlZXQucmVtb3ZlKCk7XG4gIH1cbn1cbiIsInZhciB0b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5cbmZ1bmN0aW9uIGF0dHJpYnV0ZShvLCBhdHRyLCB0eXBlLCB0ZXh0KSB7XG4gICAgdHlwZSA9IHR5cGUgPT09ICdhcnJheScgPyAnb2JqZWN0JyA6IHR5cGU7XG4gICAgaWYgKG8gJiYgdHlwZW9mIG9bYXR0cl0gIT09IHR5cGUpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKHRleHQpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gdmFyaWFibGUobywgdHlwZSwgdGV4dCkge1xuICAgIGlmICh0eXBlb2YgbyAhPT0gdHlwZSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IodGV4dCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiB2YWx1ZShvLCB2YWx1ZXMsIHRleHQpIHtcbiAgICBpZiAodmFsdWVzLmluZGV4T2YobykgPT09IC0xKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcih0ZXh0KTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGNoZWNrKG8sIGNvbmZpZywgYXR0cmlidXRlcykge1xuICAgIGlmICghY29uZmlnLm9wdGlvbmFsIHx8IG8pIHtcbiAgICAgICAgdmFyaWFibGUobywgY29uZmlnLnR5cGUsIGNvbmZpZy5tZXNzYWdlKTtcbiAgICB9XG4gICAgaWYgKGNvbmZpZy50eXBlID09PSAnb2JqZWN0JyAmJiBhdHRyaWJ1dGVzKSB7XG4gICAgICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMoYXR0cmlidXRlcyk7XG5cbiAgICAgICAgZm9yICh2YXIgaW5kZXggPSAwOyBpbmRleCA8IGtleXMubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgICAgICB2YXIgYSA9IGtleXNbaW5kZXhdO1xuICAgICAgICAgICAgaWYgKCFhdHRyaWJ1dGVzW2FdLm9wdGlvbmFsIHx8IG9bYV0pIHtcbiAgICAgICAgICAgICAgICBpZiAoIWF0dHJpYnV0ZXNbYV0uY29uZGl0aW9uIHx8IGF0dHJpYnV0ZXNbYV0uY29uZGl0aW9uKG8pKSB7XG4gICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZShvLCBhLCBhdHRyaWJ1dGVzW2FdLnR5cGUsIGF0dHJpYnV0ZXNbYV0ubWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChhdHRyaWJ1dGVzW2FdLnZhbHVlcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUob1thXSwgYXR0cmlidXRlc1thXS52YWx1ZXMsIGF0dHJpYnV0ZXNbYV0udmFsdWVfbWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8qKlxuICogV3JhcCBgQXJyYXkuaXNBcnJheWAgUG9seWZpbGwgZm9yIElFOVxuICogc291cmNlOiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9BcnJheS9pc0FycmF5XG4gKlxuICogQHBhcmFtIHtBcnJheX0gYXJyYXlcbiAqIEBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIGlzQXJyYXkoYXJyYXkpIHtcbiAgICBpZiAodGhpcy5zdXBwb3J0c0lzQXJyYXkoKSkge1xuICAgICAgICByZXR1cm4gQXJyYXkuaXNBcnJheShhcnJheSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRvU3RyaW5nLmNhbGwoYXJyYXkpID09PSAnW29iamVjdCBBcnJheV0nO1xufVxuXG5mdW5jdGlvbiBzdXBwb3J0c0lzQXJyYXkoKSB7XG4gICAgcmV0dXJuIEFycmF5LmlzQXJyYXkgIT0gbnVsbDtcbn1cblxuZXhwb3J0IGRlZmF1bHQge1xuICAgIGNoZWNrOiBjaGVjayxcbiAgICBhdHRyaWJ1dGU6IGF0dHJpYnV0ZSxcbiAgICB2YXJpYWJsZTogdmFyaWFibGUsXG4gICAgdmFsdWU6IHZhbHVlLFxuICAgIGlzQXJyYXk6IGlzQXJyYXksXG4gICAgc3VwcG9ydHNJc0FycmF5OiBzdXBwb3J0c0lzQXJyYXlcbn07IiwiY29uc3QgU0RLX0JBU0VfVVJMID0gJ2h0dHA6Ly9sb2NhbGhvc3Q6MzAwMCc7XG5cbmV4cG9ydCBjb25zdCBQQUdFUyA9IHtcbiAgbWFpbjogU0RLX0JBU0VfVVJMLFxuICBlcnJvcjogYCR7U0RLX0JBU0VfVVJMfS9lcnJvcmBcbn07XG4iLCJpbXBvcnQgeyBQQUdFUyB9IGZyb20gJy4vY29uc3RhbnRzJztcbmltcG9ydCBhc3NlcnQgZnJvbSAnLi9oZWxwZXIvYXNzZXJ0JztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcGxhY2VPcmRlcihvcmRlcl9kZXRhaWxzLCBjYWxsYmFjaykge1xuICAvLyB0cnkge1xuICAvLyAgIGFzc2VydC5jaGVjayhcbiAgLy8gICAgIG9wdGlvbnMsXG4gIC8vICAgICB7IHR5cGU6ICdvYmplY3QnLCBtZXNzYWdlOiAnY2xpZW50RGF0YSBwYXJhbWV0ZXIgaXMgbm90IHZhbGlkJyB9LFxuICAvLyAgICAge1xuICAvLyAgICAgICBrZXk6IHsgdHlwZTogJ3N0cmluZycsIG1lc3NhZ2U6ICdrZXkgaXMgcmVxdWlyZWQnIH0sXG4gIC8vICAgICAgIGVudmlyb25tZW50OiB7XG4gIC8vICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gIC8vICAgICAgICAgbWVzc2FnZTogJ2Vudmlyb25tZW50IGlzIHJlcXVpcmVkJ1xuICAvLyAgICAgICB9XG4gIC8vICAgICB9XG4gIC8vICAgKTtcbiAgLy8gfSBjYXRjaCAoZXJyKSB7fVxuXG4gIHRoaXMub3JkZXJfZGV0YWlscyA9IG9yZGVyX2RldGFpbHM7XG5cbiAgaWYgKFxuICAgICF0aGlzLmNsaWVudERhdGEgfHxcbiAgICAhdGhpcy5jbGllbnREYXRhLmVudmlyb25tZW50IHx8XG4gICAgIXRoaXMuY2xpZW50RGF0YS5rZXkgfHxcbiAgICAhb3JkZXJfZGV0YWlscy5wcm9kdWN0SWQgfHxcbiAgICAhb3JkZXJfZGV0YWlscy5yZWZJZCB8fFxuICAgICFvcmRlcl9kZXRhaWxzLmFuaW1hdGlvblxuICApIHtcbiAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgIGxldCB1cmwgPSBgJHtQQUdFUy5lcnJvcn0vU29tZXRoaW5nIHdlbnQgd3JvbmchYDtcbiAgICAgIHRoaXMucmVuZGVyV2l0aFJldHJ5KHtcbiAgICAgICAgdXJsLFxuICAgICAgICBlcnJvcjogdHJ1ZVxuICAgICAgfSk7XG4gICAgICBjYWxsYmFjayh7IGNvZGU6IDQwMCwgbWVzc2FnZTogJ0luc3VmaWNpYW50IGRhdGEhJyB9LCBudWxsKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdjYWxsYmFjayBmdW5jdGlvbiBpcyByZXF1aXJlZCEnKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgaWYgKCFjYWxsYmFjaykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdjYWxsYmFjayBmdW5jdGlvbiBpcyByZXF1aXJlZCEnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IHVybCA9IGAke1BBR0VTLm1haW59YDtcbiAgICAgIC8vIHRoaXMucHJvZHVjdF9pZCA9IHByb2R1Y3RfaWQ7XG4gICAgICB0aGlzLmNhbGxiYWNrID0gY2FsbGJhY2s7XG4gICAgICB0aGlzLnJlbmRlcldpdGhSZXRyeSh7IHVybCwgZXJyb3I6IGZhbHNlIH0pO1xuICAgIH1cbiAgfVxufVxuIiwiaW1wb3J0IHsgUEFHRVMgfSBmcm9tICcuL2NvbnN0YW50cyc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHJlY2VpdmVNZXNzYWdlKGV2ZW50KSB7XG4gIGlmIChldmVudC5vcmlnaW4gPT0gUEFHRVMubWFpbikge1xuICAgIHN3aXRjaCAoZXZlbnQuZGF0YS50eXBlKSB7XG4gICAgICBjYXNlICdDTE9TRSc6XG4gICAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdSRUFEWV9UT19SRUNFSVZFJzpcbiAgICAgICAgdGhpcy5zZW5kTWVzc2FnZShcbiAgICAgICAgICB7XG4gICAgICAgICAgICB0eXBlOiAnSU5JVElBTF9EQVRBJyxcbiAgICAgICAgICAgIHBheWxvYWQ6IHtcbiAgICAgICAgICAgICAgY2xpZW50X2RhdGE6IHRoaXMuY2xpZW50RGF0YSxcbiAgICAgICAgICAgICAgLy8gcHJvZHVjdF9pZDogdGhpcy5wcm9kdWN0X2lkLFxuICAgICAgICAgICAgICBvcmRlcl9kZXRhaWxzOiB0aGlzLm9yZGVyX2RldGFpbHNcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgICcqJ1xuICAgICAgICApO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ1JFQURZX1RPX1JFQ0VJVkVfRVJSJzpcbiAgICAgICAgdGhpcy5zZW5kTWVzc2FnZShcbiAgICAgICAgICB7XG4gICAgICAgICAgICB0eXBlOiAnSU5JVElBTF9EQVRBX0VSUicsXG4gICAgICAgICAgICBwYXlsb2FkOiB7XG4gICAgICAgICAgICAgIGVtYWlsOiB0aGlzLm9yZGVyX2RldGFpbHMucHJlZmlsbC5uYW1lIHx8ICcnLFxuICAgICAgICAgICAgICBwaG9uZTogdGhpcy5vcmRlcl9kZXRhaWxzLnByZWZpbGwucGhvbmUgfHwgJydcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgICcqJ1xuICAgICAgICApO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ0NSRUFURUQnOlxuICAgICAgICB0aGlzLmNhbGxiYWNrKG51bGwsIHtcbiAgICAgICAgICBjb2RlOiAyMDEsXG4gICAgICAgICAgZGF0YTogZXZlbnQuZGF0YS5wYXlsb2FkLFxuICAgICAgICAgIG1lc3NhZ2U6ICdPcmRlciBwbGFjZWQgc3VjY2Vzc2Z1bGx5J1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5jbG9zZSgpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ0VSUk9SJzpcbiAgICAgICAgdGhpcy5jYWxsYmFjayhcbiAgICAgICAgICB7XG4gICAgICAgICAgICBjb2RlOiBldmVudC5kYXRhLnBheWxvYWQuY29kZSxcbiAgICAgICAgICAgIG1lc3NhZ2U6IGV2ZW50LmRhdGEucGF5bG9hZC5tZXNzYWdlXG4gICAgICAgICAgfSxcbiAgICAgICAgICBudWxsXG4gICAgICAgICk7XG4gICAgICAgIC8vIHRoaXMuY2xvc2UoKTsgLy8gc2hvdWxkIHdlIGNsb3NlIHRoZSBtb2RhbCBvbiBlcnJvciA/XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxufVxuIiwiaW1wb3J0IHsgUEFHRVMgfSBmcm9tICcuL2NvbnN0YW50cyc7XG5cbmV4cG9ydCBkZWZhdWx0IGFzeW5jIGZ1bmN0aW9uIHJlbmRlcldpdGhSZXRyeSh7IHVybCwgZXJyb3IgfSkge1xuICBjb25zdCBib2R5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpO1xuXG4gIGNvbnN0IHN0eWxlU2hlZXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuICBzdHlsZVNoZWV0LnR5cGUgPSAndGV4dC9jc3MnO1xuICBzdHlsZVNoZWV0LmlkID0gJ3NhYXMtc2RrLXN0eWxlJztcbiAgc3R5bGVTaGVldC5pbm5lclRleHQgPSBgXG4gICAgLmZsYW0tc2RrLWJnIHtcbiAgICAgIHBvc2l0aW9uOiBmaXhlZDtcbiAgICAgIHRvcDogMDtcbiAgICAgIHJpZ2h0OiAwO1xuICAgICAgYm90dG9tOiAwO1xuICAgICAgbGVmdDogMDtcblxuICAgICAgbWluLWhlaWdodDogMTAwdmg7XG4gICAgICBtaW4td2lkdGg6IDEwMHZ3O1xuICAgICAgYm9yZGVyOiBub25lO1xuICAgICAgYmFja2dyb3VuZDogcmdiYSgwLDAsMCwgMC40KTtcblxuICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICB9XG5cbiAgICAjZmxhbS1zZGstaWZyYW1lIHtcbiAgICAgIHBvc2l0aW9uOiBmaXhlZDtcbiAgICAgIHRvcDogMDtcbiAgICAgIHJpZ2h0OiAwO1xuICAgICAgYm90dG9tOiAwO1xuICAgICAgbGVmdDogMDtcblxuICAgICAgbWluLWhlaWdodDogMTAwdmg7XG4gICAgICBtaW4td2lkdGg6IDEwMHZ3O1xuICAgICAgYm9yZGVyOiBub25lO1xuICAgIH1cblxuICAgIC5mbGFtLXNkay1sb2FkaW5nIHtcbiAgICAgIGRpc3BsYXk6IGlubGluZS1ibG9jaztcbiAgICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgICAgIHdpZHRoOiA4MHB4O1xuICAgICAgaGVpZ2h0OiA4MHB4O1xuICAgIH1cbiAgICAuZmxhbS1zZGstbG9hZGluZyBkaXYge1xuICAgICAgYm94LXNpemluZzogYm9yZGVyLWJveDtcbiAgICAgIGRpc3BsYXk6IGJsb2NrO1xuICAgICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgICAgd2lkdGg6IDY0cHg7XG4gICAgICBoZWlnaHQ6IDY0cHg7XG4gICAgICBtYXJnaW46IDhweDtcbiAgICAgIGJvcmRlcjogM3B4IHNvbGlkICMwMDA7XG4gICAgICBib3JkZXItcmFkaXVzOiA1MCU7XG4gICAgICBhbmltYXRpb246IGZsYW0tc2RrLWxvYWRpbmcgMS4ycyBjdWJpYy1iZXppZXIoMC41LCAwLCAwLjUsIDEpIGluZmluaXRlO1xuICAgICAgYm9yZGVyLWNvbG9yOiAjMDAwIHRyYW5zcGFyZW50IHRyYW5zcGFyZW50IHRyYW5zcGFyZW50O1xuICAgIH1cbiAgICAuZmxhbS1zZGstbG9hZGluZyBkaXY6bnRoLWNoaWxkKDEpIHtcbiAgICAgIGFuaW1hdGlvbi1kZWxheTogLTAuNDVzO1xuICAgIH1cbiAgICAuZmxhbS1zZGstbG9hZGluZyBkaXY6bnRoLWNoaWxkKDIpIHtcbiAgICAgIGFuaW1hdGlvbi1kZWxheTogLTAuM3M7XG4gICAgfVxuICAgIC5mbGFtLXNkay1sb2FkaW5nIGRpdjpudGgtY2hpbGQoMykge1xuICAgICAgYW5pbWF0aW9uLWRlbGF5OiAtMC4xNXM7XG4gICAgfVxuICAgIEBrZXlmcmFtZXMgZmxhbS1zZGstbG9hZGluZyB7XG4gICAgICAwJSB7XG4gICAgICAgIHRyYW5zZm9ybTogcm90YXRlKDBkZWcpO1xuICAgICAgfVxuICAgICAgMTAwJSB7XG4gICAgICAgIHRyYW5zZm9ybTogcm90YXRlKDM2MGRlZyk7XG4gICAgICB9XG4gICAgfVxuICBgO1xuXG4gIGF3YWl0IGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoc3R5bGVTaGVldCk7XG5cbiAgY29uc3QgVUkgPSBhd2FpdCBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgVUkuaWQgPSAnZmxhbS1zZGstd3JhcHBlcic7XG4gIFVJLmlubmVySFRNTCA9IGBcbiAgICAgIDxkaXYgY2xhc3M9XCJmbGFtLXNkay11aVwiIGlkPVwiZmxhbS1zZGstdWlcIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImZsYW0tc2RrLWJnXCIgaWQ9XCJmbGFtLXNkay1iZ1wiPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJmbGFtLXNkay1sb2FkaW5nXCIgaWQ9XCJmbGFtLXNkay1sb2FkaW5nXCI+PGRpdj48L2Rpdj48ZGl2PjwvZGl2PjxkaXY+PC9kaXY+PGRpdj48L2Rpdj48L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxpZnJhbWUgaWQ9XCJmbGFtLXNkay1pZnJhbWVcIiBzdHlsZT1cIm9wYWNpdHk6IDBcIiBuYW1lPVwiZmxhbS1zZGstaWZyYW1lXCIgc3JjPVwiJHt1cmx9XCIgc3R5bGU9XCJvcGFjaXR5OiAwXCI+PC9pZnJhbWU+XG4gICAgICA8L2Rpdj5cbiAgICBgO1xuXG4gIGF3YWl0IGJvZHkuYXBwZW5kQ2hpbGQoVUkpO1xuXG4gIGNvbnN0IGlGcmFtZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmbGFtLXNkay1pZnJhbWUnKTtcblxuICAvLyBpRnJhbWUuY29udGVudFdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsIGUgPT4ge1xuICAvLyAgIGNvbnNvbGUubG9nKCdJZnJhbWUgRXJyb3InLCBlKTtcbiAgLy8gfSk7XG5cbiAgaUZyYW1lLmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBhc3luYyBlID0+IHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgLy8gY29uc29sZS5sb2coJ0lmcmFtZSBMb2FkJywgZSk7XG5cbiAgICB0cnkge1xuICAgICAgaWYgKHRoaXMuY2xpZW50RGF0YS5lbnZpcm9ubWVudCA9PSAncHJvZHVjdGlvbicpIHtcbiAgICAgICAgYXdhaXQgZmV0Y2goUEFHRVMubWFpbik7XG4gICAgICB9XG5cbiAgICAgIC8vIGhpZGUgbG9hZGluZ1xuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZsYW0tc2RrLWJnJykuc3R5bGUuZGlzcGxheSA9ICdub25lJztcblxuICAgICAgLy8gQnJpbmcgdGhlIGlmcmFtZSBiYWNrXG4gICAgICBpRnJhbWUuc3R5bGUub3BhY2l0eSA9ICcxJztcblxuICAgICAgLy8gZm9yIHJlY2VpdmluZyBtZXNzYWdlcyBmcm9tIGlmcmFtZVxuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBlID0+IHRoaXMucmVjZWl2ZU1lc3NhZ2UoZSkpO1xuXG4gICAgICAvLyBmb3Igc2VuZGluZyBtZXNzYWdlcyB0byBpZnJhbWVcbiAgICAgIHRoaXMuaVdpbmRvdyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmbGFtLXNkay1pZnJhbWUnKS5jb250ZW50V2luZG93O1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgaWYgKGVyci5tZXNzYWdlID09PSAnRmFpbGVkIHRvIGZldGNoJykge1xuICAgICAgICB0aGlzLmNsb3NlKCk7XG4gICAgICAgIHRoaXMuY2FsbGJhY2soe1xuICAgICAgICAgIGNvZGU6IDUwMCxcbiAgICAgICAgICBtZXNzYWdlOiAnU0RLIGRvd24hJ1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gc2VuZE1lc3NhZ2UobWVzc2FnZSkge1xuICBjb25zb2xlLmxvZygnVEhJUycsIHRoaXMpO1xuICB0aGlzLmlXaW5kb3cucG9zdE1lc3NhZ2UobWVzc2FnZSwgJyonKTtcbn1cbiIsImltcG9ydCBjbG9zZUlmcmFtZSBmcm9tICcuL2Nsb3NlSUZyYW1lJztcbmltcG9ydCBhc3NlcnQgZnJvbSAnLi9oZWxwZXIvYXNzZXJ0JztcbmltcG9ydCBwbGFjZU9yZGVyIGZyb20gJy4vcGxhY2VPcmRlcic7XG5pbXBvcnQgcmVjZWl2ZU1lc3NhZ2UgZnJvbSAnLi9yZWNlaXZlTWVzc2FnZSc7XG5pbXBvcnQgcmVuZGVyV2l0aFJldHJ5IGZyb20gJy4vcmVuZGVyV2l0aFJldHJ5JztcbmltcG9ydCBzZW5kTWVzc2FnZSBmcm9tICcuL3NlbmRNZXNzYWdlJztcblxuLyoqXG4gKiBIYW5kbGVzIGFsbCB0aGUgYnJvd3NlcidzIEF1dGhOL0F1dGhaIGZsb3dzXG4gKiBAY29uc3RydWN0b3JcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiBAcGFyYW0ge1N0cmluZ30gb3B0aW9ucy5rZXkgdGhlIEFQSSBLZXkgZm91bmQgb24geW91ciBBcHBsaWNhdGlvbiBzZXR0aW5ncyBwYWdlXG4gKiBAcGFyYW0ge1N0cmluZ30gW29wdGlvbnMuZW52aXJvbm1lbnRdIGVudmlvcm5tZW50IHNhbmRib3ggfCBwcm9kdWN0aW9uXG4gKiBAcGFyYW0ge1N0cmluZ30gW29wdGlvbnMubmFtZV0gbmFtZSBvZiBjbGllbnRcbiAqIEBwYXJhbSB7U3RyaW5nfSBbb3B0aW9ucy5sb2dvVXJsXSBjbGllbnQncyBicmFuZCBsb2dvIHVybFxuICogQHBhcmFtIHtTdHJpbmd9IFtvcHRpb25zLmVtYWlsXSBjbGllbnQncyBzdXBwb3J0IGVtYWlsIGZvciBlcnJvciBwYWdlXG4gKiBAcGFyYW0ge1N0cmluZ30gW29wdGlvbnMucGhvbmVdIGNsaWVudCdzIHN1cHBvcnQgcGhvbmUgZm9yIGVycm9yIHBhZ2VcbiAqL1xuZnVuY3Rpb24gaW5pdChvcHRpb25zKSB7XG4gIC8qIGVzbGludC1kaXNhYmxlICovXG4gIHRyeSB7XG4gICAgYXNzZXJ0LmNoZWNrKFxuICAgICAgb3B0aW9ucyxcbiAgICAgIHsgdHlwZTogJ29iamVjdCcsIG1lc3NhZ2U6ICdjbGllbnREYXRhIHBhcmFtZXRlciBpcyBub3QgdmFsaWQnIH0sXG4gICAgICB7XG4gICAgICAgIGtleTogeyB0eXBlOiAnc3RyaW5nJywgbWVzc2FnZTogJ2tleSBpcyByZXF1aXJlZCcgfSxcbiAgICAgICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICBtZXNzYWdlOiAnZW52aXJvbm1lbnQgaXMgcmVxdWlyZWQnXG4gICAgICAgIH1cbiAgICAgICAgLy8gbmFtZTogeyB0eXBlOiAnc3RyaW5nJywgbWVzc2FnZTogJ25hbWUgaXMgcmVxdWlyZWQnIH0sXG4gICAgICAgIC8vIGxvZ29Vcmw6IHsgdHlwZTogJ3N0cmluZycsIG1lc3NhZ2U6ICdsb2dvVXJsIGlzIHJlcXVpcmVkJyB9LFxuICAgICAgICAvLyBlbWFpbDogeyB0eXBlOiAnc3RyaW5nJywgbWVzc2FnZTogJ2VtYWlsIGlzIHJlcXVpcmVkJyB9LFxuICAgICAgICAvLyBwaG9uZTogeyB0eXBlOiAnc3RyaW5nJywgbWVzc2FnZTogJ3Bob25lIGlzIHJlcXVpcmVkJyB9XG4gICAgICB9XG4gICAgKTtcblxuICAgIGlmIChvcHRpb25zLm92ZXJyaWRlcykge1xuICAgICAgYXNzZXJ0LmNoZWNrKG9wdGlvbnMub3ZlcnJpZGVzLCB7XG4gICAgICAgIHR5cGU6ICdvYmplY3QnLFxuICAgICAgICBtZXNzYWdlOiAnb3ZlcnJpZGVzIG9wdGlvbiBpcyBub3QgdmFsaWQnXG4gICAgICB9KTtcbiAgICB9XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIHRocm93IG5ldyBFcnJvcihlcnIubWVzc2FnZSk7XG4gIH1cbiAgdGhpcy5jbGllbnREYXRhID0gb3B0aW9ucztcbiAgLyogZXNsaW50LWVuYWJsZSAqL1xufVxuXG4vLyBjb3JlIG1ldGhvZHNcbmluaXQucHJvdG90eXBlLnJlbmRlcldpdGhSZXRyeSA9IHJlbmRlcldpdGhSZXRyeTtcbmluaXQucHJvdG90eXBlLnBsYWNlT3JkZXIgPSBwbGFjZU9yZGVyO1xuaW5pdC5wcm90b3R5cGUucmVjZWl2ZU1lc3NhZ2UgPSByZWNlaXZlTWVzc2FnZTtcbmluaXQucHJvdG90eXBlLnNlbmRNZXNzYWdlID0gc2VuZE1lc3NhZ2U7XG5pbml0LnByb3RvdHlwZS5jbG9zZSA9IGNsb3NlSWZyYW1lO1xuXG5leHBvcnQgZGVmYXVsdCBpbml0O1xuIiwibW9kdWxlLmV4cG9ydHMgPSB7IHJhdzogJzAuMC4xJyB9OyIsImltcG9ydCBpbml0IGZyb20gJy4vc2RrJztcbmltcG9ydCB2ZXJzaW9uIGZyb20gJy4vdmVyc2lvbic7XG5cbmV4cG9ydCB7IHZlcnNpb24sIGluaXQgfTtcblxuZXhwb3J0IGRlZmF1bHQgeyB2ZXJzaW9uOiB2ZXJzaW9uLCBpbml0OiBpbml0IH07XG4iXSwibmFtZXMiOlsiY2xvc2VJZnJhbWUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7RUFBZSxTQUFTLEtBQUssR0FBRztFQUNoQyxFQUFFLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxJQUFJLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNyRTtFQUNBO0VBQ0EsRUFBRSxNQUFNLE9BQU8sR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLGtCQUFrQixDQUFDLENBQUM7RUFDOUQsRUFBRSxJQUFJLE9BQU8sRUFBRTtFQUNmLElBQUksT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDO0VBQ3JCLEdBQUc7QUFDSDtFQUNBO0VBQ0EsRUFBRSxNQUFNLFVBQVUsR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLGdCQUFnQixDQUFDLENBQUM7QUFDL0Q7RUFDQSxFQUFFLElBQUksVUFBVSxFQUFFO0VBQ2xCLElBQUksVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDO0VBQ3hCLEdBQUc7RUFDSDs7RUNmQSxJQUFJLFFBQVEsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQztBQUN6QztFQUNBLFNBQVMsU0FBUyxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRTtFQUN4QyxJQUFJLElBQUksR0FBRyxJQUFJLEtBQUssT0FBTyxHQUFHLFFBQVEsR0FBRyxJQUFJLENBQUM7RUFDOUMsSUFBSSxJQUFJLENBQUMsSUFBSSxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxJQUFJLEVBQUU7RUFDdEMsUUFBUSxNQUFNLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0VBQzlCLEtBQUs7RUFDTCxDQUFDO0FBQ0Q7RUFDQSxTQUFTLFFBQVEsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRTtFQUNqQyxJQUFJLElBQUksT0FBTyxDQUFDLEtBQUssSUFBSSxFQUFFO0VBQzNCLFFBQVEsTUFBTSxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztFQUM5QixLQUFLO0VBQ0wsQ0FBQztBQUNEO0VBQ0EsU0FBUyxLQUFLLENBQUMsQ0FBQyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUU7RUFDaEMsSUFBSSxJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUU7RUFDbEMsUUFBUSxNQUFNLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0VBQzlCLEtBQUs7RUFDTCxDQUFDO0FBQ0Q7RUFDQSxTQUFTLEtBQUssQ0FBQyxDQUFDLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRTtFQUN0QyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxJQUFJLENBQUMsRUFBRTtFQUMvQixRQUFRLFFBQVEsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7RUFDakQsS0FBSztFQUNMLElBQUksSUFBSSxNQUFNLENBQUMsSUFBSSxLQUFLLFFBQVEsSUFBSSxVQUFVLEVBQUU7RUFDaEQsUUFBUSxJQUFJLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQzNDO0VBQ0EsUUFBUSxLQUFLLElBQUksS0FBSyxHQUFHLENBQUMsRUFBRSxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsRUFBRTtFQUMxRCxZQUFZLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztFQUNoQyxZQUFZLElBQUksQ0FBQyxVQUFV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
