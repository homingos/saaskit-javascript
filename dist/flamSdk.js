/**
 * flamsdk v0.0.1
 * Author: bucharitesh
 * Date: 2022-08-31
 * License: MIT
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.flamSdk = {}));
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
    /* eslint-enable */
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmxhbVNkay5qcyIsInNvdXJjZXMiOlsiLi4vc3JjL2Nsb3NlSUZyYW1lLmpzIiwiLi4vc3JjL2hlbHBlci9hc3NlcnQuanMiLCIuLi9zcmMvY29uc3RhbnRzLmpzIiwiLi4vc3JjL3BsYWNlT3JkZXIuanMiLCIuLi9zcmMvcmVjZWl2ZU1lc3NhZ2UuanMiLCIuLi9zcmMvcmVuZGVyV2l0aFJldHJ5LmpzIiwiLi4vc3JjL3NlbmRNZXNzYWdlLmpzIiwiLi4vc3JjL3Nkay5qcyIsIi4uL3NyYy92ZXJzaW9uLmpzIiwiLi4vc3JjL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGNsb3NlKCkge1xuICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGUgPT4gdGhpcy5yZWNlaXZlTWVzc2FnZShlKSk7XG5cbiAgLy8gcmVtb3ZlIHRoZSBVSVxuICBjb25zdCBlbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZsYW0tc2RrLXdyYXBwZXInKTtcbiAgaWYgKGVsZW1lbnQpIHtcbiAgICBlbGVtZW50LnJlbW92ZSgpO1xuICB9XG5cbiAgLy8gcmVtb3ZlIHRoZSBzdHlsZXNcbiAgY29uc3Qgc3R5bGVTaGVldCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzYWFzLXNkay1zdHlsZScpO1xuXG4gIGlmIChzdHlsZVNoZWV0KSB7XG4gICAgc3R5bGVTaGVldC5yZW1vdmUoKTtcbiAgfVxufVxuIiwidmFyIHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxuZnVuY3Rpb24gYXR0cmlidXRlKG8sIGF0dHIsIHR5cGUsIHRleHQpIHtcbiAgICB0eXBlID0gdHlwZSA9PT0gJ2FycmF5JyA/ICdvYmplY3QnIDogdHlwZTtcbiAgICBpZiAobyAmJiB0eXBlb2Ygb1thdHRyXSAhPT0gdHlwZSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IodGV4dCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiB2YXJpYWJsZShvLCB0eXBlLCB0ZXh0KSB7XG4gICAgaWYgKHR5cGVvZiBvICE9PSB0eXBlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcih0ZXh0KTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHZhbHVlKG8sIHZhbHVlcywgdGV4dCkge1xuICAgIGlmICh2YWx1ZXMuaW5kZXhPZihvKSA9PT0gLTEpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKHRleHQpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gY2hlY2sobywgY29uZmlnLCBhdHRyaWJ1dGVzKSB7XG4gICAgaWYgKCFjb25maWcub3B0aW9uYWwgfHwgbykge1xuICAgICAgICB2YXJpYWJsZShvLCBjb25maWcudHlwZSwgY29uZmlnLm1lc3NhZ2UpO1xuICAgIH1cbiAgICBpZiAoY29uZmlnLnR5cGUgPT09ICdvYmplY3QnICYmIGF0dHJpYnV0ZXMpIHtcbiAgICAgICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhhdHRyaWJ1dGVzKTtcblxuICAgICAgICBmb3IgKHZhciBpbmRleCA9IDA7IGluZGV4IDwga2V5cy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgICAgIHZhciBhID0ga2V5c1tpbmRleF07XG4gICAgICAgICAgICBpZiAoIWF0dHJpYnV0ZXNbYV0ub3B0aW9uYWwgfHwgb1thXSkge1xuICAgICAgICAgICAgICAgIGlmICghYXR0cmlidXRlc1thXS5jb25kaXRpb24gfHwgYXR0cmlidXRlc1thXS5jb25kaXRpb24obykpIHtcbiAgICAgICAgICAgICAgICAgICAgYXR0cmlidXRlKG8sIGEsIGF0dHJpYnV0ZXNbYV0udHlwZSwgYXR0cmlidXRlc1thXS5tZXNzYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGF0dHJpYnV0ZXNbYV0udmFsdWVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZShvW2FdLCBhdHRyaWJ1dGVzW2FdLnZhbHVlcywgYXR0cmlidXRlc1thXS52YWx1ZV9tZXNzYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cblxuLyoqXG4gKiBXcmFwIGBBcnJheS5pc0FycmF5YCBQb2x5ZmlsbCBmb3IgSUU5XG4gKiBzb3VyY2U6IGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL0FycmF5L2lzQXJyYXlcbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBhcnJheVxuICogQHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gaXNBcnJheShhcnJheSkge1xuICAgIGlmICh0aGlzLnN1cHBvcnRzSXNBcnJheSgpKSB7XG4gICAgICAgIHJldHVybiBBcnJheS5pc0FycmF5KGFycmF5KTtcbiAgICB9XG5cbiAgICByZXR1cm4gdG9TdHJpbmcuY2FsbChhcnJheSkgPT09ICdbb2JqZWN0IEFycmF5XSc7XG59XG5cbmZ1bmN0aW9uIHN1cHBvcnRzSXNBcnJheSgpIHtcbiAgICByZXR1cm4gQXJyYXkuaXNBcnJheSAhPSBudWxsO1xufVxuXG5leHBvcnQgZGVmYXVsdCB7XG4gICAgY2hlY2s6IGNoZWNrLFxuICAgIGF0dHJpYnV0ZTogYXR0cmlidXRlLFxuICAgIHZhcmlhYmxlOiB2YXJpYWJsZSxcbiAgICB2YWx1ZTogdmFsdWUsXG4gICAgaXNBcnJheTogaXNBcnJheSxcbiAgICBzdXBwb3J0c0lzQXJyYXk6IHN1cHBvcnRzSXNBcnJheVxufTsiLCJjb25zdCBTREtfQkFTRV9VUkwgPSAnaHR0cDovL2xvY2FsaG9zdDozMDAwJztcblxuZXhwb3J0IGNvbnN0IFBBR0VTID0ge1xuICBtYWluOiBTREtfQkFTRV9VUkwsXG4gIGVycm9yOiBgJHtTREtfQkFTRV9VUkx9L2Vycm9yYFxufTtcbiIsImltcG9ydCB7IFBBR0VTIH0gZnJvbSAnLi9jb25zdGFudHMnO1xuaW1wb3J0IGFzc2VydCBmcm9tICcuL2hlbHBlci9hc3NlcnQnO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBwbGFjZU9yZGVyKG9yZGVyX2RldGFpbHMsIGNhbGxiYWNrKSB7XG4gIC8vIHRyeSB7XG4gIC8vICAgYXNzZXJ0LmNoZWNrKFxuICAvLyAgICAgb3B0aW9ucyxcbiAgLy8gICAgIHsgdHlwZTogJ29iamVjdCcsIG1lc3NhZ2U6ICdjbGllbnREYXRhIHBhcmFtZXRlciBpcyBub3QgdmFsaWQnIH0sXG4gIC8vICAgICB7XG4gIC8vICAgICAgIGtleTogeyB0eXBlOiAnc3RyaW5nJywgbWVzc2FnZTogJ2tleSBpcyByZXF1aXJlZCcgfSxcbiAgLy8gICAgICAgZW52aXJvbm1lbnQ6IHtcbiAgLy8gICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgLy8gICAgICAgICBtZXNzYWdlOiAnZW52aXJvbm1lbnQgaXMgcmVxdWlyZWQnXG4gIC8vICAgICAgIH1cbiAgLy8gICAgIH1cbiAgLy8gICApO1xuICAvLyB9IGNhdGNoIChlcnIpIHt9XG5cbiAgdGhpcy5vcmRlcl9kZXRhaWxzID0gb3JkZXJfZGV0YWlscztcblxuICBpZiAoXG4gICAgIXRoaXMuY2xpZW50RGF0YSB8fFxuICAgICF0aGlzLmNsaWVudERhdGEuZW52aXJvbm1lbnQgfHxcbiAgICAhdGhpcy5jbGllbnREYXRhLmtleSB8fFxuICAgICFvcmRlcl9kZXRhaWxzLnByb2R1Y3RJZCB8fFxuICAgICFvcmRlcl9kZXRhaWxzLnJlZklkIHx8XG4gICAgIW9yZGVyX2RldGFpbHMuYW5pbWF0aW9uXG4gICkge1xuICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgbGV0IHVybCA9IGAke1BBR0VTLmVycm9yfS9Tb21ldGhpbmcgd2VudCB3cm9uZyFgO1xuICAgICAgdGhpcy5yZW5kZXJXaXRoUmV0cnkoe1xuICAgICAgICB1cmwsXG4gICAgICAgIGVycm9yOiB0cnVlXG4gICAgICB9KTtcbiAgICAgIGNhbGxiYWNrKHsgY29kZTogNDAwLCBtZXNzYWdlOiAnSW5zdWZpY2lhbnQgZGF0YSEnIH0sIG51bGwpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2NhbGxiYWNrIGZ1bmN0aW9uIGlzIHJlcXVpcmVkIScpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBpZiAoIWNhbGxiYWNrKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2NhbGxiYWNrIGZ1bmN0aW9uIGlzIHJlcXVpcmVkIScpO1xuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgdXJsID0gYCR7UEFHRVMubWFpbn1gO1xuICAgICAgLy8gdGhpcy5wcm9kdWN0X2lkID0gcHJvZHVjdF9pZDtcbiAgICAgIHRoaXMuY2FsbGJhY2sgPSBjYWxsYmFjaztcbiAgICAgIHRoaXMucmVuZGVyV2l0aFJldHJ5KHsgdXJsLCBlcnJvcjogZmFsc2UgfSk7XG4gICAgfVxuICB9XG59XG4iLCJpbXBvcnQgeyBQQUdFUyB9IGZyb20gJy4vY29uc3RhbnRzJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcmVjZWl2ZU1lc3NhZ2UoZXZlbnQpIHtcbiAgaWYgKGV2ZW50Lm9yaWdpbiA9PSBQQUdFUy5tYWluKSB7XG4gICAgc3dpdGNoIChldmVudC5kYXRhLnR5cGUpIHtcbiAgICAgIGNhc2UgJ0NMT1NFJzpcbiAgICAgICAgdGhpcy5jbG9zZSgpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ1JFQURZX1RPX1JFQ0VJVkUnOlxuICAgICAgICB0aGlzLnNlbmRNZXNzYWdlKFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHR5cGU6ICdJTklUSUFMX0RBVEEnLFxuICAgICAgICAgICAgcGF5bG9hZDoge1xuICAgICAgICAgICAgICBjbGllbnRfZGF0YTogdGhpcy5jbGllbnREYXRhLFxuICAgICAgICAgICAgICAvLyBwcm9kdWN0X2lkOiB0aGlzLnByb2R1Y3RfaWQsXG4gICAgICAgICAgICAgIG9yZGVyX2RldGFpbHM6IHRoaXMub3JkZXJfZGV0YWlsc1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgJyonXG4gICAgICAgICk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnUkVBRFlfVE9fUkVDRUlWRV9FUlInOlxuICAgICAgICB0aGlzLnNlbmRNZXNzYWdlKFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHR5cGU6ICdJTklUSUFMX0RBVEFfRVJSJyxcbiAgICAgICAgICAgIHBheWxvYWQ6IHtcbiAgICAgICAgICAgICAgZW1haWw6IHRoaXMub3JkZXJfZGV0YWlscy5wcmVmaWxsLm5hbWUgfHwgJycsXG4gICAgICAgICAgICAgIHBob25lOiB0aGlzLm9yZGVyX2RldGFpbHMucHJlZmlsbC5waG9uZSB8fCAnJ1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgJyonXG4gICAgICAgICk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnQ1JFQVRFRCc6XG4gICAgICAgIHRoaXMuY2FsbGJhY2sobnVsbCwge1xuICAgICAgICAgIGNvZGU6IDIwMSxcbiAgICAgICAgICBkYXRhOiBldmVudC5kYXRhLnBheWxvYWQsXG4gICAgICAgICAgbWVzc2FnZTogJ09yZGVyIHBsYWNlZCBzdWNjZXNzZnVsbHknXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmNsb3NlKCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnRVJST1InOlxuICAgICAgICB0aGlzLmNhbGxiYWNrKFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIGNvZGU6IGV2ZW50LmRhdGEucGF5bG9hZC5jb2RlLFxuICAgICAgICAgICAgbWVzc2FnZTogZXZlbnQuZGF0YS5wYXlsb2FkLm1lc3NhZ2VcbiAgICAgICAgICB9LFxuICAgICAgICAgIG51bGxcbiAgICAgICAgKTtcbiAgICAgICAgLy8gdGhpcy5jbG9zZSgpOyAvLyBzaG91bGQgd2UgY2xvc2UgdGhlIG1vZGFsIG9uIGVycm9yID9cbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG59XG4iLCJpbXBvcnQgeyBQQUdFUyB9IGZyb20gJy4vY29uc3RhbnRzJztcblxuZXhwb3J0IGRlZmF1bHQgYXN5bmMgZnVuY3Rpb24gcmVuZGVyV2l0aFJldHJ5KHsgdXJsLCBlcnJvciB9KSB7XG4gIGNvbnN0IGJvZHkgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdib2R5Jyk7XG5cbiAgY29uc3Qgc3R5bGVTaGVldCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XG4gIHN0eWxlU2hlZXQudHlwZSA9ICd0ZXh0L2Nzcyc7XG4gIHN0eWxlU2hlZXQuaWQgPSAnc2Fhcy1zZGstc3R5bGUnO1xuICBzdHlsZVNoZWV0LmlubmVyVGV4dCA9IGBcbiAgICAuZmxhbS1zZGstYmcge1xuICAgICAgcG9zaXRpb246IGZpeGVkO1xuICAgICAgdG9wOiAwO1xuICAgICAgcmlnaHQ6IDA7XG4gICAgICBib3R0b206IDA7XG4gICAgICBsZWZ0OiAwO1xuXG4gICAgICBtaW4taGVpZ2h0OiAxMDB2aDtcbiAgICAgIG1pbi13aWR0aDogMTAwdnc7XG4gICAgICBib3JkZXI6IG5vbmU7XG4gICAgICBiYWNrZ3JvdW5kOiByZ2JhKDAsMCwwLCAwLjQpO1xuXG4gICAgICBkaXNwbGF5OiBmbGV4O1xuICAgICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gICAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgIH1cblxuICAgICNmbGFtLXNkay1pZnJhbWUge1xuICAgICAgcG9zaXRpb246IGZpeGVkO1xuICAgICAgdG9wOiAwO1xuICAgICAgcmlnaHQ6IDA7XG4gICAgICBib3R0b206IDA7XG4gICAgICBsZWZ0OiAwO1xuXG4gICAgICBtaW4taGVpZ2h0OiAxMDB2aDtcbiAgICAgIG1pbi13aWR0aDogMTAwdnc7XG4gICAgICBib3JkZXI6IG5vbmU7XG4gICAgfVxuXG4gICAgLmZsYW0tc2RrLWxvYWRpbmcge1xuICAgICAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xuICAgICAgcG9zaXRpb246IHJlbGF0aXZlO1xuICAgICAgd2lkdGg6IDgwcHg7XG4gICAgICBoZWlnaHQ6IDgwcHg7XG4gICAgfVxuICAgIC5mbGFtLXNkay1sb2FkaW5nIGRpdiB7XG4gICAgICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xuICAgICAgZGlzcGxheTogYmxvY2s7XG4gICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgICB3aWR0aDogNjRweDtcbiAgICAgIGhlaWdodDogNjRweDtcbiAgICAgIG1hcmdpbjogOHB4O1xuICAgICAgYm9yZGVyOiAzcHggc29saWQgIzAwMDtcbiAgICAgIGJvcmRlci1yYWRpdXM6IDUwJTtcbiAgICAgIGFuaW1hdGlvbjogZmxhbS1zZGstbG9hZGluZyAxLjJzIGN1YmljLWJlemllcigwLjUsIDAsIDAuNSwgMSkgaW5maW5pdGU7XG4gICAgICBib3JkZXItY29sb3I6ICMwMDAgdHJhbnNwYXJlbnQgdHJhbnNwYXJlbnQgdHJhbnNwYXJlbnQ7XG4gICAgfVxuICAgIC5mbGFtLXNkay1sb2FkaW5nIGRpdjpudGgtY2hpbGQoMSkge1xuICAgICAgYW5pbWF0aW9uLWRlbGF5OiAtMC40NXM7XG4gICAgfVxuICAgIC5mbGFtLXNkay1sb2FkaW5nIGRpdjpudGgtY2hpbGQoMikge1xuICAgICAgYW5pbWF0aW9uLWRlbGF5OiAtMC4zcztcbiAgICB9XG4gICAgLmZsYW0tc2RrLWxvYWRpbmcgZGl2Om50aC1jaGlsZCgzKSB7XG4gICAgICBhbmltYXRpb24tZGVsYXk6IC0wLjE1cztcbiAgICB9XG4gICAgQGtleWZyYW1lcyBmbGFtLXNkay1sb2FkaW5nIHtcbiAgICAgIDAlIHtcbiAgICAgICAgdHJhbnNmb3JtOiByb3RhdGUoMGRlZyk7XG4gICAgICB9XG4gICAgICAxMDAlIHtcbiAgICAgICAgdHJhbnNmb3JtOiByb3RhdGUoMzYwZGVnKTtcbiAgICAgIH1cbiAgICB9XG4gIGA7XG5cbiAgYXdhaXQgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzdHlsZVNoZWV0KTtcblxuICBjb25zdCBVSSA9IGF3YWl0IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICBVSS5pZCA9ICdmbGFtLXNkay13cmFwcGVyJztcbiAgVUkuaW5uZXJIVE1MID0gYFxuICAgICAgPGRpdiBjbGFzcz1cImZsYW0tc2RrLXVpXCIgaWQ9XCJmbGFtLXNkay11aVwiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwiZmxhbS1zZGstYmdcIiBpZD1cImZsYW0tc2RrLWJnXCI+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImZsYW0tc2RrLWxvYWRpbmdcIiBpZD1cImZsYW0tc2RrLWxvYWRpbmdcIj48ZGl2PjwvZGl2PjxkaXY+PC9kaXY+PGRpdj48L2Rpdj48ZGl2PjwvZGl2PjwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGlmcmFtZSBpZD1cImZsYW0tc2RrLWlmcmFtZVwiIHN0eWxlPVwib3BhY2l0eTogMFwiIG5hbWU9XCJmbGFtLXNkay1pZnJhbWVcIiBzcmM9XCIke3VybH1cIiBzdHlsZT1cIm9wYWNpdHk6IDBcIj48L2lmcmFtZT5cbiAgICAgIDwvZGl2PlxuICAgIGA7XG5cbiAgYXdhaXQgYm9keS5hcHBlbmRDaGlsZChVSSk7XG5cbiAgY29uc3QgaUZyYW1lID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZsYW0tc2RrLWlmcmFtZScpO1xuXG4gIC8vIGlGcmFtZS5jb250ZW50V2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgZSA9PiB7XG4gIC8vICAgY29uc29sZS5sb2coJ0lmcmFtZSBFcnJvcicsIGUpO1xuICAvLyB9KTtcblxuICBpRnJhbWUuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIGFzeW5jIGUgPT4ge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAvLyBjb25zb2xlLmxvZygnSWZyYW1lIExvYWQnLCBlKTtcblxuICAgIHRyeSB7XG4gICAgICBpZiAodGhpcy5jbGllbnREYXRhLmVudmlyb25tZW50ID09ICdwcm9kdWN0aW9uJykge1xuICAgICAgICBhd2FpdCBmZXRjaChQQUdFUy5tYWluKTtcbiAgICAgIH1cblxuICAgICAgLy8gaGlkZSBsb2FkaW5nXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmxhbS1zZGstYmcnKS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuXG4gICAgICAvLyBCcmluZyB0aGUgaWZyYW1lIGJhY2tcbiAgICAgIGlGcmFtZS5zdHlsZS5vcGFjaXR5ID0gJzEnO1xuXG4gICAgICAvLyBmb3IgcmVjZWl2aW5nIG1lc3NhZ2VzIGZyb20gaWZyYW1lXG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGUgPT4gdGhpcy5yZWNlaXZlTWVzc2FnZShlKSk7XG5cbiAgICAgIC8vIGZvciBzZW5kaW5nIG1lc3NhZ2VzIHRvIGlmcmFtZVxuICAgICAgdGhpcy5pV2luZG93ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZsYW0tc2RrLWlmcmFtZScpLmNvbnRlbnRXaW5kb3c7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBpZiAoZXJyLm1lc3NhZ2UgPT09ICdGYWlsZWQgdG8gZmV0Y2gnKSB7XG4gICAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICAgICAgdGhpcy5jYWxsYmFjayh7XG4gICAgICAgICAgY29kZTogNTAwLFxuICAgICAgICAgIG1lc3NhZ2U6ICdTREsgZG93biEnXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG59XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBzZW5kTWVzc2FnZShtZXNzYWdlKSB7XG4gICAgdGhpcy5pV2luZG93LnBvc3RNZXNzYWdlKG1lc3NhZ2UsIFwiKlwiKVxufTsiLCJpbXBvcnQgY2xvc2VJZnJhbWUgZnJvbSAnLi9jbG9zZUlGcmFtZSc7XG5pbXBvcnQgYXNzZXJ0IGZyb20gJy4vaGVscGVyL2Fzc2VydCc7XG5pbXBvcnQgcGxhY2VPcmRlciBmcm9tICcuL3BsYWNlT3JkZXInO1xuaW1wb3J0IHJlY2VpdmVNZXNzYWdlIGZyb20gJy4vcmVjZWl2ZU1lc3NhZ2UnO1xuaW1wb3J0IHJlbmRlcldpdGhSZXRyeSBmcm9tICcuL3JlbmRlcldpdGhSZXRyeSc7XG5pbXBvcnQgc2VuZE1lc3NhZ2UgZnJvbSAnLi9zZW5kTWVzc2FnZSc7XG5cbi8qKlxuICogSGFuZGxlcyBhbGwgdGhlIGJyb3dzZXIncyBBdXRoTi9BdXRoWiBmbG93c1xuICogQGNvbnN0cnVjdG9yXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogQHBhcmFtIHtTdHJpbmd9IG9wdGlvbnMua2V5IHRoZSBBUEkgS2V5IGZvdW5kIG9uIHlvdXIgQXBwbGljYXRpb24gc2V0dGluZ3MgcGFnZVxuICogQHBhcmFtIHtTdHJpbmd9IFtvcHRpb25zLmVudmlyb25tZW50XSBlbnZpb3JubWVudCBzYW5kYm94IHwgcHJvZHVjdGlvblxuICogQHBhcmFtIHtTdHJpbmd9IFtvcHRpb25zLm5hbWVdIG5hbWUgb2YgY2xpZW50XG4gKiBAcGFyYW0ge1N0cmluZ30gW29wdGlvbnMubG9nb1VybF0gY2xpZW50J3MgYnJhbmQgbG9nbyB1cmxcbiAqIEBwYXJhbSB7U3RyaW5nfSBbb3B0aW9ucy5lbWFpbF0gY2xpZW50J3Mgc3VwcG9ydCBlbWFpbCBmb3IgZXJyb3IgcGFnZVxuICogQHBhcmFtIHtTdHJpbmd9IFtvcHRpb25zLnBob25lXSBjbGllbnQncyBzdXBwb3J0IHBob25lIGZvciBlcnJvciBwYWdlXG4gKi9cbmZ1bmN0aW9uIGluaXQob3B0aW9ucykge1xuICAvKiBlc2xpbnQtZGlzYWJsZSAqL1xuICB0cnkge1xuICAgIGFzc2VydC5jaGVjayhcbiAgICAgIG9wdGlvbnMsXG4gICAgICB7IHR5cGU6ICdvYmplY3QnLCBtZXNzYWdlOiAnY2xpZW50RGF0YSBwYXJhbWV0ZXIgaXMgbm90IHZhbGlkJyB9LFxuICAgICAge1xuICAgICAgICBrZXk6IHsgdHlwZTogJ3N0cmluZycsIG1lc3NhZ2U6ICdrZXkgaXMgcmVxdWlyZWQnIH0sXG4gICAgICAgIGVudmlyb25tZW50OiB7XG4gICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgICAgbWVzc2FnZTogJ2Vudmlyb25tZW50IGlzIHJlcXVpcmVkJ1xuICAgICAgICB9XG4gICAgICAgIC8vIG5hbWU6IHsgdHlwZTogJ3N0cmluZycsIG1lc3NhZ2U6ICduYW1lIGlzIHJlcXVpcmVkJyB9LFxuICAgICAgICAvLyBsb2dvVXJsOiB7IHR5cGU6ICdzdHJpbmcnLCBtZXNzYWdlOiAnbG9nb1VybCBpcyByZXF1aXJlZCcgfSxcbiAgICAgICAgLy8gZW1haWw6IHsgdHlwZTogJ3N0cmluZycsIG1lc3NhZ2U6ICdlbWFpbCBpcyByZXF1aXJlZCcgfSxcbiAgICAgICAgLy8gcGhvbmU6IHsgdHlwZTogJ3N0cmluZycsIG1lc3NhZ2U6ICdwaG9uZSBpcyByZXF1aXJlZCcgfVxuICAgICAgfVxuICAgICk7XG5cbiAgICBpZiAob3B0aW9ucy5vdmVycmlkZXMpIHtcbiAgICAgIGFzc2VydC5jaGVjayhvcHRpb25zLm92ZXJyaWRlcywge1xuICAgICAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICAgICAgbWVzc2FnZTogJ292ZXJyaWRlcyBvcHRpb24gaXMgbm90IHZhbGlkJ1xuICAgICAgfSk7XG4gICAgfVxuICB9IGNhdGNoIChlcnIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoZXJyLm1lc3NhZ2UpO1xuICB9XG4gIC8qIGVzbGludC1lbmFibGUgKi9cbiAgdGhpcy5jbGllbnREYXRhID0gb3B0aW9ucztcbiAgLyogZXNsaW50LWVuYWJsZSAqL1xufVxuXG4vLyBjb3JlIG1ldGhvZHNcbmluaXQucHJvdG90eXBlLnJlbmRlcldpdGhSZXRyeSA9IHJlbmRlcldpdGhSZXRyeTtcbmluaXQucHJvdG90eXBlLnBsYWNlT3JkZXIgPSBwbGFjZU9yZGVyO1xuaW5pdC5wcm90b3R5cGUucmVjZWl2ZU1lc3NhZ2UgPSByZWNlaXZlTWVzc2FnZTtcbmluaXQucHJvdG90eXBlLnNlbmRNZXNzYWdlID0gc2VuZE1lc3NhZ2U7XG5pbml0LnByb3RvdHlwZS5jbG9zZSA9IGNsb3NlSWZyYW1lO1xuXG5leHBvcnQgZGVmYXVsdCBpbml0O1xuIiwibW9kdWxlLmV4cG9ydHMgPSB7IHJhdzogJzAuMC4xJyB9OyIsImltcG9ydCBpbml0IGZyb20gJy4vc2RrJztcbmltcG9ydCB2ZXJzaW9uIGZyb20gJy4vdmVyc2lvbic7XG5cbmV4cG9ydCB7IHZlcnNpb24sIGluaXQgfTtcblxuZXhwb3J0IGRlZmF1bHQgeyB2ZXJzaW9uOiB2ZXJzaW9uLCBpbml0OiBpbml0IH07XG4iXSwibmFtZXMiOlsiY2xvc2VJZnJhbWUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7RUFBZSxTQUFTLEtBQUssR0FBRztFQUNoQyxFQUFFLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxJQUFJLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNyRTtFQUNBO0VBQ0EsRUFBRSxNQUFNLE9BQU8sR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLGtCQUFrQixDQUFDLENBQUM7RUFDOUQsRUFBRSxJQUFJLE9BQU8sRUFBRTtFQUNmLElBQUksT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDO0VBQ3JCLEdBQUc7QUFDSDtFQUNBO0VBQ0EsRUFBRSxNQUFNLFVBQVUsR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLGdCQUFnQixDQUFDLENBQUM7QUFDL0Q7RUFDQSxFQUFFLElBQUksVUFBVSxFQUFFO0VBQ2xCLElBQUksVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDO0VBQ3hCLEdBQUc7RUFDSDs7RUNmQSxJQUFJLFFBQVEsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQztBQUN6QztFQUNBLFNBQVMsU0FBUyxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRTtFQUN4QyxJQUFJLElBQUksR0FBRyxJQUFJLEtBQUssT0FBTyxHQUFHLFFBQVEsR0FBRyxJQUFJLENBQUM7RUFDOUMsSUFBSSxJQUFJLENBQUMsSUFBSSxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxJQUFJLEVBQUU7RUFDdEMsUUFBUSxNQUFNLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0VBQzlCLEtBQUs7RUFDTCxDQUFDO0FBQ0Q7RUFDQSxTQUFTLFFBQVEsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRTtFQUNqQyxJQUFJLElBQUksT0FBTyxDQUFDLEtBQUssSUFBSSxFQUFFO0VBQzNCLFFBQVEsTUFBTSxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztFQUM5QixLQUFLO0VBQ0wsQ0FBQztBQUNEO0VBQ0EsU0FBUyxLQUFLLENBQUMsQ0FBQyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUU7RUFDaEMsSUFBSSxJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUU7RUFDbEMsUUFBUSxNQUFNLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0VBQzlCLEtBQUs7RUFDTCxDQUFDO0FBQ0Q7RUFDQSxTQUFTLEtBQUssQ0FBQyxDQUFDLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRTtFQUN0QyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxJQUFJLENBQUMsRUFBRTtFQUMvQixRQUFRLFFBQVEsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7RUFDakQsS0FBSztFQUNMLElBQUksSUFBSSxNQUFNLENBQUMsSUFBSSxLQUFLLFFBQVEsSUFBSSxVQUFVLEVBQUU7RUFDaEQsUUFBUSxJQUFJLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQzNDO0VBQ0EsUUFBUSxLQUFLLElBQUksS0FBSyxHQUFHLENBQUMsRUFBRSxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsRUFBRTtFQUMxRCxZQUFZLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztFQUNoQyxZQUFZLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FB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
