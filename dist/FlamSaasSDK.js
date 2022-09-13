/**
 * flamsdk v1.0.3
 * Author: bucharitesh
 * Date: 2022-09-13
 * License: MIT
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.FlamSaasSDK = {}));
}(this, (function (exports) { 'use strict';

  // const SDK_BASE_URL = 'https://saas-sdk-flam.vercel.app';
  const SDK_BASE_URL = 'http://localhost:3000';

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

  async function placeOrder(order_details, callback) {
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
            name: {
              optional: true,
              type: 'string',
              message: "'name' is required string."
            },
            email: {
              optional: true,
              type: 'string',
              message: "'email' is required string."
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
            color: {
              optional: true,
              type: 'string',
              message: "'name' is required string."
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
              ...this.clientData,
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

  var version = { raw: '1.0.3' };

  var index = { version: version, init: init };

  exports.default = index;
  exports.init = init;
  exports.version = version;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRmxhbVNhYXNTREsuanMiLCJzb3VyY2VzIjpbIi4uL3NyYy9jb25zdGFudHMuanMiLCIuLi9zcmMvcmVuZGVyV2l0aFJldHJ5LmpzIiwiLi4vc3JjL2Nsb3NlSUZyYW1lLmpzIiwiLi4vc3JjL2hlbHBlci9hc3NlcnQuanMiLCIuLi9zcmMvcGxhY2VPcmRlci5qcyIsIi4uL3NyYy9yZWNlaXZlTWVzc2FnZS5qcyIsIi4uL3NyYy9zZW5kTWVzc2FnZS5qcyIsIi4uL3NyYy9zZGsuanMiLCIuLi9zcmMvdmVyc2lvbi5qcyIsIi4uL3NyYy9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBjb25zdCBTREtfQkFTRV9VUkwgPSAnaHR0cHM6Ly9zYWFzLXNkay1mbGFtLnZlcmNlbC5hcHAnO1xuY29uc3QgU0RLX0JBU0VfVVJMID0gJ2h0dHA6Ly9sb2NhbGhvc3Q6MzAwMCc7XG5cbmV4cG9ydCBjb25zdCBQQUdFUyA9IHtcbiAgbWFpbjogU0RLX0JBU0VfVVJMLFxuICBlcnJvcjogYCR7U0RLX0JBU0VfVVJMfS9lcnJvcmBcbn07XG4iLCJpbXBvcnQgeyBQQUdFUyB9IGZyb20gJy4vY29uc3RhbnRzJztcblxuZXhwb3J0IGxldCB0cmFja09yZGVyID0gbnVsbDtcblxuLyoqXG4gKiBSZW5kZXJzIHRoZSBVSSBmb3IgUGxhY2luZyBPcmRlclxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsIHVybCB0byBlaXRoZXIgb3JkZXIgZmxvdyBvciBlcnJvciBwYWdlXG4gKi9cblxuZXhwb3J0IGRlZmF1bHQgYXN5bmMgZnVuY3Rpb24gcmVuZGVyV2l0aFJldHJ5KHVybCkge1xuICBjb25zdCBib2R5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpO1xuXG4gIGNvbnN0IHN0eWxlU2hlZXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuICBzdHlsZVNoZWV0LnR5cGUgPSAndGV4dC9jc3MnO1xuICBzdHlsZVNoZWV0LmlkID0gJ3NhYXMtc2RrLXN0eWxlJztcbiAgc3R5bGVTaGVldC5pbm5lclRleHQgPSBgXG4gICAgYm9keSB7XG4gICAgICBvdmVyZmxvdzogaGlkZGVuO1xuICAgIH1cblxuICAgIC5mbGFtLXNkay1sb2FkaW5nLXdyYXBwZXIge1xuICAgICAgcG9zaXRpb246IGZpeGVkO1xuICAgICAgdG9wOiAwO1xuICAgICAgcmlnaHQ6IDA7XG4gICAgICBib3R0b206IDA7XG4gICAgICBsZWZ0OiAwO1xuXG4gICAgICBtaW4taGVpZ2h0OiAxMDB2aDtcbiAgICAgIG1pbi13aWR0aDogMTAwdnc7XG4gICAgICBvdmVyZmxvdzogaGlkZGVuO1xuICAgICAgYm9yZGVyOiBub25lO1xuICAgICAgYmFja2dyb3VuZDogcmdiYSgwLDAsMCwgMC40KTtcblxuICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICB9XG5cbiAgICAjZmxhbS1zZGstaWZyYW1lIHtcbiAgICAgIHBvc2l0aW9uOiBmaXhlZDtcbiAgICAgIHRvcDogMDtcbiAgICAgIHJpZ2h0OiAwO1xuICAgICAgYm90dG9tOiAwO1xuICAgICAgbGVmdDogMDtcblxuICAgICAgbWluLWhlaWdodDogMTAwdmg7XG4gICAgICBtaW4td2lkdGg6IDEwMHZ3O1xuICAgICAgYm9yZGVyOiBub25lO1xuICAgIH1cblxuICAgIC5mbGFtLXNkay1sb2FkaW5nIHtcbiAgICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgICAgIHdpZHRoOiA4MHB4O1xuICAgICAgaGVpZ2h0OiA4MHB4O1xuICAgIH1cblxuICAgIC5mbGFtLXNkay1sb2FkaW5nIGRpdiB7XG4gICAgICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xuICAgICAgZGlzcGxheTogYmxvY2s7XG4gICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgICB3aWR0aDogNjRweDtcbiAgICAgIGhlaWdodDogNjRweDtcbiAgICAgIG1hcmdpbjogOHB4O1xuICAgICAgYm9yZGVyOiAzcHggc29saWQgIzAwMDtcbiAgICAgIGJvcmRlci1yYWRpdXM6IDUwJTtcbiAgICAgIGFuaW1hdGlvbjogZmxhbS1zZGstbG9hZGluZyAxLjJzIGN1YmljLWJlemllcigwLjUsIDAsIDAuNSwgMSkgaW5maW5pdGU7XG4gICAgICBib3JkZXItY29sb3I6ICMwMDAgdHJhbnNwYXJlbnQgdHJhbnNwYXJlbnQgdHJhbnNwYXJlbnQ7XG4gICAgfVxuICAgIC5mbGFtLXNkay1sb2FkaW5nIGRpdjpudGgtY2hpbGQoMSkge1xuICAgICAgYW5pbWF0aW9uLWRlbGF5OiAtMC40NXM7XG4gICAgfVxuICAgIC5mbGFtLXNkay1sb2FkaW5nIGRpdjpudGgtY2hpbGQoMikge1xuICAgICAgYW5pbWF0aW9uLWRlbGF5OiAtMC4zcztcbiAgICB9XG4gICAgLmZsYW0tc2RrLWxvYWRpbmcgZGl2Om50aC1jaGlsZCgzKSB7XG4gICAgICBhbmltYXRpb24tZGVsYXk6IC0wLjE1cztcbiAgICB9XG4gICAgQGtleWZyYW1lcyBmbGFtLXNkay1sb2FkaW5nIHtcbiAgICAgIDAlIHtcbiAgICAgICAgdHJhbnNmb3JtOiByb3RhdGUoMGRlZyk7XG4gICAgICB9XG4gICAgICAxMDAlIHtcbiAgICAgICAgdHJhbnNmb3JtOiByb3RhdGUoMzYwZGVnKTtcbiAgICAgIH1cbiAgICB9XG4gIGA7XG5cbiAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzdHlsZVNoZWV0KTtcblxuICBjb25zdCBVSSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICBVSS5pZCA9ICdmbGFtLXNkay13cmFwcGVyJztcblxuICB2YXIgUmVnRXhwID0gLyheI1swLTlBLUZdezZ9JCl8KF4jWzAtOUEtRl17M30kKS9pO1xuXG4gIGNvbnN0IG5ld1VybCA9ICgpID0+IHtcbiAgICBpZiAoXG4gICAgICB0aGlzLm9yZGVyX2RldGFpbHMgJiZcbiAgICAgIHRoaXMub3JkZXJfZGV0YWlscy50aGVtZSAmJlxuICAgICAgdGhpcy5vcmRlcl9kZXRhaWxzLnRoZW1lLmNvbG9yICYmXG4gICAgICBSZWdFeHAudGVzdCh0aGlzLm9yZGVyX2RldGFpbHMudGhlbWUuY29sb3IpXG4gICAgKSB7XG4gICAgICBjb25zdCB4ID0gJy8/dGhlbWU9JztcbiAgICAgIHJldHVybiB1cmwgKyB4ICsgZW5jb2RlVVJJQ29tcG9uZW50KHRoaXMub3JkZXJfZGV0YWlscy50aGVtZS5jb2xvcik7XG4gICAgfVxuICAgIHJldHVybiB1cmw7XG4gIH07XG5cbiAgVUkuaW5uZXJIVE1MID0gYFxuICAgICAgPGRpdiBjbGFzcz1cImZsYW0tc2RrLWxvYWRpbmctd3JhcHBlclwiIGlkPVwiZmxhbS1zZGstbG9hZGluZy13cmFwcGVyXCI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJmbGFtLXNkay1sb2FkaW5nXCIgaWQ9XCJmbGFtLXNkay1sb2FkaW5nXCI+PGRpdj48L2Rpdj48ZGl2PjwvZGl2PjxkaXY+PC9kaXY+PGRpdj48L2Rpdj48L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICAgPGlmcmFtZSBpZD1cImZsYW0tc2RrLWlmcmFtZVwiIHN0eWxlPVwib3BhY2l0eTogMFwiIG5hbWU9XCJmbGFtLXNkay1pZnJhbWVcIiBzcmM9XCIke25ld1VybCgpfVwiIHN0eWxlPVwib3BhY2l0eTogMFwiPjwvaWZyYW1lPiAgICAgIFxuICAgIGA7XG5cbiAgYm9keS5hcHBlbmRDaGlsZChVSSk7XG5cbiAgY29uc3QgaUZyYW1lID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZsYW0tc2RrLWlmcmFtZScpO1xuXG4gIGlGcmFtZS5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgYXN5bmMgZSA9PiB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgdHJ5IHtcbiAgICAgIC8vIGNoZWNrIGlmIHdlYnNpdGUgYXZhaWxhYmxlIGluIFBST0RVQ1RJT05cbiAgICAgIGlmICh0aGlzLmNsaWVudERhdGEuZW52aXJvbm1lbnQgPT0gJ1BST0RVQ1RJT04nKSB7XG4gICAgICAgIGF3YWl0IGZldGNoKFBBR0VTLm1haW4pO1xuICAgICAgfVxuXG4gICAgICAvLyBoaWRlIGluaXRpYWwgbG9hZGluZ1xuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZsYW0tc2RrLWxvYWRpbmctd3JhcHBlcicpLnN0eWxlLmRpc3BsYXkgPVxuICAgICAgICAnbm9uZSc7XG5cbiAgICAgIC8vIFNob3cgdGhlIGlmcmFtZSBjb250ZW50XG4gICAgICBpRnJhbWUuc3R5bGUub3BhY2l0eSA9ICcxJztcblxuICAgICAgLy8gbWVzc2FnZSBldmVudCBoYW5kbGVyXG4gICAgICB0cmFja09yZGVyID0gZSA9PiB7XG4gICAgICAgIHRoaXMucmVjZWl2ZU1lc3NhZ2UoZSk7XG4gICAgICB9O1xuXG4gICAgICAvLyBldmVudCBsaXN0ZW5lciBmb3IgcmVjZWl2aW5nIG1lc3NhZ2VzIGZyb20gaWZyYW1lXG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIHRyYWNrT3JkZXIpO1xuXG4gICAgICAvLyBzYXZlIHdpbmRvdyBjb250ZXh0IGZvciBzZW5kaW5nIG1lc3NhZ2VzIHRvIGlmcmFtZVxuICAgICAgdGhpcy5pV2luZG93ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZsYW0tc2RrLWlmcmFtZScpLmNvbnRlbnRXaW5kb3c7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBpZiAoZXJyLm1lc3NhZ2UgPT09ICdGYWlsZWQgdG8gZmV0Y2gnKSB7XG4gICAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICAgICAgdGhpcy5jYWxsYmFjayh7XG4gICAgICAgICAgY29kZTogNTAwLFxuICAgICAgICAgIG1lc3NhZ2U6ICdVbmFibGUgdG8gYWNlc3MgU0RLIFdlYnNpdGUhJ1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdGhpcy5jYWxsYmFjayh7XG4gICAgICAgIGNvZGU6IDUwMCxcbiAgICAgICAgbWVzc2FnZTogJ1NvbWV0aGluZyB3ZW50IHdyb25nISdcbiAgICAgIH0pO1xuICAgIH1cbiAgfSk7XG59XG4iLCJpbXBvcnQgeyB0cmFja09yZGVyIH0gZnJvbSAnLi9yZW5kZXJXaXRoUmV0cnknO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjbG9zZSgpIHtcbiAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCB0cmFja09yZGVyKTtcblxuICAvLyByZW1vdmUgdGhlIFVJXG4gIGNvbnN0IGVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmxhbS1zZGstd3JhcHBlcicpO1xuICBpZiAoZWxlbWVudCkge1xuICAgIGVsZW1lbnQucmVtb3ZlKCk7XG4gIH1cblxuICAvLyByZW1vdmUgdGhlIHN0eWxlc1xuICBjb25zdCBzdHlsZVNoZWV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NhYXMtc2RrLXN0eWxlJyk7XG5cbiAgaWYgKHN0eWxlU2hlZXQpIHtcbiAgICBzdHlsZVNoZWV0LnJlbW92ZSgpO1xuICB9XG59XG4iLCJ2YXIgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuXG5mdW5jdGlvbiBhdHRyaWJ1dGUobywgYXR0ciwgdHlwZSwgdGV4dCkge1xuICAgIHR5cGUgPSB0eXBlID09PSAnYXJyYXknID8gJ29iamVjdCcgOiB0eXBlO1xuICAgIGlmIChvICYmIHR5cGVvZiBvW2F0dHJdICE9PSB0eXBlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcih0ZXh0KTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHZhcmlhYmxlKG8sIHR5cGUsIHRleHQpIHtcbiAgICBpZiAodHlwZW9mIG8gIT09IHR5cGUpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKHRleHQpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gdmFsdWUobywgdmFsdWVzLCB0ZXh0KSB7XG4gICAgaWYgKHZhbHVlcy5pbmRleE9mKG8pID09PSAtMSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IodGV4dCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBjaGVjayhvLCBjb25maWcsIGF0dHJpYnV0ZXMpIHtcbiAgICBpZiAoIWNvbmZpZy5vcHRpb25hbCB8fCBvKSB7XG4gICAgICAgIHZhcmlhYmxlKG8sIGNvbmZpZy50eXBlLCBjb25maWcubWVzc2FnZSk7XG4gICAgfVxuICAgIGlmIChjb25maWcudHlwZSA9PT0gJ29iamVjdCcgJiYgYXR0cmlidXRlcykge1xuICAgICAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKGF0dHJpYnV0ZXMpO1xuXG4gICAgICAgIGZvciAodmFyIGluZGV4ID0gMDsgaW5kZXggPCBrZXlzLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICAgICAgdmFyIGEgPSBrZXlzW2luZGV4XTtcbiAgICAgICAgICAgIGlmICghYXR0cmlidXRlc1thXS5vcHRpb25hbCB8fCBvW2FdKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFhdHRyaWJ1dGVzW2FdLmNvbmRpdGlvbiB8fCBhdHRyaWJ1dGVzW2FdLmNvbmRpdGlvbihvKSkge1xuICAgICAgICAgICAgICAgICAgICBhdHRyaWJ1dGUobywgYSwgYXR0cmlidXRlc1thXS50eXBlLCBhdHRyaWJ1dGVzW2FdLm1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoYXR0cmlidXRlc1thXS52YWx1ZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlKG9bYV0sIGF0dHJpYnV0ZXNbYV0udmFsdWVzLCBhdHRyaWJ1dGVzW2FdLnZhbHVlX21lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuXG4vKipcbiAqIFdyYXAgYEFycmF5LmlzQXJyYXlgIFBvbHlmaWxsIGZvciBJRTlcbiAqIHNvdXJjZTogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvQXJyYXkvaXNBcnJheVxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IGFycmF5XG4gKiBAcHJpdmF0ZVxuICovXG5mdW5jdGlvbiBpc0FycmF5KGFycmF5KSB7XG4gICAgaWYgKHRoaXMuc3VwcG9ydHNJc0FycmF5KCkpIHtcbiAgICAgICAgcmV0dXJuIEFycmF5LmlzQXJyYXkoYXJyYXkpO1xuICAgIH1cblxuICAgIHJldHVybiB0b1N0cmluZy5jYWxsKGFycmF5KSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbn1cblxuZnVuY3Rpb24gc3VwcG9ydHNJc0FycmF5KCkge1xuICAgIHJldHVybiBBcnJheS5pc0FycmF5ICE9IG51bGw7XG59XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgICBjaGVjazogY2hlY2ssXG4gICAgYXR0cmlidXRlOiBhdHRyaWJ1dGUsXG4gICAgdmFyaWFibGU6IHZhcmlhYmxlLFxuICAgIHZhbHVlOiB2YWx1ZSxcbiAgICBpc0FycmF5OiBpc0FycmF5LFxuICAgIHN1cHBvcnRzSXNBcnJheTogc3VwcG9ydHNJc0FycmF5XG59OyIsImltcG9ydCB7IFBBR0VTIH0gZnJvbSAnLi9jb25zdGFudHMnO1xuaW1wb3J0IGFzc2VydCBmcm9tICcuL2hlbHBlci9hc3NlcnQnO1xuXG5leHBvcnQgZGVmYXVsdCBhc3luYyBmdW5jdGlvbiBwbGFjZU9yZGVyKG9yZGVyX2RldGFpbHMsIGNhbGxiYWNrKSB7XG4gIHRyeSB7XG4gICAgLy8gdmFsaWRhdGUgY2xpZW50IGRhdGFcbiAgICBhc3NlcnQuY2hlY2soXG4gICAgICB0aGlzLmNsaWVudERhdGEsXG4gICAgICB7IHR5cGU6ICdvYmplY3QnLCBtZXNzYWdlOiAnaW5pdCBkYXRhIGlzIGludmFsaWQnIH0sXG4gICAgICB7XG4gICAgICAgIGtleTogeyB0eXBlOiAnc3RyaW5nJywgbWVzc2FnZTogXCIna2V5JyBpcyByZXF1aXJlZCBzdHJpbmcuXCIgfSxcbiAgICAgICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgICAgICBvcHRpb25hbDogdHJ1ZSxcbiAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICBtZXNzYWdlOiBcIidlbnZpcm9ubWVudCcgbXVzdCBiZSBzdHJpbmcuXCJcbiAgICAgICAgfVxuICAgICAgfVxuICAgICk7XG5cbiAgICAvLyB2YWxpZGF0ZSBvcmRlcl9kZXRhaWxzXG4gICAgYXNzZXJ0LmNoZWNrKFxuICAgICAgb3JkZXJfZGV0YWlscyxcbiAgICAgIHtcbiAgICAgICAgdHlwZTogJ29iamVjdCcsXG4gICAgICAgIG1lc3NhZ2U6IFwiJ29yZGVyIGRldGFpbHMnIGlzIG5vdCB2YWxpZC5cIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgcHJvZHVjdElkOiB7XG4gICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgICAgbWVzc2FnZTogXCIncHJvZHVjdElkJyBpcyByZXF1aXJlZCBzdHJpbmcuXCJcbiAgICAgICAgfSxcbiAgICAgICAgcmVmSWQ6IHsgdHlwZTogJ3N0cmluZycsIG1lc3NhZ2U6IFwiJ3JlZklkJyBpcyByZXF1aXJlZCBzdHJpbmcuXCIgfSxcbiAgICAgICAgcGhvdG86IHtcbiAgICAgICAgICBvcHRpb25hbDogdHJ1ZSxcbiAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICBtZXNzYWdlOiBcIidwaG90bycgbXVzdCBiZSBzdHJpbmcuXCJcbiAgICAgICAgfSxcbiAgICAgICAgdmlkZW86IHtcbiAgICAgICAgICBvcHRpb25hbDogdHJ1ZSxcbiAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICBtZXNzYWdlOiBcIid2aWRlbycgbXVzdCBiZSBzdHJpbmcuXCJcbiAgICAgICAgfSxcbiAgICAgICAgcHJlZmlsbDoge1xuICAgICAgICAgIG9wdGlvbmFsOiB0cnVlLFxuICAgICAgICAgIHR5cGU6ICdvYmplY3QnLFxuICAgICAgICAgIG1lc3NhZ2U6IFwiJ3ByZWZpbGwnIG11c3QgYmUgb2JqZWN0LlwiXG4gICAgICAgIH0sXG4gICAgICAgIGFuaW1hdGlvbjoge1xuICAgICAgICAgIG9wdGlvbmFsOiB0cnVlLFxuICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgIG1lc3NhZ2U6IFwiJ2FuaW1hdGlvbicgbXVzdCBiZSBzdHJpbmcuXCJcbiAgICAgICAgfSxcbiAgICAgICAgdGhlbWU6IHtcbiAgICAgICAgICBvcHRpb25hbDogdHJ1ZSxcbiAgICAgICAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICAgICAgICBtZXNzYWdlOiBcIid0aGVtZScgbXVzdCBiZSBvYmplY3QuXCJcbiAgICAgICAgfSxcbiAgICAgICAgbG9nbzoge1xuICAgICAgICAgIG9wdGlvbmFsOiB0cnVlLFxuICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgIG1lc3NhZ2U6IFwiJ2xvZ28nIG11c3QgYmUgc3RyaW5nLlwiXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICApO1xuXG4gICAgLy8gdmFsaWRhdGUgcHJlZmlsbFxuICAgIGlmIChvcmRlcl9kZXRhaWxzLnByZWZpbGwpIHtcbiAgICAgIGFzc2VydC5jaGVjayhcbiAgICAgICAgb3JkZXJfZGV0YWlscy5wcmVmaWxsLFxuICAgICAgICB7XG4gICAgICAgICAgdHlwZTogJ29iamVjdCcsXG4gICAgICAgICAgbWVzc2FnZTogXCIncHJlZmlsbCcgaXMgbm90IHZhbGlkLlwiXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBuYW1lOiB7XG4gICAgICAgICAgICBvcHRpb25hbDogdHJ1ZSxcbiAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgICAgbWVzc2FnZTogXCInbmFtZScgaXMgcmVxdWlyZWQgc3RyaW5nLlwiXG4gICAgICAgICAgfSxcbiAgICAgICAgICBlbWFpbDoge1xuICAgICAgICAgICAgb3B0aW9uYWw6IHRydWUsXG4gICAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICAgIG1lc3NhZ2U6IFwiJ2VtYWlsJyBpcyByZXF1aXJlZCBzdHJpbmcuXCJcbiAgICAgICAgICB9LFxuICAgICAgICAgIHBob25lOiB7XG4gICAgICAgICAgICBvcHRpb25hbDogdHJ1ZSxcbiAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgICAgbWVzc2FnZTogXCIncGhvbmUnIG11c3QgYmUgc3RyaW5nLlwiXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICApO1xuICAgIH1cblxuICAgIC8vIHZhbGlkYXRlIHRoZW1lXG4gICAgaWYgKG9yZGVyX2RldGFpbHMudGhlbWUpIHtcbiAgICAgIGFzc2VydC5jaGVjayhcbiAgICAgICAgb3JkZXJfZGV0YWlscy50aGVtZSxcbiAgICAgICAge1xuICAgICAgICAgIHR5cGU6ICdvYmplY3QnLFxuICAgICAgICAgIG1lc3NhZ2U6IFwiJ3RoZW1lJyBpcyBub3QgdmFsaWQuXCJcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIGNvbG9yOiB7XG4gICAgICAgICAgICBvcHRpb25hbDogdHJ1ZSxcbiAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgICAgbWVzc2FnZTogXCInbmFtZScgaXMgcmVxdWlyZWQgc3RyaW5nLlwiXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICApO1xuICAgIH1cblxuICAgIC8vIHZhbGlkYXRlIGNhbGxiYWNrIGZ1bmN0aW9uXG4gICAgYXNzZXJ0LmNoZWNrKGNhbGxiYWNrLCB7XG4gICAgICB0eXBlOiAnZnVuY3Rpb24nLFxuICAgICAgbWVzc2FnZTogXCInY2FsbGJhY2snIGlzIHJlcXVpcmVkIGZ1bmN0aW9uLlwiXG4gICAgfSk7XG5cbiAgICAvLyBzYXZlIG9yZGVyX2RldGFpbHNcbiAgICB0aGlzLm9yZGVyX2RldGFpbHMgPSBvcmRlcl9kZXRhaWxzO1xuXG4gICAgLy8gcmVuZGVyIHRoZSBzdWNjZXNzIFVJXG4gICAgbGV0IHVybCA9IGAke1BBR0VTLm1haW59YDtcblxuICAgIHRoaXMuY2FsbGJhY2sgPSBjYWxsYmFjaztcblxuICAgIGF3YWl0IHRoaXMucmVuZGVyV2l0aFJldHJ5KHVybCk7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIGlmIChjYWxsYmFjayAmJiB0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIC8vIHJlbmRlciBlcnJvciBVSVxuICAgICAgbGV0IHVybCA9IGAke1BBR0VTLmVycm9yfS9Tb21ldGhpbmcgd2VudCB3cm9uZyFgO1xuICAgICAgYXdhaXQgdGhpcy5yZW5kZXJXaXRoUmV0cnkodXJsKTtcbiAgICAgIC8vIGNhbGxiYWNrIHRvIGNsaWVudCB3aXRoIGVycm9yXG4gICAgICBhd2FpdCBjYWxsYmFjayh7IGNvZGU6IDQwMCwgbWVzc2FnZTogZXJyLm1lc3NhZ2UgfSwgbnVsbCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IFwiJ2NhbGxiYWNrJyBpcyByZXF1aXJlZCBmdW5jdGlvbi5cIjtcbiAgICB9XG4gIH1cbiAgZG9jdW1lbnQuYWN0aXZlRWxlbWVudC5ibHVyKCk7XG59XG4iLCJpbXBvcnQgeyBQQUdFUyB9IGZyb20gJy4vY29uc3RhbnRzJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcmVjZWl2ZU1lc3NhZ2UoZXZlbnQpIHtcbiAgaWYgKGV2ZW50Lm9yaWdpbiA9PSBQQUdFUy5tYWluKSB7XG4gICAgc3dpdGNoIChldmVudC5kYXRhLnR5cGUpIHtcbiAgICAgIGNhc2UgJ0NMT1NFJzpcbiAgICAgICAgdGhpcy5jbG9zZSgpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ1JFQURZX1RPX1JFQ0VJVkUnOlxuICAgICAgICB0aGlzLnNlbmRNZXNzYWdlKHtcbiAgICAgICAgICB0eXBlOiAnSU5JVElBTF9EQVRBJyxcbiAgICAgICAgICBwYXlsb2FkOiB7XG4gICAgICAgICAgICBjbGllbnRfZGF0YTogdGhpcy5jbGllbnREYXRhLFxuICAgICAgICAgICAgb3JkZXJfZGV0YWlsczogdGhpcy5vcmRlcl9kZXRhaWxzXG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdSRUFEWV9UT19SRUNFSVZFX0VSUic6XG4gICAgICAgIHRoaXMuc2VuZE1lc3NhZ2Uoe1xuICAgICAgICAgIHR5cGU6ICdJTklUSUFMX0RBVEFfRVJSJyxcbiAgICAgICAgICBwYXlsb2FkOiB7XG4gICAgICAgICAgICAuLi50aGlzLmNsaWVudERhdGEsXG4gICAgICAgICAgICBlbWFpbDpcbiAgICAgICAgICAgICAgdGhpcy5vcmRlcl9kZXRhaWxzICYmXG4gICAgICAgICAgICAgIHRoaXMub3JkZXJfZGV0YWlscy5wcmVmaWxsICYmXG4gICAgICAgICAgICAgIHRoaXMub3JkZXJfZGV0YWlscy5wcmVmaWxsLmVtYWlsXG4gICAgICAgICAgICAgICAgPyB0aGlzLm9yZGVyX2RldGFpbHMucHJlZmlsbC5lbWFpbFxuICAgICAgICAgICAgICAgIDogJycsXG4gICAgICAgICAgICBwaG9uZTpcbiAgICAgICAgICAgICAgdGhpcy5vcmRlcl9kZXRhaWxzICYmXG4gICAgICAgICAgICAgIHRoaXMub3JkZXJfZGV0YWlscy5wcmVmaWxsICYmXG4gICAgICAgICAgICAgIHRoaXMub3JkZXJfZGV0YWlscy5wcmVmaWxsLnBob25lXG4gICAgICAgICAgICAgICAgPyB0aGlzLm9yZGVyX2RldGFpbHMucHJlZmlsbC5waG9uZVxuICAgICAgICAgICAgICAgIDogJydcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ0NSRUFURUQnOlxuICAgICAgICB0aGlzLmNhbGxiYWNrKG51bGwsIHtcbiAgICAgICAgICBjb2RlOiAyMDEsXG4gICAgICAgICAgZGF0YTogZXZlbnQuZGF0YS5wYXlsb2FkLFxuICAgICAgICAgIG1lc3NhZ2U6ICdPcmRlciBwbGFjZWQgc3VjY2Vzc2Z1bGx5ISdcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdFUlJPUic6XG4gICAgICAgIHRoaXMuY2FsbGJhY2soXG4gICAgICAgICAge1xuICAgICAgICAgICAgY29kZTogZXZlbnQuZGF0YS5wYXlsb2FkLmNvZGUsXG4gICAgICAgICAgICBtZXNzYWdlOiBldmVudC5kYXRhLnBheWxvYWQubWVzc2FnZVxuICAgICAgICAgIH0sXG4gICAgICAgICAgbnVsbFxuICAgICAgICApO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cbn1cbiIsImltcG9ydCB7IFBBR0VTIH0gZnJvbSAnLi9jb25zdGFudHMnO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBzZW5kTWVzc2FnZShtZXNzYWdlKSB7XG4gIHRoaXMuaVdpbmRvdy5wb3N0TWVzc2FnZShtZXNzYWdlLCBQQUdFUy5tYWluKTtcbn1cbiIsImltcG9ydCBjbG9zZUlmcmFtZSBmcm9tICcuL2Nsb3NlSUZyYW1lJztcbmltcG9ydCBhc3NlcnQgZnJvbSAnLi9oZWxwZXIvYXNzZXJ0JztcbmltcG9ydCBwbGFjZU9yZGVyIGZyb20gJy4vcGxhY2VPcmRlcic7XG5pbXBvcnQgcmVjZWl2ZU1lc3NhZ2UgZnJvbSAnLi9yZWNlaXZlTWVzc2FnZSc7XG5pbXBvcnQgcmVuZGVyV2l0aFJldHJ5IGZyb20gJy4vcmVuZGVyV2l0aFJldHJ5JztcbmltcG9ydCBzZW5kTWVzc2FnZSBmcm9tICcuL3NlbmRNZXNzYWdlJztcblxuLyoqXG4gKiBJbml0aWFsaXplcyBhIFNESyBpbnN0YW5jZVxuICogQGNvbnN0cnVjdG9yXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogQHBhcmFtIHtTdHJpbmd9IG9wdGlvbnMua2V5IHRoZSBBUEkgS2V5IGZvdW5kIG9uIHlvdXIgQXBwbGljYXRpb24gc2V0dGluZ3MgcGFnZVxuICogQHBhcmFtIHtTdHJpbmd9IFtvcHRpb25zLmVudmlyb25tZW50XSBlbnZpb3JubWVudCBTQU5EQk9YIHwgUFJPRFVDVElPTlxuICovXG5mdW5jdGlvbiBpbml0KG9wdGlvbnMpIHtcbiAgLyogZXNsaW50LWRpc2FibGUgKi9cblxuICAvLyB2YWxpZGF0ZSB0aGUgY2xpZW50J3MgaW5wdXQgZm9yICdpbml0J1xuICB0cnkge1xuICAgIGFzc2VydC5jaGVjayhcbiAgICAgIG9wdGlvbnMsXG4gICAgICB7IHR5cGU6ICdvYmplY3QnLCBtZXNzYWdlOiAnaW5pdCBwYXJhbWV0ZXIgaXMgbm90IHZhbGlkLicgfSxcbiAgICAgIHtcbiAgICAgICAga2V5OiB7IHR5cGU6ICdzdHJpbmcnLCBtZXNzYWdlOiBcIidrZXknIGlzIHJlcXVpcmVkIHN0cmluZy5cIiB9LFxuICAgICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICAgIG9wdGlvbmFsOiB0cnVlLFxuICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgIG1lc3NhZ2U6IFwiJ2Vudmlyb25tZW50JyBtdXN0IGJlIHN0cmluZy5cIlxuICAgICAgICB9XG4gICAgICB9XG4gICAgKTtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgLy8gYXNzZXJ0IG1ldGhvZCBhYm92ZSB0aHJvd3MgZXJyb3Igd2l0aCBnaXZlbiBtZXNzYWdlIHdoaWNoIHdlIGZ1cnRoZXIgdGhyb3cgdG8gY2xpZW50LlxuICAgIGlmIChlcnIgJiYgZXJyLm1lc3NhZ2UpIHtcbiAgICAgIHRocm93IGVyci5tZXNzYWdlO1xuICAgIH1cbiAgICB0aHJvdyAnU29tZXRoaW5nIHdlbnQgd3JvbmchJztcbiAgfVxuXG4gIC8vIHNldCBlbnZpcm9ubWVudCB0byAnUFJPRFVDVElPTicgaWYgc3RhdGVkIGJ5IGNsaWVudCwgb3RoZXJ3aXNlICdTQU5EQk9YJ1xuICBvcHRpb25zLmVudmlyb25tZW50ID1cbiAgICBvcHRpb25zICYmXG4gICAgdHlwZW9mIG9wdGlvbnMuZW52aXJvbm1lbnQgPT09ICdzdHJpbmcnICYmXG4gICAgb3B0aW9ucy5lbnZpcm9ubWVudC50b1VwcGVyQ2FzZSgpID09PSAnUFJPRFVDVElPTidcbiAgICAgID8gJ1BST0RVQ1RJT04nXG4gICAgICA6ICdTQU5EQk9YJztcblxuICAvLyBzYXZlIG9wdGlvbnMgdG8gY2xpZW50RGF0YVxuICB0aGlzLmNsaWVudERhdGEgPSBvcHRpb25zO1xuXG4gIC8qIGVzbGludC1lbmFibGUgKi9cbn1cblxuLy8gY29yZSBtZXRob2RzXG5pbml0LnByb3RvdHlwZS5yZW5kZXJXaXRoUmV0cnkgPSByZW5kZXJXaXRoUmV0cnk7XG5pbml0LnByb3RvdHlwZS5wbGFjZU9yZGVyID0gcGxhY2VPcmRlcjtcbmluaXQucHJvdG90eXBlLnJlY2VpdmVNZXNzYWdlID0gcmVjZWl2ZU1lc3NhZ2U7XG5pbml0LnByb3RvdHlwZS5zZW5kTWVzc2FnZSA9IHNlbmRNZXNzYWdlO1xuaW5pdC5wcm90b3R5cGUuY2xvc2UgPSBjbG9zZUlmcmFtZTtcblxuZXhwb3J0IGRlZmF1bHQgaW5pdDtcbiIsIm1vZHVsZS5leHBvcnRzID0geyByYXc6ICcxLjAuMycgfTsiLCJpbXBvcnQgaW5pdCBmcm9tICcuL3Nkayc7XG5pbXBvcnQgdmVyc2lvbiBmcm9tICcuL3ZlcnNpb24nO1xuXG5leHBvcnQgeyB2ZXJzaW9uLCBpbml0IH07XG5cbmV4cG9ydCBkZWZhdWx0IHsgdmVyc2lvbjogdmVyc2lvbiwgaW5pdDogaW5pdCB9O1xuIl0sIm5hbWVzIjpbImNsb3NlSWZyYW1lIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0VBQUE7RUFDQSxNQUFNLFlBQVksR0FBRyx1QkFBdUIsQ0FBQztBQUM3QztFQUNPLE1BQU0sS0FBSyxHQUFHO0VBQ3JCLEVBQUUsSUFBSSxFQUFFLFlBQVk7RUFDcEIsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLFlBQVksQ0FBQyxNQUFNLENBQUM7RUFDaEMsQ0FBQzs7RUNKTSxJQUFJLFVBQVUsR0FBRyxJQUFJLENBQUM7QUFDN0I7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0FBQ0E7QUFDQSxFQUFlLGVBQWUsZUFBZSxDQUFDLEdBQUcsRUFBRTtFQUNuRCxFQUFFLE1BQU0sSUFBSSxHQUFHLFFBQVEsQ0FBQyxh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
