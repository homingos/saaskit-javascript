/**
 * flamsdk v1.0.0
 * Author: bucharitesh
 * Date: 2022-09-07
 * License: MIT
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.FlamSaasSDK = {}));
}(this, (function (exports) { 'use strict';

  const SDK_BASE_URL = 'https://saas-sdk-flam.vpercel.app';
  // const SDK_BASE_URL = 'http://localhost:3000';

  const PAGES = {
    main: SDK_BASE_URL,
    error: `${SDK_BASE_URL}/error`
  };

  let trackOrder = null;

  /**
   * Renders the UI for Placing Order
   * @function
   * @param {String} url url to either order flow or error page
   */

  async function renderWithRetry(url) {
    const body = document.querySelector('body');

    const styleSheet = document.createElement('style');
    styleSheet.type = 'text/css';
    styleSheet.id = 'saas-sdk-style';
    styleSheet.innerText = `
    body {
      overflow: hidden;
    }

    .flam-sdk-loading-wrapper {
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;

      min-height: 100vh;
      min-width: 100vw;
      overflow: hidden;
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

    document.head.appendChild(styleSheet);

    const UI = document.createElement('div');
    UI.id = 'flam-sdk-wrapper';

    var RegExp = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i;

    const newUrl = () => {
      if (
        this.order_details &&
        this.order_details.theme &&
        this.order_details.theme.color &&
        RegExp.test(this.order_details.theme.color)
      ) {
        const x = '/?theme=';
        return url + x + encodeURIComponent(this.order_details.theme.color);
      }
      return url;
    };

    UI.innerHTML = `
      <div class="flam-sdk-loading-wrapper" id="flam-sdk-loading-wrapper">
        <div class="flam-sdk-loading" id="flam-sdk-loading"><div></div><div></div><div></div><div></div></div>
      </div>
      <iframe id="flam-sdk-iframe" style="opacity: 0" name="flam-sdk-iframe" src="${newUrl()}" style="opacity: 0"></iframe>      
    `;

    body.appendChild(UI);

    const iFrame = document.getElementById('flam-sdk-iframe');

    iFrame.addEventListener('load', async e => {
      e.preventDefault();

      try {
        // check if website available in PRODUCTION
        if (this.clientData.environment == 'PRODUCTION') {
          await fetch(PAGES.main);
        }

        // hide initial loading
        document.getElementById('flam-sdk-loading-wrapper').style.display =
          'none';

        // Show the iframe content
        iFrame.style.opacity = '1';

        // message event handler
        trackOrder = e => {
          this.receiveMessage(e);
        };

        // event listener for receiving messages from iframe
        window.addEventListener('message', trackOrder);

        // save window context for sending messages to iframe
        this.iWindow = document.getElementById('flam-sdk-iframe').contentWindow;
      } catch (err) {
        if (err.message === 'Failed to fetch') {
          this.close();
          this.callback({
            code: 500,
            message: 'Unable to acess SDK Website!'
          });
          return;
        }
        this.callback({
          code: 500,
          message: 'Something went wrong!'
        });
      }
    });
  }

  function close() {
    window.removeEventListener('message', trackOrder);

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

  /**
   * Runs the SDK for Placing Order
   * @function
   * @param {Object} options
   * @param {String} options.key the API Key found on your Application settings page
   * @param {String} [options.environment] enviornment sandbox | production
   */

  // TODO: write the parameter descriptions

  function placeOrder(order_details, callback) {
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
  }

  function receiveMessage(event) {
    if (event.origin == PAGES.main) {
      switch (event.data.type) {
        case 'CLOSE':
          this.close();
          break;
        case 'READY_TO_RECEIVE':
          this.sendMessage({
            type: 'INITIAL_DATA',
            payload: {
              client_data: this.clientData,
              order_details: this.order_details
            }
          });
          break;
        case 'READY_TO_RECEIVE_ERR':
          this.sendMessage({
            type: 'INITIAL_DATA_ERR',
            payload: {
              email:
                this.order_details &&
                this.order_details.prefill &&
                this.order_details.prefill.email
                  ? this.order_details.prefill.email
                  : '',
              phone:
                this.order_details &&
                this.order_details.prefill &&
                this.order_details.prefill.phone
                  ? this.order_details.prefill.phone
                  : ''
            }
          });
          break;
        case 'CREATED':
          this.callback(null, {
            code: 201,
            data: event.data.payload,
            message: 'Order placed successfully!'
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
          break;
      }
    }
  }

  function sendMessage(message) {
    this.iWindow.postMessage(message, PAGES.main);
  }

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
      throw 'Something went wrong!';
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
  init.prototype.close = close;

  var version = { raw: '1.0.0' };

  var index = { version: version, init: init };

  exports.default = index;
  exports.init = init;
  exports.version = version;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRmxhbVNhYXNTREsuanMiLCJzb3VyY2VzIjpbIi4uL3NyYy9jb25zdGFudHMuanMiLCIuLi9zcmMvcmVuZGVyV2l0aFJldHJ5LmpzIiwiLi4vc3JjL2Nsb3NlSUZyYW1lLmpzIiwiLi4vc3JjL2hlbHBlci9hc3NlcnQuanMiLCIuLi9zcmMvcGxhY2VPcmRlci5qcyIsIi4uL3NyYy9yZWNlaXZlTWVzc2FnZS5qcyIsIi4uL3NyYy9zZW5kTWVzc2FnZS5qcyIsIi4uL3NyYy9zZGsuanMiLCIuLi9zcmMvdmVyc2lvbi5qcyIsIi4uL3NyYy9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBTREtfQkFTRV9VUkwgPSAnaHR0cHM6Ly9zYWFzLXNkay1mbGFtLnZwZXJjZWwuYXBwJztcbi8vIGNvbnN0IFNES19CQVNFX1VSTCA9ICdodHRwOi8vbG9jYWxob3N0OjMwMDAnO1xuXG5leHBvcnQgY29uc3QgUEFHRVMgPSB7XG4gIG1haW46IFNES19CQVNFX1VSTCxcbiAgZXJyb3I6IGAke1NES19CQVNFX1VSTH0vZXJyb3JgXG59O1xuIiwiaW1wb3J0IHsgUEFHRVMgfSBmcm9tICcuL2NvbnN0YW50cyc7XG5cbmV4cG9ydCBsZXQgdHJhY2tPcmRlciA9IG51bGw7XG5cbi8qKlxuICogUmVuZGVycyB0aGUgVUkgZm9yIFBsYWNpbmcgT3JkZXJcbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtTdHJpbmd9IHVybCB1cmwgdG8gZWl0aGVyIG9yZGVyIGZsb3cgb3IgZXJyb3IgcGFnZVxuICovXG5cbmV4cG9ydCBkZWZhdWx0IGFzeW5jIGZ1bmN0aW9uIHJlbmRlcldpdGhSZXRyeSh1cmwpIHtcbiAgY29uc3QgYm9keSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2JvZHknKTtcblxuICBjb25zdCBzdHlsZVNoZWV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcbiAgc3R5bGVTaGVldC50eXBlID0gJ3RleHQvY3NzJztcbiAgc3R5bGVTaGVldC5pZCA9ICdzYWFzLXNkay1zdHlsZSc7XG4gIHN0eWxlU2hlZXQuaW5uZXJUZXh0ID0gYFxuICAgIGJvZHkge1xuICAgICAgb3ZlcmZsb3c6IGhpZGRlbjtcbiAgICB9XG5cbiAgICAuZmxhbS1zZGstbG9hZGluZy13cmFwcGVyIHtcbiAgICAgIHBvc2l0aW9uOiBmaXhlZDtcbiAgICAgIHRvcDogMDtcbiAgICAgIHJpZ2h0OiAwO1xuICAgICAgYm90dG9tOiAwO1xuICAgICAgbGVmdDogMDtcblxuICAgICAgbWluLWhlaWdodDogMTAwdmg7XG4gICAgICBtaW4td2lkdGg6IDEwMHZ3O1xuICAgICAgb3ZlcmZsb3c6IGhpZGRlbjtcbiAgICAgIGJvcmRlcjogbm9uZTtcbiAgICAgIGJhY2tncm91bmQ6IHJnYmEoMCwwLDAsIDAuNCk7XG5cbiAgICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbiAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgfVxuXG4gICAgI2ZsYW0tc2RrLWlmcmFtZSB7XG4gICAgICBwb3NpdGlvbjogZml4ZWQ7XG4gICAgICB0b3A6IDA7XG4gICAgICByaWdodDogMDtcbiAgICAgIGJvdHRvbTogMDtcbiAgICAgIGxlZnQ6IDA7XG5cbiAgICAgIG1pbi1oZWlnaHQ6IDEwMHZoO1xuICAgICAgbWluLXdpZHRoOiAxMDB2dztcbiAgICAgIGJvcmRlcjogbm9uZTtcbiAgICB9XG5cbiAgICAuZmxhbS1zZGstbG9hZGluZyB7XG4gICAgICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gICAgICB3aWR0aDogODBweDtcbiAgICAgIGhlaWdodDogODBweDtcbiAgICB9XG5cbiAgICAuZmxhbS1zZGstbG9hZGluZyBkaXYge1xuICAgICAgYm94LXNpemluZzogYm9yZGVyLWJveDtcbiAgICAgIGRpc3BsYXk6IGJsb2NrO1xuICAgICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgICAgd2lkdGg6IDY0cHg7XG4gICAgICBoZWlnaHQ6IDY0cHg7XG4gICAgICBtYXJnaW46IDhweDtcbiAgICAgIGJvcmRlcjogM3B4IHNvbGlkICMwMDA7XG4gICAgICBib3JkZXItcmFkaXVzOiA1MCU7XG4gICAgICBhbmltYXRpb246IGZsYW0tc2RrLWxvYWRpbmcgMS4ycyBjdWJpYy1iZXppZXIoMC41LCAwLCAwLjUsIDEpIGluZmluaXRlO1xuICAgICAgYm9yZGVyLWNvbG9yOiAjMDAwIHRyYW5zcGFyZW50IHRyYW5zcGFyZW50IHRyYW5zcGFyZW50O1xuICAgIH1cbiAgICAuZmxhbS1zZGstbG9hZGluZyBkaXY6bnRoLWNoaWxkKDEpIHtcbiAgICAgIGFuaW1hdGlvbi1kZWxheTogLTAuNDVzO1xuICAgIH1cbiAgICAuZmxhbS1zZGstbG9hZGluZyBkaXY6bnRoLWNoaWxkKDIpIHtcbiAgICAgIGFuaW1hdGlvbi1kZWxheTogLTAuM3M7XG4gICAgfVxuICAgIC5mbGFtLXNkay1sb2FkaW5nIGRpdjpudGgtY2hpbGQoMykge1xuICAgICAgYW5pbWF0aW9uLWRlbGF5OiAtMC4xNXM7XG4gICAgfVxuICAgIEBrZXlmcmFtZXMgZmxhbS1zZGstbG9hZGluZyB7XG4gICAgICAwJSB7XG4gICAgICAgIHRyYW5zZm9ybTogcm90YXRlKDBkZWcpO1xuICAgICAgfVxuICAgICAgMTAwJSB7XG4gICAgICAgIHRyYW5zZm9ybTogcm90YXRlKDM2MGRlZyk7XG4gICAgICB9XG4gICAgfVxuICBgO1xuXG4gIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoc3R5bGVTaGVldCk7XG5cbiAgY29uc3QgVUkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgVUkuaWQgPSAnZmxhbS1zZGstd3JhcHBlcic7XG5cbiAgdmFyIFJlZ0V4cCA9IC8oXiNbMC05QS1GXXs2fSQpfCheI1swLTlBLUZdezN9JCkvaTtcblxuICBjb25zdCBuZXdVcmwgPSAoKSA9PiB7XG4gICAgaWYgKFxuICAgICAgdGhpcy5vcmRlcl9kZXRhaWxzICYmXG4gICAgICB0aGlzLm9yZGVyX2RldGFpbHMudGhlbWUgJiZcbiAgICAgIHRoaXMub3JkZXJfZGV0YWlscy50aGVtZS5jb2xvciAmJlxuICAgICAgUmVnRXhwLnRlc3QodGhpcy5vcmRlcl9kZXRhaWxzLnRoZW1lLmNvbG9yKVxuICAgICkge1xuICAgICAgY29uc3QgeCA9ICcvP3RoZW1lPSc7XG4gICAgICByZXR1cm4gdXJsICsgeCArIGVuY29kZVVSSUNvbXBvbmVudCh0aGlzLm9yZGVyX2RldGFpbHMudGhlbWUuY29sb3IpO1xuICAgIH1cbiAgICByZXR1cm4gdXJsO1xuICB9O1xuXG4gIFVJLmlubmVySFRNTCA9IGBcbiAgICAgIDxkaXYgY2xhc3M9XCJmbGFtLXNkay1sb2FkaW5nLXdyYXBwZXJcIiBpZD1cImZsYW0tc2RrLWxvYWRpbmctd3JhcHBlclwiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwiZmxhbS1zZGstbG9hZGluZ1wiIGlkPVwiZmxhbS1zZGstbG9hZGluZ1wiPjxkaXY+PC9kaXY+PGRpdj48L2Rpdj48ZGl2PjwvZGl2PjxkaXY+PC9kaXY+PC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICAgIDxpZnJhbWUgaWQ9XCJmbGFtLXNkay1pZnJhbWVcIiBzdHlsZT1cIm9wYWNpdHk6IDBcIiBuYW1lPVwiZmxhbS1zZGstaWZyYW1lXCIgc3JjPVwiJHtuZXdVcmwoKX1cIiBzdHlsZT1cIm9wYWNpdHk6IDBcIj48L2lmcmFtZT4gICAgICBcbiAgICBgO1xuXG4gIGJvZHkuYXBwZW5kQ2hpbGQoVUkpO1xuXG4gIGNvbnN0IGlGcmFtZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmbGFtLXNkay1pZnJhbWUnKTtcblxuICBpRnJhbWUuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIGFzeW5jIGUgPT4ge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgIHRyeSB7XG4gICAgICAvLyBjaGVjayBpZiB3ZWJzaXRlIGF2YWlsYWJsZSBpbiBQUk9EVUNUSU9OXG4gICAgICBpZiAodGhpcy5jbGllbnREYXRhLmVudmlyb25tZW50ID09ICdQUk9EVUNUSU9OJykge1xuICAgICAgICBhd2FpdCBmZXRjaChQQUdFUy5tYWluKTtcbiAgICAgIH1cblxuICAgICAgLy8gaGlkZSBpbml0aWFsIGxvYWRpbmdcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmbGFtLXNkay1sb2FkaW5nLXdyYXBwZXInKS5zdHlsZS5kaXNwbGF5ID1cbiAgICAgICAgJ25vbmUnO1xuXG4gICAgICAvLyBTaG93IHRoZSBpZnJhbWUgY29udGVudFxuICAgICAgaUZyYW1lLnN0eWxlLm9wYWNpdHkgPSAnMSc7XG5cbiAgICAgIC8vIG1lc3NhZ2UgZXZlbnQgaGFuZGxlclxuICAgICAgdHJhY2tPcmRlciA9IGUgPT4ge1xuICAgICAgICB0aGlzLnJlY2VpdmVNZXNzYWdlKGUpO1xuICAgICAgfTtcblxuICAgICAgLy8gZXZlbnQgbGlzdGVuZXIgZm9yIHJlY2VpdmluZyBtZXNzYWdlcyBmcm9tIGlmcmFtZVxuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCB0cmFja09yZGVyKTtcblxuICAgICAgLy8gc2F2ZSB3aW5kb3cgY29udGV4dCBmb3Igc2VuZGluZyBtZXNzYWdlcyB0byBpZnJhbWVcbiAgICAgIHRoaXMuaVdpbmRvdyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmbGFtLXNkay1pZnJhbWUnKS5jb250ZW50V2luZG93O1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgaWYgKGVyci5tZXNzYWdlID09PSAnRmFpbGVkIHRvIGZldGNoJykge1xuICAgICAgICB0aGlzLmNsb3NlKCk7XG4gICAgICAgIHRoaXMuY2FsbGJhY2soe1xuICAgICAgICAgIGNvZGU6IDUwMCxcbiAgICAgICAgICBtZXNzYWdlOiAnVW5hYmxlIHRvIGFjZXNzIFNESyBXZWJzaXRlISdcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHRoaXMuY2FsbGJhY2soe1xuICAgICAgICBjb2RlOiA1MDAsXG4gICAgICAgIG1lc3NhZ2U6ICdTb21ldGhpbmcgd2VudCB3cm9uZyEnXG4gICAgICB9KTtcbiAgICB9XG4gIH0pO1xufVxuIiwiaW1wb3J0IHsgdHJhY2tPcmRlciB9IGZyb20gJy4vcmVuZGVyV2l0aFJldHJ5JztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gY2xvc2UoKSB7XG4gIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgdHJhY2tPcmRlcik7XG5cbiAgLy8gcmVtb3ZlIHRoZSBVSVxuICBjb25zdCBlbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZsYW0tc2RrLXdyYXBwZXInKTtcbiAgaWYgKGVsZW1lbnQpIHtcbiAgICBlbGVtZW50LnJlbW92ZSgpO1xuICB9XG5cbiAgLy8gcmVtb3ZlIHRoZSBzdHlsZXNcbiAgY29uc3Qgc3R5bGVTaGVldCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzYWFzLXNkay1zdHlsZScpO1xuXG4gIGlmIChzdHlsZVNoZWV0KSB7XG4gICAgc3R5bGVTaGVldC5yZW1vdmUoKTtcbiAgfVxufVxuIiwidmFyIHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxuZnVuY3Rpb24gYXR0cmlidXRlKG8sIGF0dHIsIHR5cGUsIHRleHQpIHtcbiAgICB0eXBlID0gdHlwZSA9PT0gJ2FycmF5JyA/ICdvYmplY3QnIDogdHlwZTtcbiAgICBpZiAobyAmJiB0eXBlb2Ygb1thdHRyXSAhPT0gdHlwZSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IodGV4dCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiB2YXJpYWJsZShvLCB0eXBlLCB0ZXh0KSB7XG4gICAgaWYgKHR5cGVvZiBvICE9PSB0eXBlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcih0ZXh0KTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHZhbHVlKG8sIHZhbHVlcywgdGV4dCkge1xuICAgIGlmICh2YWx1ZXMuaW5kZXhPZihvKSA9PT0gLTEpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKHRleHQpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gY2hlY2sobywgY29uZmlnLCBhdHRyaWJ1dGVzKSB7XG4gICAgaWYgKCFjb25maWcub3B0aW9uYWwgfHwgbykge1xuICAgICAgICB2YXJpYWJsZShvLCBjb25maWcudHlwZSwgY29uZmlnLm1lc3NhZ2UpO1xuICAgIH1cbiAgICBpZiAoY29uZmlnLnR5cGUgPT09ICdvYmplY3QnICYmIGF0dHJpYnV0ZXMpIHtcbiAgICAgICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhhdHRyaWJ1dGVzKTtcblxuICAgICAgICBmb3IgKHZhciBpbmRleCA9IDA7IGluZGV4IDwga2V5cy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgICAgIHZhciBhID0ga2V5c1tpbmRleF07XG4gICAgICAgICAgICBpZiAoIWF0dHJpYnV0ZXNbYV0ub3B0aW9uYWwgfHwgb1thXSkge1xuICAgICAgICAgICAgICAgIGlmICghYXR0cmlidXRlc1thXS5jb25kaXRpb24gfHwgYXR0cmlidXRlc1thXS5jb25kaXRpb24obykpIHtcbiAgICAgICAgICAgICAgICAgICAgYXR0cmlidXRlKG8sIGEsIGF0dHJpYnV0ZXNbYV0udHlwZSwgYXR0cmlidXRlc1thXS5tZXNzYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGF0dHJpYnV0ZXNbYV0udmFsdWVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZShvW2FdLCBhdHRyaWJ1dGVzW2FdLnZhbHVlcywgYXR0cmlidXRlc1thXS52YWx1ZV9tZXNzYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cblxuLyoqXG4gKiBXcmFwIGBBcnJheS5pc0FycmF5YCBQb2x5ZmlsbCBmb3IgSUU5XG4gKiBzb3VyY2U6IGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL0FycmF5L2lzQXJyYXlcbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBhcnJheVxuICogQHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gaXNBcnJheShhcnJheSkge1xuICAgIGlmICh0aGlzLnN1cHBvcnRzSXNBcnJheSgpKSB7XG4gICAgICAgIHJldHVybiBBcnJheS5pc0FycmF5KGFycmF5KTtcbiAgICB9XG5cbiAgICByZXR1cm4gdG9TdHJpbmcuY2FsbChhcnJheSkgPT09ICdbb2JqZWN0IEFycmF5XSc7XG59XG5cbmZ1bmN0aW9uIHN1cHBvcnRzSXNBcnJheSgpIHtcbiAgICByZXR1cm4gQXJyYXkuaXNBcnJheSAhPSBudWxsO1xufVxuXG5leHBvcnQgZGVmYXVsdCB7XG4gICAgY2hlY2s6IGNoZWNrLFxuICAgIGF0dHJpYnV0ZTogYXR0cmlidXRlLFxuICAgIHZhcmlhYmxlOiB2YXJpYWJsZSxcbiAgICB2YWx1ZTogdmFsdWUsXG4gICAgaXNBcnJheTogaXNBcnJheSxcbiAgICBzdXBwb3J0c0lzQXJyYXk6IHN1cHBvcnRzSXNBcnJheVxufTsiLCJpbXBvcnQgeyBQQUdFUyB9IGZyb20gJy4vY29uc3RhbnRzJztcbmltcG9ydCBhc3NlcnQgZnJvbSAnLi9oZWxwZXIvYXNzZXJ0JztcblxuLyoqXG4gKiBSdW5zIHRoZSBTREsgZm9yIFBsYWNpbmcgT3JkZXJcbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqIEBwYXJhbSB7U3RyaW5nfSBvcHRpb25zLmtleSB0aGUgQVBJIEtleSBmb3VuZCBvbiB5b3VyIEFwcGxpY2F0aW9uIHNldHRpbmdzIHBhZ2VcbiAqIEBwYXJhbSB7U3RyaW5nfSBbb3B0aW9ucy5lbnZpcm9ubWVudF0gZW52aW9ybm1lbnQgc2FuZGJveCB8IHByb2R1Y3Rpb25cbiAqL1xuXG4vLyBUT0RPOiB3cml0ZSB0aGUgcGFyYW1ldGVyIGRlc2NyaXB0aW9uc1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBwbGFjZU9yZGVyKG9yZGVyX2RldGFpbHMsIGNhbGxiYWNrKSB7XG4gIHRyeSB7XG4gICAgLy8gdmFsaWRhdGUgY2xpZW50IGRhdGFcbiAgICBhc3NlcnQuY2hlY2soXG4gICAgICB0aGlzLmNsaWVudERhdGEsXG4gICAgICB7IHR5cGU6ICdvYmplY3QnLCBtZXNzYWdlOiAnaW5pdCBkYXRhIGlzIGludmFsaWQnIH0sXG4gICAgICB7XG4gICAgICAgIGtleTogeyB0eXBlOiAnc3RyaW5nJywgbWVzc2FnZTogXCIna2V5JyBpcyByZXF1aXJlZCBzdHJpbmcuXCIgfSxcbiAgICAgICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgICAgICBvcHRpb25hbDogdHJ1ZSxcbiAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICBtZXNzYWdlOiBcIidlbnZpcm9ubWVudCcgbXVzdCBiZSBzdHJpbmcuXCJcbiAgICAgICAgfVxuICAgICAgfVxuICAgICk7XG5cbiAgICAvLyB2YWxpZGF0ZSBvcmRlcl9kZXRhaWxzXG4gICAgYXNzZXJ0LmNoZWNrKFxuICAgICAgb3JkZXJfZGV0YWlscyxcbiAgICAgIHtcbiAgICAgICAgdHlwZTogJ29iamVjdCcsXG4gICAgICAgIG1lc3NhZ2U6IFwiJ29yZGVyX2RldGFpbHMnIGlzIG5vdCB2YWxpZC5cIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgcHJvZHVjdElkOiB7XG4gICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgICAgbWVzc2FnZTogXCIncHJvZHVjdElkJyBpcyByZXF1aXJlZCBzdHJpbmcuXCJcbiAgICAgICAgfSxcbiAgICAgICAgcmVmSWQ6IHsgdHlwZTogJ3N0cmluZycsIG1lc3NhZ2U6IFwiJ3JlZklkJyBpcyByZXF1aXJlZCBzdHJpbmcuXCIgfSxcbiAgICAgICAgcGhvdG86IHtcbiAgICAgICAgICBvcHRpb25hbDogdHJ1ZSxcbiAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICBtZXNzYWdlOiBcIidwaG90bycgbXVzdCBiZSBzdHJpbmcuXCJcbiAgICAgICAgfSxcbiAgICAgICAgdmlkZW86IHtcbiAgICAgICAgICBvcHRpb25hbDogdHJ1ZSxcbiAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICBtZXNzYWdlOiBcIid2aWRlbycgbXVzdCBiZSBzdHJpbmcuXCJcbiAgICAgICAgfSxcbiAgICAgICAgcHJlZmlsbDoge1xuICAgICAgICAgIG9wdGlvbmFsOiB0cnVlLFxuICAgICAgICAgIHR5cGU6ICdvYmplY3QnLFxuICAgICAgICAgIG1lc3NhZ2U6IFwiJ3ByZWZpbGwnIG11c3QgYmUgb2JqZWN0LlwiXG4gICAgICAgIH0sXG4gICAgICAgIGFuaW1hdGlvbjoge1xuICAgICAgICAgIG9wdGlvbmFsOiB0cnVlLFxuICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgIG1lc3NhZ2U6IFwiJ2FuaW1hdGlvbicgbXVzdCBiZSBzdHJpbmcuXCJcbiAgICAgICAgfSxcbiAgICAgICAgdGhlbWU6IHtcbiAgICAgICAgICBvcHRpb25hbDogdHJ1ZSxcbiAgICAgICAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICAgICAgICBtZXNzYWdlOiBcIid0aGVtZScgbXVzdCBiZSBvYmplY3QuXCJcbiAgICAgICAgfSxcbiAgICAgICAgbG9nbzoge1xuICAgICAgICAgIG9wdGlvbmFsOiB0cnVlLFxuICAgICAgICAgIHR5cGU6ICdvYmplY3QnLFxuICAgICAgICAgIG1lc3NhZ2U6IFwiJ2xvZ28nIG11c3QgYmUgc3RyaW5nLlwiXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICApO1xuXG4gICAgLy8gdmFsaWRhdGUgY2FsbGJhY2sgZnVuY3Rpb25cbiAgICBhc3NlcnQuY2hlY2soY2FsbGJhY2ssIHtcbiAgICAgIHR5cGU6ICdmdW5jdGlvbicsXG4gICAgICBtZXNzYWdlOiBcIidjYWxsYmFjaycgaXMgcmVxdWlyZWQgZnVuY3Rpb24uXCJcbiAgICB9KTtcblxuICAgIC8vIHNhdmUgb3JkZXJfZGV0YWlsc1xuICAgIHRoaXMub3JkZXJfZGV0YWlscyA9IG9yZGVyX2RldGFpbHM7XG5cbiAgICAvLyByZW5kZXIgdGhlIHN1Y2Nlc3MgVUlcbiAgICBsZXQgdXJsID0gYCR7UEFHRVMubWFpbn1gO1xuICAgIHRoaXMuY2FsbGJhY2sgPSBjYWxsYmFjaztcbiAgICB0aGlzLnJlbmRlcldpdGhSZXRyeSh1cmwpO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICBpZiAoY2FsbGJhY2sgJiYgdHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAvLyByZW5kZXIgZXJyb3IgVUlcbiAgICAgIGxldCB1cmwgPSBgJHtQQUdFUy5lcnJvcn0vU29tZXRoaW5nIHdlbnQgd3JvbmchYDtcbiAgICAgIHRoaXMucmVuZGVyV2l0aFJldHJ5KHVybCk7XG4gICAgICAvLyBjYWxsYmFjayB0byBjbGllbnQgd2l0aCBlcnJvclxuICAgICAgY2FsbGJhY2soeyBjb2RlOiA0MDAsIG1lc3NhZ2U6IGVyci5tZXNzYWdlIH0sIG51bGwpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBcIidjYWxsYmFjaycgaXMgcmVxdWlyZWQgZnVuY3Rpb24uXCI7XG4gICAgfVxuICB9XG59XG4iLCJpbXBvcnQgeyBQQUdFUyB9IGZyb20gJy4vY29uc3RhbnRzJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcmVjZWl2ZU1lc3NhZ2UoZXZlbnQpIHtcbiAgaWYgKGV2ZW50Lm9yaWdpbiA9PSBQQUdFUy5tYWluKSB7XG4gICAgc3dpdGNoIChldmVudC5kYXRhLnR5cGUpIHtcbiAgICAgIGNhc2UgJ0NMT1NFJzpcbiAgICAgICAgdGhpcy5jbG9zZSgpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ1JFQURZX1RPX1JFQ0VJVkUnOlxuICAgICAgICB0aGlzLnNlbmRNZXNzYWdlKHtcbiAgICAgICAgICB0eXBlOiAnSU5JVElBTF9EQVRBJyxcbiAgICAgICAgICBwYXlsb2FkOiB7XG4gICAgICAgICAgICBjbGllbnRfZGF0YTogdGhpcy5jbGllbnREYXRhLFxuICAgICAgICAgICAgb3JkZXJfZGV0YWlsczogdGhpcy5vcmRlcl9kZXRhaWxzXG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdSRUFEWV9UT19SRUNFSVZFX0VSUic6XG4gICAgICAgIHRoaXMuc2VuZE1lc3NhZ2Uoe1xuICAgICAgICAgIHR5cGU6ICdJTklUSUFMX0RBVEFfRVJSJyxcbiAgICAgICAgICBwYXlsb2FkOiB7XG4gICAgICAgICAgICBlbWFpbDpcbiAgICAgICAgICAgICAgdGhpcy5vcmRlcl9kZXRhaWxzICYmXG4gICAgICAgICAgICAgIHRoaXMub3JkZXJfZGV0YWlscy5wcmVmaWxsICYmXG4gICAgICAgICAgICAgIHRoaXMub3JkZXJfZGV0YWlscy5wcmVmaWxsLmVtYWlsXG4gICAgICAgICAgICAgICAgPyB0aGlzLm9yZGVyX2RldGFpbHMucHJlZmlsbC5lbWFpbFxuICAgICAgICAgICAgICAgIDogJycsXG4gICAgICAgICAgICBwaG9uZTpcbiAgICAgICAgICAgICAgdGhpcy5vcmRlcl9kZXRhaWxzICYmXG4gICAgICAgICAgICAgIHRoaXMub3JkZXJfZGV0YWlscy5wcmVmaWxsICYmXG4gICAgICAgICAgICAgIHRoaXMub3JkZXJfZGV0YWlscy5wcmVmaWxsLnBob25lXG4gICAgICAgICAgICAgICAgPyB0aGlzLm9yZGVyX2RldGFpbHMucHJlZmlsbC5waG9uZVxuICAgICAgICAgICAgICAgIDogJydcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ0NSRUFURUQnOlxuICAgICAgICB0aGlzLmNhbGxiYWNrKG51bGwsIHtcbiAgICAgICAgICBjb2RlOiAyMDEsXG4gICAgICAgICAgZGF0YTogZXZlbnQuZGF0YS5wYXlsb2FkLFxuICAgICAgICAgIG1lc3NhZ2U6ICdPcmRlciBwbGFjZWQgc3VjY2Vzc2Z1bGx5ISdcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdFUlJPUic6XG4gICAgICAgIHRoaXMuY2FsbGJhY2soXG4gICAgICAgICAge1xuICAgICAgICAgICAgY29kZTogZXZlbnQuZGF0YS5wYXlsb2FkLmNvZGUsXG4gICAgICAgICAgICBtZXNzYWdlOiBldmVudC5kYXRhLnBheWxvYWQubWVzc2FnZVxuICAgICAgICAgIH0sXG4gICAgICAgICAgbnVsbFxuICAgICAgICApO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cbn1cbiIsImltcG9ydCB7IFBBR0VTIH0gZnJvbSAnLi9jb25zdGFudHMnO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBzZW5kTWVzc2FnZShtZXNzYWdlKSB7XG4gIHRoaXMuaVdpbmRvdy5wb3N0TWVzc2FnZShtZXNzYWdlLCBQQUdFUy5tYWluKTtcbn1cbiIsImltcG9ydCBjbG9zZUlmcmFtZSBmcm9tICcuL2Nsb3NlSUZyYW1lJztcbmltcG9ydCBhc3NlcnQgZnJvbSAnLi9oZWxwZXIvYXNzZXJ0JztcbmltcG9ydCBwbGFjZU9yZGVyIGZyb20gJy4vcGxhY2VPcmRlcic7XG5pbXBvcnQgcmVjZWl2ZU1lc3NhZ2UgZnJvbSAnLi9yZWNlaXZlTWVzc2FnZSc7XG5pbXBvcnQgcmVuZGVyV2l0aFJldHJ5IGZyb20gJy4vcmVuZGVyV2l0aFJldHJ5JztcbmltcG9ydCBzZW5kTWVzc2FnZSBmcm9tICcuL3NlbmRNZXNzYWdlJztcblxuLyoqXG4gKiBJbml0aWFsaXplcyBhIFNESyBpbnN0YW5jZVxuICogQGNvbnN0cnVjdG9yXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogQHBhcmFtIHtTdHJpbmd9IG9wdGlvbnMua2V5IHRoZSBBUEkgS2V5IGZvdW5kIG9uIHlvdXIgQXBwbGljYXRpb24gc2V0dGluZ3MgcGFnZVxuICogQHBhcmFtIHtTdHJpbmd9IFtvcHRpb25zLmVudmlyb25tZW50XSBlbnZpb3JubWVudCBTQU5EQk9YIHwgUFJPRFVDVElPTlxuICovXG5mdW5jdGlvbiBpbml0KG9wdGlvbnMpIHtcbiAgLyogZXNsaW50LWRpc2FibGUgKi9cblxuICAvLyB2YWxpZGF0ZSB0aGUgY2xpZW50J3MgaW5wdXQgZm9yICdpbml0J1xuICB0cnkge1xuICAgIGFzc2VydC5jaGVjayhcbiAgICAgIG9wdGlvbnMsXG4gICAgICB7IHR5cGU6ICdvYmplY3QnLCBtZXNzYWdlOiAnaW5pdCBwYXJhbWV0ZXIgaXMgbm90IHZhbGlkLicgfSxcbiAgICAgIHtcbiAgICAgICAga2V5OiB7IHR5cGU6ICdzdHJpbmcnLCBtZXNzYWdlOiBcIidrZXknIGlzIHJlcXVpcmVkIHN0cmluZy5cIiB9LFxuICAgICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICAgIG9wdGlvbmFsOiB0cnVlLFxuICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgIG1lc3NhZ2U6IFwiJ2Vudmlyb25tZW50JyBtdXN0IGJlIHN0cmluZy5cIlxuICAgICAgICB9XG4gICAgICB9XG4gICAgKTtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgLy8gYXNzZXJ0IG1ldGhvZCBhYm92ZSB0aHJvd3MgZXJyb3Igd2l0aCBnaXZlbiBtZXNzYWdlIHdoaWNoIHdlIGZ1cnRoZXIgdGhyb3cgdG8gY2xpZW50LlxuICAgIGlmIChlcnIgJiYgZXJyLm1lc3NhZ2UpIHtcbiAgICAgIHRocm93IGVyci5tZXNzYWdlO1xuICAgIH1cbiAgICB0aHJvdyAnU29tZXRoaW5nIHdlbnQgd3JvbmchJztcbiAgfVxuXG4gIC8vIHNldCBlbnZpcm9ubWVudCB0byAnUFJPRFVDVElPTicgaWYgc3RhdGVkIGJ5IGNsaWVudCwgb3RoZXJ3aXNlICdTQU5EQk9YJ1xuICBvcHRpb25zLmVudmlyb25tZW50ID1cbiAgICBvcHRpb25zICYmXG4gICAgdHlwZW9mIG9wdGlvbnMuZW52aXJvbm1lbnQgPT09ICdzdHJpbmcnICYmXG4gICAgb3B0aW9ucy5lbnZpcm9ubWVudC50b1VwcGVyQ2FzZSgpID09PSAnUFJPRFVDVElPTidcbiAgICAgID8gJ1BST0RVQ1RJT04nXG4gICAgICA6ICdTQU5EQk9YJztcblxuICAvLyBzYXZlIG9wdGlvbnMgdG8gY2xpZW50RGF0YVxuICB0aGlzLmNsaWVudERhdGEgPSBvcHRpb25zO1xuXG4gIC8qIGVzbGludC1lbmFibGUgKi9cbn1cblxuLy8gY29yZSBtZXRob2RzXG5pbml0LnByb3RvdHlwZS5yZW5kZXJXaXRoUmV0cnkgPSByZW5kZXJXaXRoUmV0cnk7XG5pbml0LnByb3RvdHlwZS5wbGFjZU9yZGVyID0gcGxhY2VPcmRlcjtcbmluaXQucHJvdG90eXBlLnJlY2VpdmVNZXNzYWdlID0gcmVjZWl2ZU1lc3NhZ2U7XG5pbml0LnByb3RvdHlwZS5zZW5kTWVzc2FnZSA9IHNlbmRNZXNzYWdlO1xuaW5pdC5wcm90b3R5cGUuY2xvc2UgPSBjbG9zZUlmcmFtZTtcblxuZXhwb3J0IGRlZmF1bHQgaW5pdDtcbiIsIm1vZHVsZS5leHBvcnRzID0geyByYXc6ICcxLjAuMCcgfTsiLCJpbXBvcnQgaW5pdCBmcm9tICcuL3Nkayc7XG5pbXBvcnQgdmVyc2lvbiBmcm9tICcuL3ZlcnNpb24nO1xuXG5leHBvcnQgeyB2ZXJzaW9uLCBpbml0IH07XG5cbmV4cG9ydCBkZWZhdWx0IHsgdmVyc2lvbjogdmVyc2lvbiwgaW5pdDogaW5pdCB9O1xuIl0sIm5hbWVzIjpbImNsb3NlSWZyYW1lIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0VBQUEsTUFBTSxZQUFZLEdBQUcsbUNBQW1DLENBQUM7RUFDekQ7QUFDQTtFQUNPLE1BQU0sS0FBSyxHQUFHO0VBQ3JCLEVBQUUsSUFBSSxFQUFFLFlBQVk7RUFDcEIsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLFlBQVksQ0FBQyxNQUFNLENBQUM7RUFDaEMsQ0FBQzs7RUNKTSxJQUFJLFVBQVUsR0FBRyxJQUFJLENBQUM7QUFDN0I7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0FBQ0E7QUFDQSxFQUFlLGVBQWUsZUFBZSxDQUFDLEdBQUcsRUFBRTtFQUNuRCxF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
