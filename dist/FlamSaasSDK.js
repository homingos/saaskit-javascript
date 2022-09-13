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

  const SDK_BASE_URL = 'https://saas-sdk-flam.vercel.app';
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRmxhbVNhYXNTREsuanMiLCJzb3VyY2VzIjpbIi4uL3NyYy9jb25zdGFudHMuanMiLCIuLi9zcmMvcmVuZGVyV2l0aFJldHJ5LmpzIiwiLi4vc3JjL2Nsb3NlSUZyYW1lLmpzIiwiLi4vc3JjL2hlbHBlci9hc3NlcnQuanMiLCIuLi9zcmMvcGxhY2VPcmRlci5qcyIsIi4uL3NyYy9yZWNlaXZlTWVzc2FnZS5qcyIsIi4uL3NyYy9zZW5kTWVzc2FnZS5qcyIsIi4uL3NyYy9zZGsuanMiLCIuLi9zcmMvdmVyc2lvbi5qcyIsIi4uL3NyYy9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBTREtfQkFTRV9VUkwgPSAnaHR0cHM6Ly9zYWFzLXNkay1mbGFtLnZlcmNlbC5hcHAnO1xuLy8gY29uc3QgU0RLX0JBU0VfVVJMID0gJ2h0dHA6Ly9sb2NhbGhvc3Q6MzAwMCc7XG5cbmV4cG9ydCBjb25zdCBQQUdFUyA9IHtcbiAgbWFpbjogU0RLX0JBU0VfVVJMLFxuICBlcnJvcjogYCR7U0RLX0JBU0VfVVJMfS9lcnJvcmBcbn07XG4iLCJpbXBvcnQgeyBQQUdFUyB9IGZyb20gJy4vY29uc3RhbnRzJztcblxuZXhwb3J0IGxldCB0cmFja09yZGVyID0gbnVsbDtcblxuLyoqXG4gKiBSZW5kZXJzIHRoZSBVSSBmb3IgUGxhY2luZyBPcmRlclxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsIHVybCB0byBlaXRoZXIgb3JkZXIgZmxvdyBvciBlcnJvciBwYWdlXG4gKi9cblxuZXhwb3J0IGRlZmF1bHQgYXN5bmMgZnVuY3Rpb24gcmVuZGVyV2l0aFJldHJ5KHVybCkge1xuICBjb25zdCBib2R5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpO1xuXG4gIGNvbnN0IHN0eWxlU2hlZXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuICBzdHlsZVNoZWV0LnR5cGUgPSAndGV4dC9jc3MnO1xuICBzdHlsZVNoZWV0LmlkID0gJ3NhYXMtc2RrLXN0eWxlJztcbiAgc3R5bGVTaGVldC5pbm5lclRleHQgPSBgXG4gICAgYm9keSB7XG4gICAgICBvdmVyZmxvdzogaGlkZGVuO1xuICAgIH1cblxuICAgIC5mbGFtLXNkay1sb2FkaW5nLXdyYXBwZXIge1xuICAgICAgcG9zaXRpb246IGZpeGVkO1xuICAgICAgdG9wOiAwO1xuICAgICAgcmlnaHQ6IDA7XG4gICAgICBib3R0b206IDA7XG4gICAgICBsZWZ0OiAwO1xuXG4gICAgICBtaW4taGVpZ2h0OiAxMDB2aDtcbiAgICAgIG1pbi13aWR0aDogMTAwdnc7XG4gICAgICBvdmVyZmxvdzogaGlkZGVuO1xuICAgICAgYm9yZGVyOiBub25lO1xuICAgICAgYmFja2dyb3VuZDogcmdiYSgwLDAsMCwgMC40KTtcblxuICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICB9XG5cbiAgICAjZmxhbS1zZGstaWZyYW1lIHtcbiAgICAgIHBvc2l0aW9uOiBmaXhlZDtcbiAgICAgIHRvcDogMDtcbiAgICAgIHJpZ2h0OiAwO1xuICAgICAgYm90dG9tOiAwO1xuICAgICAgbGVmdDogMDtcblxuICAgICAgbWluLWhlaWdodDogMTAwdmg7XG4gICAgICBtaW4td2lkdGg6IDEwMHZ3O1xuICAgICAgYm9yZGVyOiBub25lO1xuICAgIH1cblxuICAgIC5mbGFtLXNkay1sb2FkaW5nIHtcbiAgICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgICAgIHdpZHRoOiA4MHB4O1xuICAgICAgaGVpZ2h0OiA4MHB4O1xuICAgIH1cblxuICAgIC5mbGFtLXNkay1sb2FkaW5nIGRpdiB7XG4gICAgICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xuICAgICAgZGlzcGxheTogYmxvY2s7XG4gICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgICB3aWR0aDogNjRweDtcbiAgICAgIGhlaWdodDogNjRweDtcbiAgICAgIG1hcmdpbjogOHB4O1xuICAgICAgYm9yZGVyOiAzcHggc29saWQgIzAwMDtcbiAgICAgIGJvcmRlci1yYWRpdXM6IDUwJTtcbiAgICAgIGFuaW1hdGlvbjogZmxhbS1zZGstbG9hZGluZyAxLjJzIGN1YmljLWJlemllcigwLjUsIDAsIDAuNSwgMSkgaW5maW5pdGU7XG4gICAgICBib3JkZXItY29sb3I6ICMwMDAgdHJhbnNwYXJlbnQgdHJhbnNwYXJlbnQgdHJhbnNwYXJlbnQ7XG4gICAgfVxuICAgIC5mbGFtLXNkay1sb2FkaW5nIGRpdjpudGgtY2hpbGQoMSkge1xuICAgICAgYW5pbWF0aW9uLWRlbGF5OiAtMC40NXM7XG4gICAgfVxuICAgIC5mbGFtLXNkay1sb2FkaW5nIGRpdjpudGgtY2hpbGQoMikge1xuICAgICAgYW5pbWF0aW9uLWRlbGF5OiAtMC4zcztcbiAgICB9XG4gICAgLmZsYW0tc2RrLWxvYWRpbmcgZGl2Om50aC1jaGlsZCgzKSB7XG4gICAgICBhbmltYXRpb24tZGVsYXk6IC0wLjE1cztcbiAgICB9XG4gICAgQGtleWZyYW1lcyBmbGFtLXNkay1sb2FkaW5nIHtcbiAgICAgIDAlIHtcbiAgICAgICAgdHJhbnNmb3JtOiByb3RhdGUoMGRlZyk7XG4gICAgICB9XG4gICAgICAxMDAlIHtcbiAgICAgICAgdHJhbnNmb3JtOiByb3RhdGUoMzYwZGVnKTtcbiAgICAgIH1cbiAgICB9XG4gIGA7XG5cbiAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzdHlsZVNoZWV0KTtcblxuICBjb25zdCBVSSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICBVSS5pZCA9ICdmbGFtLXNkay13cmFwcGVyJztcblxuICB2YXIgUmVnRXhwID0gLyheI1swLTlBLUZdezZ9JCl8KF4jWzAtOUEtRl17M30kKS9pO1xuXG4gIGNvbnN0IG5ld1VybCA9ICgpID0+IHtcbiAgICBpZiAoXG4gICAgICB0aGlzLm9yZGVyX2RldGFpbHMgJiZcbiAgICAgIHRoaXMub3JkZXJfZGV0YWlscy50aGVtZSAmJlxuICAgICAgdGhpcy5vcmRlcl9kZXRhaWxzLnRoZW1lLmNvbG9yICYmXG4gICAgICBSZWdFeHAudGVzdCh0aGlzLm9yZGVyX2RldGFpbHMudGhlbWUuY29sb3IpXG4gICAgKSB7XG4gICAgICBjb25zdCB4ID0gJy8/dGhlbWU9JztcbiAgICAgIHJldHVybiB1cmwgKyB4ICsgZW5jb2RlVVJJQ29tcG9uZW50KHRoaXMub3JkZXJfZGV0YWlscy50aGVtZS5jb2xvcik7XG4gICAgfVxuICAgIHJldHVybiB1cmw7XG4gIH07XG5cbiAgVUkuaW5uZXJIVE1MID0gYFxuICAgICAgPGRpdiBjbGFzcz1cImZsYW0tc2RrLWxvYWRpbmctd3JhcHBlclwiIGlkPVwiZmxhbS1zZGstbG9hZGluZy13cmFwcGVyXCI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJmbGFtLXNkay1sb2FkaW5nXCIgaWQ9XCJmbGFtLXNkay1sb2FkaW5nXCI+PGRpdj48L2Rpdj48ZGl2PjwvZGl2PjxkaXY+PC9kaXY+PGRpdj48L2Rpdj48L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICAgPGlmcmFtZSBpZD1cImZsYW0tc2RrLWlmcmFtZVwiIHN0eWxlPVwib3BhY2l0eTogMFwiIG5hbWU9XCJmbGFtLXNkay1pZnJhbWVcIiBzcmM9XCIke25ld1VybCgpfVwiIHN0eWxlPVwib3BhY2l0eTogMFwiPjwvaWZyYW1lPiAgICAgIFxuICAgIGA7XG5cbiAgYm9keS5hcHBlbmRDaGlsZChVSSk7XG5cbiAgY29uc3QgaUZyYW1lID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZsYW0tc2RrLWlmcmFtZScpO1xuXG4gIGlGcmFtZS5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgYXN5bmMgZSA9PiB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgdHJ5IHtcbiAgICAgIC8vIGNoZWNrIGlmIHdlYnNpdGUgYXZhaWxhYmxlIGluIFBST0RVQ1RJT05cbiAgICAgIGlmICh0aGlzLmNsaWVudERhdGEuZW52aXJvbm1lbnQgPT0gJ1BST0RVQ1RJT04nKSB7XG4gICAgICAgIGF3YWl0IGZldGNoKFBBR0VTLm1haW4pO1xuICAgICAgfVxuXG4gICAgICAvLyBoaWRlIGluaXRpYWwgbG9hZGluZ1xuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZsYW0tc2RrLWxvYWRpbmctd3JhcHBlcicpLnN0eWxlLmRpc3BsYXkgPVxuICAgICAgICAnbm9uZSc7XG5cbiAgICAgIC8vIFNob3cgdGhlIGlmcmFtZSBjb250ZW50XG4gICAgICBpRnJhbWUuc3R5bGUub3BhY2l0eSA9ICcxJztcblxuICAgICAgLy8gbWVzc2FnZSBldmVudCBoYW5kbGVyXG4gICAgICB0cmFja09yZGVyID0gZSA9PiB7XG4gICAgICAgIHRoaXMucmVjZWl2ZU1lc3NhZ2UoZSk7XG4gICAgICB9O1xuXG4gICAgICAvLyBldmVudCBsaXN0ZW5lciBmb3IgcmVjZWl2aW5nIG1lc3NhZ2VzIGZyb20gaWZyYW1lXG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIHRyYWNrT3JkZXIpO1xuXG4gICAgICAvLyBzYXZlIHdpbmRvdyBjb250ZXh0IGZvciBzZW5kaW5nIG1lc3NhZ2VzIHRvIGlmcmFtZVxuICAgICAgdGhpcy5pV2luZG93ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZsYW0tc2RrLWlmcmFtZScpLmNvbnRlbnRXaW5kb3c7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBpZiAoZXJyLm1lc3NhZ2UgPT09ICdGYWlsZWQgdG8gZmV0Y2gnKSB7XG4gICAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICAgICAgdGhpcy5jYWxsYmFjayh7XG4gICAgICAgICAgY29kZTogNTAwLFxuICAgICAgICAgIG1lc3NhZ2U6ICdVbmFibGUgdG8gYWNlc3MgU0RLIFdlYnNpdGUhJ1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdGhpcy5jYWxsYmFjayh7XG4gICAgICAgIGNvZGU6IDUwMCxcbiAgICAgICAgbWVzc2FnZTogJ1NvbWV0aGluZyB3ZW50IHdyb25nISdcbiAgICAgIH0pO1xuICAgIH1cbiAgfSk7XG59XG4iLCJpbXBvcnQgeyB0cmFja09yZGVyIH0gZnJvbSAnLi9yZW5kZXJXaXRoUmV0cnknO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjbG9zZSgpIHtcbiAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCB0cmFja09yZGVyKTtcblxuICAvLyByZW1vdmUgdGhlIFVJXG4gIGNvbnN0IGVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmxhbS1zZGstd3JhcHBlcicpO1xuICBpZiAoZWxlbWVudCkge1xuICAgIGVsZW1lbnQucmVtb3ZlKCk7XG4gIH1cblxuICAvLyByZW1vdmUgdGhlIHN0eWxlc1xuICBjb25zdCBzdHlsZVNoZWV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NhYXMtc2RrLXN0eWxlJyk7XG5cbiAgaWYgKHN0eWxlU2hlZXQpIHtcbiAgICBzdHlsZVNoZWV0LnJlbW92ZSgpO1xuICB9XG59XG4iLCJ2YXIgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuXG5mdW5jdGlvbiBhdHRyaWJ1dGUobywgYXR0ciwgdHlwZSwgdGV4dCkge1xuICAgIHR5cGUgPSB0eXBlID09PSAnYXJyYXknID8gJ29iamVjdCcgOiB0eXBlO1xuICAgIGlmIChvICYmIHR5cGVvZiBvW2F0dHJdICE9PSB0eXBlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcih0ZXh0KTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHZhcmlhYmxlKG8sIHR5cGUsIHRleHQpIHtcbiAgICBpZiAodHlwZW9mIG8gIT09IHR5cGUpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKHRleHQpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gdmFsdWUobywgdmFsdWVzLCB0ZXh0KSB7XG4gICAgaWYgKHZhbHVlcy5pbmRleE9mKG8pID09PSAtMSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IodGV4dCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBjaGVjayhvLCBjb25maWcsIGF0dHJpYnV0ZXMpIHtcbiAgICBpZiAoIWNvbmZpZy5vcHRpb25hbCB8fCBvKSB7XG4gICAgICAgIHZhcmlhYmxlKG8sIGNvbmZpZy50eXBlLCBjb25maWcubWVzc2FnZSk7XG4gICAgfVxuICAgIGlmIChjb25maWcudHlwZSA9PT0gJ29iamVjdCcgJiYgYXR0cmlidXRlcykge1xuICAgICAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKGF0dHJpYnV0ZXMpO1xuXG4gICAgICAgIGZvciAodmFyIGluZGV4ID0gMDsgaW5kZXggPCBrZXlzLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICAgICAgdmFyIGEgPSBrZXlzW2luZGV4XTtcbiAgICAgICAgICAgIGlmICghYXR0cmlidXRlc1thXS5vcHRpb25hbCB8fCBvW2FdKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFhdHRyaWJ1dGVzW2FdLmNvbmRpdGlvbiB8fCBhdHRyaWJ1dGVzW2FdLmNvbmRpdGlvbihvKSkge1xuICAgICAgICAgICAgICAgICAgICBhdHRyaWJ1dGUobywgYSwgYXR0cmlidXRlc1thXS50eXBlLCBhdHRyaWJ1dGVzW2FdLm1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoYXR0cmlidXRlc1thXS52YWx1ZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlKG9bYV0sIGF0dHJpYnV0ZXNbYV0udmFsdWVzLCBhdHRyaWJ1dGVzW2FdLnZhbHVlX21lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuXG4vKipcbiAqIFdyYXAgYEFycmF5LmlzQXJyYXlgIFBvbHlmaWxsIGZvciBJRTlcbiAqIHNvdXJjZTogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvQXJyYXkvaXNBcnJheVxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IGFycmF5XG4gKiBAcHJpdmF0ZVxuICovXG5mdW5jdGlvbiBpc0FycmF5KGFycmF5KSB7XG4gICAgaWYgKHRoaXMuc3VwcG9ydHNJc0FycmF5KCkpIHtcbiAgICAgICAgcmV0dXJuIEFycmF5LmlzQXJyYXkoYXJyYXkpO1xuICAgIH1cblxuICAgIHJldHVybiB0b1N0cmluZy5jYWxsKGFycmF5KSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbn1cblxuZnVuY3Rpb24gc3VwcG9ydHNJc0FycmF5KCkge1xuICAgIHJldHVybiBBcnJheS5pc0FycmF5ICE9IG51bGw7XG59XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgICBjaGVjazogY2hlY2ssXG4gICAgYXR0cmlidXRlOiBhdHRyaWJ1dGUsXG4gICAgdmFyaWFibGU6IHZhcmlhYmxlLFxuICAgIHZhbHVlOiB2YWx1ZSxcbiAgICBpc0FycmF5OiBpc0FycmF5LFxuICAgIHN1cHBvcnRzSXNBcnJheTogc3VwcG9ydHNJc0FycmF5XG59OyIsImltcG9ydCB7IFBBR0VTIH0gZnJvbSAnLi9jb25zdGFudHMnO1xuaW1wb3J0IGFzc2VydCBmcm9tICcuL2hlbHBlci9hc3NlcnQnO1xuXG4vKipcbiAqIFJ1bnMgdGhlIFNESyBmb3IgUGxhY2luZyBPcmRlclxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogQHBhcmFtIHtTdHJpbmd9IG9wdGlvbnMua2V5IHRoZSBBUEkgS2V5IGZvdW5kIG9uIHlvdXIgQXBwbGljYXRpb24gc2V0dGluZ3MgcGFnZVxuICogQHBhcmFtIHtTdHJpbmd9IFtvcHRpb25zLmVudmlyb25tZW50XSBlbnZpb3JubWVudCBzYW5kYm94IHwgcHJvZHVjdGlvblxuICovXG5cbi8vIFRPRE86IHdyaXRlIHRoZSBwYXJhbWV0ZXIgZGVzY3JpcHRpb25zXG5cbmV4cG9ydCBkZWZhdWx0IGFzeW5jIGZ1bmN0aW9uIHBsYWNlT3JkZXIob3JkZXJfZGV0YWlscywgY2FsbGJhY2spIHtcbiAgdHJ5IHtcbiAgICAvLyB2YWxpZGF0ZSBjbGllbnQgZGF0YVxuICAgIGFzc2VydC5jaGVjayhcbiAgICAgIHRoaXMuY2xpZW50RGF0YSxcbiAgICAgIHsgdHlwZTogJ29iamVjdCcsIG1lc3NhZ2U6ICdpbml0IGRhdGEgaXMgaW52YWxpZCcgfSxcbiAgICAgIHtcbiAgICAgICAga2V5OiB7IHR5cGU6ICdzdHJpbmcnLCBtZXNzYWdlOiBcIidrZXknIGlzIHJlcXVpcmVkIHN0cmluZy5cIiB9LFxuICAgICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICAgIG9wdGlvbmFsOiB0cnVlLFxuICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgIG1lc3NhZ2U6IFwiJ2Vudmlyb25tZW50JyBtdXN0IGJlIHN0cmluZy5cIlxuICAgICAgICB9XG4gICAgICB9XG4gICAgKTtcblxuICAgIC8vIHZhbGlkYXRlIG9yZGVyX2RldGFpbHNcbiAgICBhc3NlcnQuY2hlY2soXG4gICAgICBvcmRlcl9kZXRhaWxzLFxuICAgICAge1xuICAgICAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICAgICAgbWVzc2FnZTogXCInb3JkZXIgZGV0YWlscycgaXMgbm90IHZhbGlkLlwiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBwcm9kdWN0SWQ6IHtcbiAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICBtZXNzYWdlOiBcIidwcm9kdWN0SWQnIGlzIHJlcXVpcmVkIHN0cmluZy5cIlxuICAgICAgICB9LFxuICAgICAgICByZWZJZDogeyB0eXBlOiAnc3RyaW5nJywgbWVzc2FnZTogXCIncmVmSWQnIGlzIHJlcXVpcmVkIHN0cmluZy5cIiB9LFxuICAgICAgICBwaG90bzoge1xuICAgICAgICAgIG9wdGlvbmFsOiB0cnVlLFxuICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgIG1lc3NhZ2U6IFwiJ3Bob3RvJyBtdXN0IGJlIHN0cmluZy5cIlxuICAgICAgICB9LFxuICAgICAgICB2aWRlbzoge1xuICAgICAgICAgIG9wdGlvbmFsOiB0cnVlLFxuICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgIG1lc3NhZ2U6IFwiJ3ZpZGVvJyBtdXN0IGJlIHN0cmluZy5cIlxuICAgICAgICB9LFxuICAgICAgICBwcmVmaWxsOiB7XG4gICAgICAgICAgb3B0aW9uYWw6IHRydWUsXG4gICAgICAgICAgdHlwZTogJ29iamVjdCcsXG4gICAgICAgICAgbWVzc2FnZTogXCIncHJlZmlsbCcgbXVzdCBiZSBvYmplY3QuXCJcbiAgICAgICAgfSxcbiAgICAgICAgYW5pbWF0aW9uOiB7XG4gICAgICAgICAgb3B0aW9uYWw6IHRydWUsXG4gICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgICAgbWVzc2FnZTogXCInYW5pbWF0aW9uJyBtdXN0IGJlIHN0cmluZy5cIlxuICAgICAgICB9LFxuICAgICAgICB0aGVtZToge1xuICAgICAgICAgIG9wdGlvbmFsOiB0cnVlLFxuICAgICAgICAgIHR5cGU6ICdvYmplY3QnLFxuICAgICAgICAgIG1lc3NhZ2U6IFwiJ3RoZW1lJyBtdXN0IGJlIG9iamVjdC5cIlxuICAgICAgICB9LFxuICAgICAgICBsb2dvOiB7XG4gICAgICAgICAgb3B0aW9uYWw6IHRydWUsXG4gICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgICAgbWVzc2FnZTogXCInbG9nbycgbXVzdCBiZSBzdHJpbmcuXCJcbiAgICAgICAgfVxuICAgICAgfVxuICAgICk7XG5cbiAgICAvLyB2YWxpZGF0ZSBjYWxsYmFjayBmdW5jdGlvblxuICAgIGFzc2VydC5jaGVjayhjYWxsYmFjaywge1xuICAgICAgdHlwZTogJ2Z1bmN0aW9uJyxcbiAgICAgIG1lc3NhZ2U6IFwiJ2NhbGxiYWNrJyBpcyByZXF1aXJlZCBmdW5jdGlvbi5cIlxuICAgIH0pO1xuXG4gICAgLy8gc2F2ZSBvcmRlcl9kZXRhaWxzXG4gICAgdGhpcy5vcmRlcl9kZXRhaWxzID0gb3JkZXJfZGV0YWlscztcblxuICAgIC8vIHJlbmRlciB0aGUgc3VjY2VzcyBVSVxuICAgIGxldCB1cmwgPSBgJHtQQUdFUy5tYWlufWA7XG5cbiAgICB0aGlzLmNhbGxiYWNrID0gY2FsbGJhY2s7XG5cbiAgICBhd2FpdCB0aGlzLnJlbmRlcldpdGhSZXRyeSh1cmwpO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICBpZiAoY2FsbGJhY2sgJiYgdHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAvLyByZW5kZXIgZXJyb3IgVUlcbiAgICAgIGxldCB1cmwgPSBgJHtQQUdFUy5lcnJvcn0vU29tZXRoaW5nIHdlbnQgd3JvbmchYDtcbiAgICAgIGF3YWl0IHRoaXMucmVuZGVyV2l0aFJldHJ5KHVybCk7XG4gICAgICAvLyBjYWxsYmFjayB0byBjbGllbnQgd2l0aCBlcnJvclxuICAgICAgYXdhaXQgY2FsbGJhY2soeyBjb2RlOiA0MDAsIG1lc3NhZ2U6IGVyci5tZXNzYWdlIH0sIG51bGwpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBcIidjYWxsYmFjaycgaXMgcmVxdWlyZWQgZnVuY3Rpb24uXCI7XG4gICAgfVxuICB9XG4gIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQuYmx1cigpO1xufVxuIiwiaW1wb3J0IHsgUEFHRVMgfSBmcm9tICcuL2NvbnN0YW50cyc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHJlY2VpdmVNZXNzYWdlKGV2ZW50KSB7XG4gIGlmIChldmVudC5vcmlnaW4gPT0gUEFHRVMubWFpbikge1xuICAgIHN3aXRjaCAoZXZlbnQuZGF0YS50eXBlKSB7XG4gICAgICBjYXNlICdDTE9TRSc6XG4gICAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdSRUFEWV9UT19SRUNFSVZFJzpcbiAgICAgICAgdGhpcy5zZW5kTWVzc2FnZSh7XG4gICAgICAgICAgdHlwZTogJ0lOSVRJQUxfREFUQScsXG4gICAgICAgICAgcGF5bG9hZDoge1xuICAgICAgICAgICAgY2xpZW50X2RhdGE6IHRoaXMuY2xpZW50RGF0YSxcbiAgICAgICAgICAgIG9yZGVyX2RldGFpbHM6IHRoaXMub3JkZXJfZGV0YWlsc1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnUkVBRFlfVE9fUkVDRUlWRV9FUlInOlxuICAgICAgICB0aGlzLnNlbmRNZXNzYWdlKHtcbiAgICAgICAgICB0eXBlOiAnSU5JVElBTF9EQVRBX0VSUicsXG4gICAgICAgICAgcGF5bG9hZDoge1xuICAgICAgICAgICAgLi4udGhpcy5jbGllbnREYXRhLFxuICAgICAgICAgICAgZW1haWw6XG4gICAgICAgICAgICAgIHRoaXMub3JkZXJfZGV0YWlscyAmJlxuICAgICAgICAgICAgICB0aGlzLm9yZGVyX2RldGFpbHMucHJlZmlsbCAmJlxuICAgICAgICAgICAgICB0aGlzLm9yZGVyX2RldGFpbHMucHJlZmlsbC5lbWFpbFxuICAgICAgICAgICAgICAgID8gdGhpcy5vcmRlcl9kZXRhaWxzLnByZWZpbGwuZW1haWxcbiAgICAgICAgICAgICAgICA6ICcnLFxuICAgICAgICAgICAgcGhvbmU6XG4gICAgICAgICAgICAgIHRoaXMub3JkZXJfZGV0YWlscyAmJlxuICAgICAgICAgICAgICB0aGlzLm9yZGVyX2RldGFpbHMucHJlZmlsbCAmJlxuICAgICAgICAgICAgICB0aGlzLm9yZGVyX2RldGFpbHMucHJlZmlsbC5waG9uZVxuICAgICAgICAgICAgICAgID8gdGhpcy5vcmRlcl9kZXRhaWxzLnByZWZpbGwucGhvbmVcbiAgICAgICAgICAgICAgICA6ICcnXG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdDUkVBVEVEJzpcbiAgICAgICAgdGhpcy5jYWxsYmFjayhudWxsLCB7XG4gICAgICAgICAgY29kZTogMjAxLFxuICAgICAgICAgIGRhdGE6IGV2ZW50LmRhdGEucGF5bG9hZCxcbiAgICAgICAgICBtZXNzYWdlOiAnT3JkZXIgcGxhY2VkIHN1Y2Nlc3NmdWxseSEnXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmNsb3NlKCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnRVJST1InOlxuICAgICAgICB0aGlzLmNhbGxiYWNrKFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIGNvZGU6IGV2ZW50LmRhdGEucGF5bG9hZC5jb2RlLFxuICAgICAgICAgICAgbWVzc2FnZTogZXZlbnQuZGF0YS5wYXlsb2FkLm1lc3NhZ2VcbiAgICAgICAgICB9LFxuICAgICAgICAgIG51bGxcbiAgICAgICAgKTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG59XG4iLCJpbXBvcnQgeyBQQUdFUyB9IGZyb20gJy4vY29uc3RhbnRzJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gc2VuZE1lc3NhZ2UobWVzc2FnZSkge1xuICB0aGlzLmlXaW5kb3cucG9zdE1lc3NhZ2UobWVzc2FnZSwgUEFHRVMubWFpbik7XG59XG4iLCJpbXBvcnQgY2xvc2VJZnJhbWUgZnJvbSAnLi9jbG9zZUlGcmFtZSc7XG5pbXBvcnQgYXNzZXJ0IGZyb20gJy4vaGVscGVyL2Fzc2VydCc7XG5pbXBvcnQgcGxhY2VPcmRlciBmcm9tICcuL3BsYWNlT3JkZXInO1xuaW1wb3J0IHJlY2VpdmVNZXNzYWdlIGZyb20gJy4vcmVjZWl2ZU1lc3NhZ2UnO1xuaW1wb3J0IHJlbmRlcldpdGhSZXRyeSBmcm9tICcuL3JlbmRlcldpdGhSZXRyeSc7XG5pbXBvcnQgc2VuZE1lc3NhZ2UgZnJvbSAnLi9zZW5kTWVzc2FnZSc7XG5cbi8qKlxuICogSW5pdGlhbGl6ZXMgYSBTREsgaW5zdGFuY2VcbiAqIEBjb25zdHJ1Y3RvclxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqIEBwYXJhbSB7U3RyaW5nfSBvcHRpb25zLmtleSB0aGUgQVBJIEtleSBmb3VuZCBvbiB5b3VyIEFwcGxpY2F0aW9uIHNldHRpbmdzIHBhZ2VcbiAqIEBwYXJhbSB7U3RyaW5nfSBbb3B0aW9ucy5lbnZpcm9ubWVudF0gZW52aW9ybm1lbnQgU0FOREJPWCB8IFBST0RVQ1RJT05cbiAqL1xuZnVuY3Rpb24gaW5pdChvcHRpb25zKSB7XG4gIC8qIGVzbGludC1kaXNhYmxlICovXG5cbiAgLy8gdmFsaWRhdGUgdGhlIGNsaWVudCdzIGlucHV0IGZvciAnaW5pdCdcbiAgdHJ5IHtcbiAgICBhc3NlcnQuY2hlY2soXG4gICAgICBvcHRpb25zLFxuICAgICAgeyB0eXBlOiAnb2JqZWN0JywgbWVzc2FnZTogJ2luaXQgcGFyYW1ldGVyIGlzIG5vdCB2YWxpZC4nIH0sXG4gICAgICB7XG4gICAgICAgIGtleTogeyB0eXBlOiAnc3RyaW5nJywgbWVzc2FnZTogXCIna2V5JyBpcyByZXF1aXJlZCBzdHJpbmcuXCIgfSxcbiAgICAgICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgICAgICBvcHRpb25hbDogdHJ1ZSxcbiAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICBtZXNzYWdlOiBcIidlbnZpcm9ubWVudCcgbXVzdCBiZSBzdHJpbmcuXCJcbiAgICAgICAgfVxuICAgICAgfVxuICAgICk7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIC8vIGFzc2VydCBtZXRob2QgYWJvdmUgdGhyb3dzIGVycm9yIHdpdGggZ2l2ZW4gbWVzc2FnZSB3aGljaCB3ZSBmdXJ0aGVyIHRocm93IHRvIGNsaWVudC5cbiAgICBpZiAoZXJyICYmIGVyci5tZXNzYWdlKSB7XG4gICAgICB0aHJvdyBlcnIubWVzc2FnZTtcbiAgICB9XG4gICAgdGhyb3cgJ1NvbWV0aGluZyB3ZW50IHdyb25nISc7XG4gIH1cblxuICAvLyBzZXQgZW52aXJvbm1lbnQgdG8gJ1BST0RVQ1RJT04nIGlmIHN0YXRlZCBieSBjbGllbnQsIG90aGVyd2lzZSAnU0FOREJPWCdcbiAgb3B0aW9ucy5lbnZpcm9ubWVudCA9XG4gICAgb3B0aW9ucyAmJlxuICAgIHR5cGVvZiBvcHRpb25zLmVudmlyb25tZW50ID09PSAnc3RyaW5nJyAmJlxuICAgIG9wdGlvbnMuZW52aXJvbm1lbnQudG9VcHBlckNhc2UoKSA9PT0gJ1BST0RVQ1RJT04nXG4gICAgICA/ICdQUk9EVUNUSU9OJ1xuICAgICAgOiAnU0FOREJPWCc7XG5cbiAgLy8gc2F2ZSBvcHRpb25zIHRvIGNsaWVudERhdGFcbiAgdGhpcy5jbGllbnREYXRhID0gb3B0aW9ucztcblxuICAvKiBlc2xpbnQtZW5hYmxlICovXG59XG5cbi8vIGNvcmUgbWV0aG9kc1xuaW5pdC5wcm90b3R5cGUucmVuZGVyV2l0aFJldHJ5ID0gcmVuZGVyV2l0aFJldHJ5O1xuaW5pdC5wcm90b3R5cGUucGxhY2VPcmRlciA9IHBsYWNlT3JkZXI7XG5pbml0LnByb3RvdHlwZS5yZWNlaXZlTWVzc2FnZSA9IHJlY2VpdmVNZXNzYWdlO1xuaW5pdC5wcm90b3R5cGUuc2VuZE1lc3NhZ2UgPSBzZW5kTWVzc2FnZTtcbmluaXQucHJvdG90eXBlLmNsb3NlID0gY2xvc2VJZnJhbWU7XG5cbmV4cG9ydCBkZWZhdWx0IGluaXQ7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHsgcmF3OiAnMS4wLjMnIH07IiwiaW1wb3J0IGluaXQgZnJvbSAnLi9zZGsnO1xuaW1wb3J0IHZlcnNpb24gZnJvbSAnLi92ZXJzaW9uJztcblxuZXhwb3J0IHsgdmVyc2lvbiwgaW5pdCB9O1xuXG5leHBvcnQgZGVmYXVsdCB7IHZlcnNpb246IHZlcnNpb24sIGluaXQ6IGluaXQgfTtcbiJdLCJuYW1lcyI6WyJjbG9zZUlmcmFtZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztFQUFBLE1BQU0sWUFBWSxHQUFHLGtDQUFrQyxDQUFDO0VBQ3hEO0FBQ0E7RUFDTyxNQUFNLEtBQUssR0FBRztFQUNyQixFQUFFLElBQUksRUFBRSxZQUFZO0VBQ3BCLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxZQUFZLENBQUMsTUFBTSxDQUFDO0VBQ2hDLENBQUM7O0VDSk0sSUFBSSxVQUFV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
