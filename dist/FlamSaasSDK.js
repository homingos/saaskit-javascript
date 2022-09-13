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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRmxhbVNhYXNTREsuanMiLCJzb3VyY2VzIjpbIi4uL3NyYy9jb25zdGFudHMuanMiLCIuLi9zcmMvcmVuZGVyV2l0aFJldHJ5LmpzIiwiLi4vc3JjL2Nsb3NlSUZyYW1lLmpzIiwiLi4vc3JjL2hlbHBlci9hc3NlcnQuanMiLCIuLi9zcmMvcGxhY2VPcmRlci5qcyIsIi4uL3NyYy9yZWNlaXZlTWVzc2FnZS5qcyIsIi4uL3NyYy9zZW5kTWVzc2FnZS5qcyIsIi4uL3NyYy9zZGsuanMiLCIuLi9zcmMvdmVyc2lvbi5qcyIsIi4uL3NyYy9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBjb25zdCBTREtfQkFTRV9VUkwgPSAnaHR0cHM6Ly9zYWFzLXNkay1mbGFtLnZlcmNlbC5hcHAnO1xuY29uc3QgU0RLX0JBU0VfVVJMID0gJ2h0dHA6Ly9sb2NhbGhvc3Q6MzAwMCc7XG5cbmV4cG9ydCBjb25zdCBQQUdFUyA9IHtcbiAgbWFpbjogU0RLX0JBU0VfVVJMLFxuICBlcnJvcjogYCR7U0RLX0JBU0VfVVJMfS9lcnJvcmBcbn07XG4iLCJpbXBvcnQgeyBQQUdFUyB9IGZyb20gJy4vY29uc3RhbnRzJztcblxuZXhwb3J0IGxldCB0cmFja09yZGVyID0gbnVsbDtcblxuLyoqXG4gKiBSZW5kZXJzIHRoZSBVSSBmb3IgUGxhY2luZyBPcmRlclxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsIHVybCB0byBlaXRoZXIgb3JkZXIgZmxvdyBvciBlcnJvciBwYWdlXG4gKi9cblxuZXhwb3J0IGRlZmF1bHQgYXN5bmMgZnVuY3Rpb24gcmVuZGVyV2l0aFJldHJ5KHVybCkge1xuICBjb25zdCBib2R5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpO1xuXG4gIGNvbnN0IHN0eWxlU2hlZXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuICBzdHlsZVNoZWV0LnR5cGUgPSAndGV4dC9jc3MnO1xuICBzdHlsZVNoZWV0LmlkID0gJ3NhYXMtc2RrLXN0eWxlJztcbiAgc3R5bGVTaGVldC5pbm5lclRleHQgPSBgXG4gICAgYm9keSB7XG4gICAgICBvdmVyZmxvdzogaGlkZGVuO1xuICAgIH1cblxuICAgIC5mbGFtLXNkay1sb2FkaW5nLXdyYXBwZXIge1xuICAgICAgcG9zaXRpb246IGZpeGVkO1xuICAgICAgdG9wOiAwO1xuICAgICAgcmlnaHQ6IDA7XG4gICAgICBib3R0b206IDA7XG4gICAgICBsZWZ0OiAwO1xuXG4gICAgICBtaW4taGVpZ2h0OiAxMDB2aDtcbiAgICAgIG1pbi13aWR0aDogMTAwdnc7XG4gICAgICBvdmVyZmxvdzogaGlkZGVuO1xuICAgICAgYm9yZGVyOiBub25lO1xuICAgICAgYmFja2dyb3VuZDogcmdiYSgwLDAsMCwgMC40KTtcblxuICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICB9XG5cbiAgICAjZmxhbS1zZGstaWZyYW1lIHtcbiAgICAgIHBvc2l0aW9uOiBmaXhlZDtcbiAgICAgIHRvcDogMDtcbiAgICAgIHJpZ2h0OiAwO1xuICAgICAgYm90dG9tOiAwO1xuICAgICAgbGVmdDogMDtcblxuICAgICAgbWluLWhlaWdodDogMTAwdmg7XG4gICAgICBtaW4td2lkdGg6IDEwMHZ3O1xuICAgICAgYm9yZGVyOiBub25lO1xuICAgIH1cblxuICAgIC5mbGFtLXNkay1sb2FkaW5nIHtcbiAgICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgICAgIHdpZHRoOiA4MHB4O1xuICAgICAgaGVpZ2h0OiA4MHB4O1xuICAgIH1cblxuICAgIC5mbGFtLXNkay1sb2FkaW5nIGRpdiB7XG4gICAgICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xuICAgICAgZGlzcGxheTogYmxvY2s7XG4gICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgICB3aWR0aDogNjRweDtcbiAgICAgIGhlaWdodDogNjRweDtcbiAgICAgIG1hcmdpbjogOHB4O1xuICAgICAgYm9yZGVyOiAzcHggc29saWQgIzAwMDtcbiAgICAgIGJvcmRlci1yYWRpdXM6IDUwJTtcbiAgICAgIGFuaW1hdGlvbjogZmxhbS1zZGstbG9hZGluZyAxLjJzIGN1YmljLWJlemllcigwLjUsIDAsIDAuNSwgMSkgaW5maW5pdGU7XG4gICAgICBib3JkZXItY29sb3I6ICMwMDAgdHJhbnNwYXJlbnQgdHJhbnNwYXJlbnQgdHJhbnNwYXJlbnQ7XG4gICAgfVxuICAgIC5mbGFtLXNkay1sb2FkaW5nIGRpdjpudGgtY2hpbGQoMSkge1xuICAgICAgYW5pbWF0aW9uLWRlbGF5OiAtMC40NXM7XG4gICAgfVxuICAgIC5mbGFtLXNkay1sb2FkaW5nIGRpdjpudGgtY2hpbGQoMikge1xuICAgICAgYW5pbWF0aW9uLWRlbGF5OiAtMC4zcztcbiAgICB9XG4gICAgLmZsYW0tc2RrLWxvYWRpbmcgZGl2Om50aC1jaGlsZCgzKSB7XG4gICAgICBhbmltYXRpb24tZGVsYXk6IC0wLjE1cztcbiAgICB9XG4gICAgQGtleWZyYW1lcyBmbGFtLXNkay1sb2FkaW5nIHtcbiAgICAgIDAlIHtcbiAgICAgICAgdHJhbnNmb3JtOiByb3RhdGUoMGRlZyk7XG4gICAgICB9XG4gICAgICAxMDAlIHtcbiAgICAgICAgdHJhbnNmb3JtOiByb3RhdGUoMzYwZGVnKTtcbiAgICAgIH1cbiAgICB9XG4gIGA7XG5cbiAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzdHlsZVNoZWV0KTtcblxuICBjb25zdCBVSSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICBVSS5pZCA9ICdmbGFtLXNkay13cmFwcGVyJztcblxuICB2YXIgUmVnRXhwID0gLyheI1swLTlBLUZdezZ9JCl8KF4jWzAtOUEtRl17M30kKS9pO1xuXG4gIGNvbnN0IG5ld1VybCA9ICgpID0+IHtcbiAgICBpZiAoXG4gICAgICB0aGlzLm9yZGVyX2RldGFpbHMgJiZcbiAgICAgIHRoaXMub3JkZXJfZGV0YWlscy50aGVtZSAmJlxuICAgICAgdGhpcy5vcmRlcl9kZXRhaWxzLnRoZW1lLmNvbG9yICYmXG4gICAgICBSZWdFeHAudGVzdCh0aGlzLm9yZGVyX2RldGFpbHMudGhlbWUuY29sb3IpXG4gICAgKSB7XG4gICAgICBjb25zdCB4ID0gJy8/dGhlbWU9JztcbiAgICAgIHJldHVybiB1cmwgKyB4ICsgZW5jb2RlVVJJQ29tcG9uZW50KHRoaXMub3JkZXJfZGV0YWlscy50aGVtZS5jb2xvcik7XG4gICAgfVxuICAgIHJldHVybiB1cmw7XG4gIH07XG5cbiAgVUkuaW5uZXJIVE1MID0gYFxuICAgICAgPGRpdiBjbGFzcz1cImZsYW0tc2RrLWxvYWRpbmctd3JhcHBlclwiIGlkPVwiZmxhbS1zZGstbG9hZGluZy13cmFwcGVyXCI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJmbGFtLXNkay1sb2FkaW5nXCIgaWQ9XCJmbGFtLXNkay1sb2FkaW5nXCI+PGRpdj48L2Rpdj48ZGl2PjwvZGl2PjxkaXY+PC9kaXY+PGRpdj48L2Rpdj48L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICAgPGlmcmFtZSBpZD1cImZsYW0tc2RrLWlmcmFtZVwiIHN0eWxlPVwib3BhY2l0eTogMFwiIG5hbWU9XCJmbGFtLXNkay1pZnJhbWVcIiBzcmM9XCIke25ld1VybCgpfVwiIHN0eWxlPVwib3BhY2l0eTogMFwiPjwvaWZyYW1lPiAgICAgIFxuICAgIGA7XG5cbiAgYm9keS5hcHBlbmRDaGlsZChVSSk7XG5cbiAgY29uc3QgaUZyYW1lID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZsYW0tc2RrLWlmcmFtZScpO1xuXG4gIGlGcmFtZS5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgYXN5bmMgZSA9PiB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgdHJ5IHtcbiAgICAgIC8vIGNoZWNrIGlmIHdlYnNpdGUgYXZhaWxhYmxlIGluIFBST0RVQ1RJT05cbiAgICAgIGlmICh0aGlzLmNsaWVudERhdGEuZW52aXJvbm1lbnQgPT0gJ1BST0RVQ1RJT04nKSB7XG4gICAgICAgIGF3YWl0IGZldGNoKFBBR0VTLm1haW4pO1xuICAgICAgfVxuXG4gICAgICAvLyBoaWRlIGluaXRpYWwgbG9hZGluZ1xuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZsYW0tc2RrLWxvYWRpbmctd3JhcHBlcicpLnN0eWxlLmRpc3BsYXkgPVxuICAgICAgICAnbm9uZSc7XG5cbiAgICAgIC8vIFNob3cgdGhlIGlmcmFtZSBjb250ZW50XG4gICAgICBpRnJhbWUuc3R5bGUub3BhY2l0eSA9ICcxJztcblxuICAgICAgLy8gbWVzc2FnZSBldmVudCBoYW5kbGVyXG4gICAgICB0cmFja09yZGVyID0gZSA9PiB7XG4gICAgICAgIHRoaXMucmVjZWl2ZU1lc3NhZ2UoZSk7XG4gICAgICB9O1xuXG4gICAgICAvLyBldmVudCBsaXN0ZW5lciBmb3IgcmVjZWl2aW5nIG1lc3NhZ2VzIGZyb20gaWZyYW1lXG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIHRyYWNrT3JkZXIpO1xuXG4gICAgICAvLyBzYXZlIHdpbmRvdyBjb250ZXh0IGZvciBzZW5kaW5nIG1lc3NhZ2VzIHRvIGlmcmFtZVxuICAgICAgdGhpcy5pV2luZG93ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZsYW0tc2RrLWlmcmFtZScpLmNvbnRlbnRXaW5kb3c7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBpZiAoZXJyLm1lc3NhZ2UgPT09ICdGYWlsZWQgdG8gZmV0Y2gnKSB7XG4gICAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICAgICAgdGhpcy5jYWxsYmFjayh7XG4gICAgICAgICAgY29kZTogNTAwLFxuICAgICAgICAgIG1lc3NhZ2U6ICdVbmFibGUgdG8gYWNlc3MgU0RLIFdlYnNpdGUhJ1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdGhpcy5jYWxsYmFjayh7XG4gICAgICAgIGNvZGU6IDUwMCxcbiAgICAgICAgbWVzc2FnZTogJ1NvbWV0aGluZyB3ZW50IHdyb25nISdcbiAgICAgIH0pO1xuICAgIH1cbiAgfSk7XG59XG4iLCJpbXBvcnQgeyB0cmFja09yZGVyIH0gZnJvbSAnLi9yZW5kZXJXaXRoUmV0cnknO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjbG9zZSgpIHtcbiAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCB0cmFja09yZGVyKTtcblxuICAvLyByZW1vdmUgdGhlIFVJXG4gIGNvbnN0IGVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmxhbS1zZGstd3JhcHBlcicpO1xuICBpZiAoZWxlbWVudCkge1xuICAgIGVsZW1lbnQucmVtb3ZlKCk7XG4gIH1cblxuICAvLyByZW1vdmUgdGhlIHN0eWxlc1xuICBjb25zdCBzdHlsZVNoZWV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NhYXMtc2RrLXN0eWxlJyk7XG5cbiAgaWYgKHN0eWxlU2hlZXQpIHtcbiAgICBzdHlsZVNoZWV0LnJlbW92ZSgpO1xuICB9XG59XG4iLCJ2YXIgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuXG5mdW5jdGlvbiBhdHRyaWJ1dGUobywgYXR0ciwgdHlwZSwgdGV4dCkge1xuICAgIHR5cGUgPSB0eXBlID09PSAnYXJyYXknID8gJ29iamVjdCcgOiB0eXBlO1xuICAgIGlmIChvICYmIHR5cGVvZiBvW2F0dHJdICE9PSB0eXBlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcih0ZXh0KTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHZhcmlhYmxlKG8sIHR5cGUsIHRleHQpIHtcbiAgICBpZiAodHlwZW9mIG8gIT09IHR5cGUpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKHRleHQpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gdmFsdWUobywgdmFsdWVzLCB0ZXh0KSB7XG4gICAgaWYgKHZhbHVlcy5pbmRleE9mKG8pID09PSAtMSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IodGV4dCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBjaGVjayhvLCBjb25maWcsIGF0dHJpYnV0ZXMpIHtcbiAgICBpZiAoIWNvbmZpZy5vcHRpb25hbCB8fCBvKSB7XG4gICAgICAgIHZhcmlhYmxlKG8sIGNvbmZpZy50eXBlLCBjb25maWcubWVzc2FnZSk7XG4gICAgfVxuICAgIGlmIChjb25maWcudHlwZSA9PT0gJ29iamVjdCcgJiYgYXR0cmlidXRlcykge1xuICAgICAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKGF0dHJpYnV0ZXMpO1xuXG4gICAgICAgIGZvciAodmFyIGluZGV4ID0gMDsgaW5kZXggPCBrZXlzLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICAgICAgdmFyIGEgPSBrZXlzW2luZGV4XTtcbiAgICAgICAgICAgIGlmICghYXR0cmlidXRlc1thXS5vcHRpb25hbCB8fCBvW2FdKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFhdHRyaWJ1dGVzW2FdLmNvbmRpdGlvbiB8fCBhdHRyaWJ1dGVzW2FdLmNvbmRpdGlvbihvKSkge1xuICAgICAgICAgICAgICAgICAgICBhdHRyaWJ1dGUobywgYSwgYXR0cmlidXRlc1thXS50eXBlLCBhdHRyaWJ1dGVzW2FdLm1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoYXR0cmlidXRlc1thXS52YWx1ZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlKG9bYV0sIGF0dHJpYnV0ZXNbYV0udmFsdWVzLCBhdHRyaWJ1dGVzW2FdLnZhbHVlX21lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuXG4vKipcbiAqIFdyYXAgYEFycmF5LmlzQXJyYXlgIFBvbHlmaWxsIGZvciBJRTlcbiAqIHNvdXJjZTogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvQXJyYXkvaXNBcnJheVxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IGFycmF5XG4gKiBAcHJpdmF0ZVxuICovXG5mdW5jdGlvbiBpc0FycmF5KGFycmF5KSB7XG4gICAgaWYgKHRoaXMuc3VwcG9ydHNJc0FycmF5KCkpIHtcbiAgICAgICAgcmV0dXJuIEFycmF5LmlzQXJyYXkoYXJyYXkpO1xuICAgIH1cblxuICAgIHJldHVybiB0b1N0cmluZy5jYWxsKGFycmF5KSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbn1cblxuZnVuY3Rpb24gc3VwcG9ydHNJc0FycmF5KCkge1xuICAgIHJldHVybiBBcnJheS5pc0FycmF5ICE9IG51bGw7XG59XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgICBjaGVjazogY2hlY2ssXG4gICAgYXR0cmlidXRlOiBhdHRyaWJ1dGUsXG4gICAgdmFyaWFibGU6IHZhcmlhYmxlLFxuICAgIHZhbHVlOiB2YWx1ZSxcbiAgICBpc0FycmF5OiBpc0FycmF5LFxuICAgIHN1cHBvcnRzSXNBcnJheTogc3VwcG9ydHNJc0FycmF5XG59OyIsImltcG9ydCB7IFBBR0VTIH0gZnJvbSAnLi9jb25zdGFudHMnO1xuaW1wb3J0IGFzc2VydCBmcm9tICcuL2hlbHBlci9hc3NlcnQnO1xuXG4vKipcbiAqIFJ1bnMgdGhlIFNESyBmb3IgUGxhY2luZyBPcmRlclxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogQHBhcmFtIHtTdHJpbmd9IG9wdGlvbnMua2V5IHRoZSBBUEkgS2V5IGZvdW5kIG9uIHlvdXIgQXBwbGljYXRpb24gc2V0dGluZ3MgcGFnZVxuICogQHBhcmFtIHtTdHJpbmd9IFtvcHRpb25zLmVudmlyb25tZW50XSBlbnZpb3JubWVudCBzYW5kYm94IHwgcHJvZHVjdGlvblxuICovXG5cbi8vIFRPRE86IHdyaXRlIHRoZSBwYXJhbWV0ZXIgZGVzY3JpcHRpb25zXG5cbmV4cG9ydCBkZWZhdWx0IGFzeW5jIGZ1bmN0aW9uIHBsYWNlT3JkZXIob3JkZXJfZGV0YWlscywgY2FsbGJhY2spIHtcbiAgdHJ5IHtcbiAgICAvLyB2YWxpZGF0ZSBjbGllbnQgZGF0YVxuICAgIGFzc2VydC5jaGVjayhcbiAgICAgIHRoaXMuY2xpZW50RGF0YSxcbiAgICAgIHsgdHlwZTogJ29iamVjdCcsIG1lc3NhZ2U6ICdpbml0IGRhdGEgaXMgaW52YWxpZCcgfSxcbiAgICAgIHtcbiAgICAgICAga2V5OiB7IHR5cGU6ICdzdHJpbmcnLCBtZXNzYWdlOiBcIidrZXknIGlzIHJlcXVpcmVkIHN0cmluZy5cIiB9LFxuICAgICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICAgIG9wdGlvbmFsOiB0cnVlLFxuICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgIG1lc3NhZ2U6IFwiJ2Vudmlyb25tZW50JyBtdXN0IGJlIHN0cmluZy5cIlxuICAgICAgICB9XG4gICAgICB9XG4gICAgKTtcblxuICAgIC8vIHZhbGlkYXRlIG9yZGVyX2RldGFpbHNcbiAgICBhc3NlcnQuY2hlY2soXG4gICAgICBvcmRlcl9kZXRhaWxzLFxuICAgICAge1xuICAgICAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICAgICAgbWVzc2FnZTogXCInb3JkZXIgZGV0YWlscycgaXMgbm90IHZhbGlkLlwiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBwcm9kdWN0SWQ6IHtcbiAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICBtZXNzYWdlOiBcIidwcm9kdWN0SWQnIGlzIHJlcXVpcmVkIHN0cmluZy5cIlxuICAgICAgICB9LFxuICAgICAgICByZWZJZDogeyB0eXBlOiAnc3RyaW5nJywgbWVzc2FnZTogXCIncmVmSWQnIGlzIHJlcXVpcmVkIHN0cmluZy5cIiB9LFxuICAgICAgICBwaG90bzoge1xuICAgICAgICAgIG9wdGlvbmFsOiB0cnVlLFxuICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgIG1lc3NhZ2U6IFwiJ3Bob3RvJyBtdXN0IGJlIHN0cmluZy5cIlxuICAgICAgICB9LFxuICAgICAgICB2aWRlbzoge1xuICAgICAgICAgIG9wdGlvbmFsOiB0cnVlLFxuICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgIG1lc3NhZ2U6IFwiJ3ZpZGVvJyBtdXN0IGJlIHN0cmluZy5cIlxuICAgICAgICB9LFxuICAgICAgICBwcmVmaWxsOiB7XG4gICAgICAgICAgb3B0aW9uYWw6IHRydWUsXG4gICAgICAgICAgdHlwZTogJ29iamVjdCcsXG4gICAgICAgICAgbWVzc2FnZTogXCIncHJlZmlsbCcgbXVzdCBiZSBvYmplY3QuXCJcbiAgICAgICAgfSxcbiAgICAgICAgYW5pbWF0aW9uOiB7XG4gICAgICAgICAgb3B0aW9uYWw6IHRydWUsXG4gICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgICAgbWVzc2FnZTogXCInYW5pbWF0aW9uJyBtdXN0IGJlIHN0cmluZy5cIlxuICAgICAgICB9LFxuICAgICAgICB0aGVtZToge1xuICAgICAgICAgIG9wdGlvbmFsOiB0cnVlLFxuICAgICAgICAgIHR5cGU6ICdvYmplY3QnLFxuICAgICAgICAgIG1lc3NhZ2U6IFwiJ3RoZW1lJyBtdXN0IGJlIG9iamVjdC5cIlxuICAgICAgICB9LFxuICAgICAgICBsb2dvOiB7XG4gICAgICAgICAgb3B0aW9uYWw6IHRydWUsXG4gICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgICAgbWVzc2FnZTogXCInbG9nbycgbXVzdCBiZSBzdHJpbmcuXCJcbiAgICAgICAgfVxuICAgICAgfVxuICAgICk7XG5cbiAgICAvLyB2YWxpZGF0ZSBjYWxsYmFjayBmdW5jdGlvblxuICAgIGFzc2VydC5jaGVjayhjYWxsYmFjaywge1xuICAgICAgdHlwZTogJ2Z1bmN0aW9uJyxcbiAgICAgIG1lc3NhZ2U6IFwiJ2NhbGxiYWNrJyBpcyByZXF1aXJlZCBmdW5jdGlvbi5cIlxuICAgIH0pO1xuXG4gICAgLy8gc2F2ZSBvcmRlcl9kZXRhaWxzXG4gICAgdGhpcy5vcmRlcl9kZXRhaWxzID0gb3JkZXJfZGV0YWlscztcblxuICAgIC8vIHJlbmRlciB0aGUgc3VjY2VzcyBVSVxuICAgIGxldCB1cmwgPSBgJHtQQUdFUy5tYWlufWA7XG4gICAgdGhpcy5jYWxsYmFjayA9IGNhbGxiYWNrO1xuXG4gICAgYXdhaXQgdGhpcy5yZW5kZXJXaXRoUmV0cnkodXJsKTtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgaWYgKGNhbGxiYWNrICYmIHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgLy8gcmVuZGVyIGVycm9yIFVJXG4gICAgICBsZXQgdXJsID0gYCR7UEFHRVMuZXJyb3J9L1NvbWV0aGluZyB3ZW50IHdyb25nIWA7XG4gICAgICBhd2FpdCB0aGlzLnJlbmRlcldpdGhSZXRyeSh1cmwpO1xuICAgICAgLy8gY2FsbGJhY2sgdG8gY2xpZW50IHdpdGggZXJyb3JcbiAgICAgIGF3YWl0IGNhbGxiYWNrKHsgY29kZTogNDAwLCBtZXNzYWdlOiBlcnIubWVzc2FnZSB9LCBudWxsKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgXCInY2FsbGJhY2snIGlzIHJlcXVpcmVkIGZ1bmN0aW9uLlwiO1xuICAgIH1cbiAgfVxuICBkb2N1bWVudC5hY3RpdmVFbGVtZW50LmJsdXIoKTtcbn1cbiIsImltcG9ydCB7IFBBR0VTIH0gZnJvbSAnLi9jb25zdGFudHMnO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiByZWNlaXZlTWVzc2FnZShldmVudCkge1xuICBpZiAoZXZlbnQub3JpZ2luID09IFBBR0VTLm1haW4pIHtcbiAgICBzd2l0Y2ggKGV2ZW50LmRhdGEudHlwZSkge1xuICAgICAgY2FzZSAnQ0xPU0UnOlxuICAgICAgICB0aGlzLmNsb3NlKCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnUkVBRFlfVE9fUkVDRUlWRSc6XG4gICAgICAgIHRoaXMuc2VuZE1lc3NhZ2Uoe1xuICAgICAgICAgIHR5cGU6ICdJTklUSUFMX0RBVEEnLFxuICAgICAgICAgIHBheWxvYWQ6IHtcbiAgICAgICAgICAgIGNsaWVudF9kYXRhOiB0aGlzLmNsaWVudERhdGEsXG4gICAgICAgICAgICBvcmRlcl9kZXRhaWxzOiB0aGlzLm9yZGVyX2RldGFpbHNcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ1JFQURZX1RPX1JFQ0VJVkVfRVJSJzpcbiAgICAgICAgdGhpcy5zZW5kTWVzc2FnZSh7XG4gICAgICAgICAgdHlwZTogJ0lOSVRJQUxfREFUQV9FUlInLFxuICAgICAgICAgIHBheWxvYWQ6IHtcbiAgICAgICAgICAgIGVtYWlsOlxuICAgICAgICAgICAgICB0aGlzLm9yZGVyX2RldGFpbHMgJiZcbiAgICAgICAgICAgICAgdGhpcy5vcmRlcl9kZXRhaWxzLnByZWZpbGwgJiZcbiAgICAgICAgICAgICAgdGhpcy5vcmRlcl9kZXRhaWxzLnByZWZpbGwuZW1haWxcbiAgICAgICAgICAgICAgICA/IHRoaXMub3JkZXJfZGV0YWlscy5wcmVmaWxsLmVtYWlsXG4gICAgICAgICAgICAgICAgOiAnJyxcbiAgICAgICAgICAgIHBob25lOlxuICAgICAgICAgICAgICB0aGlzLm9yZGVyX2RldGFpbHMgJiZcbiAgICAgICAgICAgICAgdGhpcy5vcmRlcl9kZXRhaWxzLnByZWZpbGwgJiZcbiAgICAgICAgICAgICAgdGhpcy5vcmRlcl9kZXRhaWxzLnByZWZpbGwucGhvbmVcbiAgICAgICAgICAgICAgICA/IHRoaXMub3JkZXJfZGV0YWlscy5wcmVmaWxsLnBob25lXG4gICAgICAgICAgICAgICAgOiAnJ1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnQ1JFQVRFRCc6XG4gICAgICAgIHRoaXMuY2FsbGJhY2sobnVsbCwge1xuICAgICAgICAgIGNvZGU6IDIwMSxcbiAgICAgICAgICBkYXRhOiBldmVudC5kYXRhLnBheWxvYWQsXG4gICAgICAgICAgbWVzc2FnZTogJ09yZGVyIHBsYWNlZCBzdWNjZXNzZnVsbHkhJ1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5jbG9zZSgpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ0VSUk9SJzpcbiAgICAgICAgdGhpcy5jYWxsYmFjayhcbiAgICAgICAgICB7XG4gICAgICAgICAgICBjb2RlOiBldmVudC5kYXRhLnBheWxvYWQuY29kZSxcbiAgICAgICAgICAgIG1lc3NhZ2U6IGV2ZW50LmRhdGEucGF5bG9hZC5tZXNzYWdlXG4gICAgICAgICAgfSxcbiAgICAgICAgICBudWxsXG4gICAgICAgICk7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxufVxuIiwiaW1wb3J0IHsgUEFHRVMgfSBmcm9tICcuL2NvbnN0YW50cyc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHNlbmRNZXNzYWdlKG1lc3NhZ2UpIHtcbiAgdGhpcy5pV2luZG93LnBvc3RNZXNzYWdlKG1lc3NhZ2UsIFBBR0VTLm1haW4pO1xufVxuIiwiaW1wb3J0IGNsb3NlSWZyYW1lIGZyb20gJy4vY2xvc2VJRnJhbWUnO1xuaW1wb3J0IGFzc2VydCBmcm9tICcuL2hlbHBlci9hc3NlcnQnO1xuaW1wb3J0IHBsYWNlT3JkZXIgZnJvbSAnLi9wbGFjZU9yZGVyJztcbmltcG9ydCByZWNlaXZlTWVzc2FnZSBmcm9tICcuL3JlY2VpdmVNZXNzYWdlJztcbmltcG9ydCByZW5kZXJXaXRoUmV0cnkgZnJvbSAnLi9yZW5kZXJXaXRoUmV0cnknO1xuaW1wb3J0IHNlbmRNZXNzYWdlIGZyb20gJy4vc2VuZE1lc3NhZ2UnO1xuXG4vKipcbiAqIEluaXRpYWxpemVzIGEgU0RLIGluc3RhbmNlXG4gKiBAY29uc3RydWN0b3JcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiBAcGFyYW0ge1N0cmluZ30gb3B0aW9ucy5rZXkgdGhlIEFQSSBLZXkgZm91bmQgb24geW91ciBBcHBsaWNhdGlvbiBzZXR0aW5ncyBwYWdlXG4gKiBAcGFyYW0ge1N0cmluZ30gW29wdGlvbnMuZW52aXJvbm1lbnRdIGVudmlvcm5tZW50IFNBTkRCT1ggfCBQUk9EVUNUSU9OXG4gKi9cbmZ1bmN0aW9uIGluaXQob3B0aW9ucykge1xuICAvKiBlc2xpbnQtZGlzYWJsZSAqL1xuXG4gIC8vIHZhbGlkYXRlIHRoZSBjbGllbnQncyBpbnB1dCBmb3IgJ2luaXQnXG4gIHRyeSB7XG4gICAgYXNzZXJ0LmNoZWNrKFxuICAgICAgb3B0aW9ucyxcbiAgICAgIHsgdHlwZTogJ29iamVjdCcsIG1lc3NhZ2U6ICdpbml0IHBhcmFtZXRlciBpcyBub3QgdmFsaWQuJyB9LFxuICAgICAge1xuICAgICAgICBrZXk6IHsgdHlwZTogJ3N0cmluZycsIG1lc3NhZ2U6IFwiJ2tleScgaXMgcmVxdWlyZWQgc3RyaW5nLlwiIH0sXG4gICAgICAgIGVudmlyb25tZW50OiB7XG4gICAgICAgICAgb3B0aW9uYWw6IHRydWUsXG4gICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgICAgbWVzc2FnZTogXCInZW52aXJvbm1lbnQnIG11c3QgYmUgc3RyaW5nLlwiXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICApO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICAvLyBhc3NlcnQgbWV0aG9kIGFib3ZlIHRocm93cyBlcnJvciB3aXRoIGdpdmVuIG1lc3NhZ2Ugd2hpY2ggd2UgZnVydGhlciB0aHJvdyB0byBjbGllbnQuXG4gICAgaWYgKGVyciAmJiBlcnIubWVzc2FnZSkge1xuICAgICAgdGhyb3cgZXJyLm1lc3NhZ2U7XG4gICAgfVxuICAgIHRocm93ICdTb21ldGhpbmcgd2VudCB3cm9uZyEnO1xuICB9XG5cbiAgLy8gc2V0IGVudmlyb25tZW50IHRvICdQUk9EVUNUSU9OJyBpZiBzdGF0ZWQgYnkgY2xpZW50LCBvdGhlcndpc2UgJ1NBTkRCT1gnXG4gIG9wdGlvbnMuZW52aXJvbm1lbnQgPVxuICAgIG9wdGlvbnMgJiZcbiAgICB0eXBlb2Ygb3B0aW9ucy5lbnZpcm9ubWVudCA9PT0gJ3N0cmluZycgJiZcbiAgICBvcHRpb25zLmVudmlyb25tZW50LnRvVXBwZXJDYXNlKCkgPT09ICdQUk9EVUNUSU9OJ1xuICAgICAgPyAnUFJPRFVDVElPTidcbiAgICAgIDogJ1NBTkRCT1gnO1xuXG4gIC8vIHNhdmUgb3B0aW9ucyB0byBjbGllbnREYXRhXG4gIHRoaXMuY2xpZW50RGF0YSA9IG9wdGlvbnM7XG5cbiAgLyogZXNsaW50LWVuYWJsZSAqL1xufVxuXG4vLyBjb3JlIG1ldGhvZHNcbmluaXQucHJvdG90eXBlLnJlbmRlcldpdGhSZXRyeSA9IHJlbmRlcldpdGhSZXRyeTtcbmluaXQucHJvdG90eXBlLnBsYWNlT3JkZXIgPSBwbGFjZU9yZGVyO1xuaW5pdC5wcm90b3R5cGUucmVjZWl2ZU1lc3NhZ2UgPSByZWNlaXZlTWVzc2FnZTtcbmluaXQucHJvdG90eXBlLnNlbmRNZXNzYWdlID0gc2VuZE1lc3NhZ2U7XG5pbml0LnByb3RvdHlwZS5jbG9zZSA9IGNsb3NlSWZyYW1lO1xuXG5leHBvcnQgZGVmYXVsdCBpbml0O1xuIiwibW9kdWxlLmV4cG9ydHMgPSB7IHJhdzogJzEuMC4zJyB9OyIsImltcG9ydCBpbml0IGZyb20gJy4vc2RrJztcbmltcG9ydCB2ZXJzaW9uIGZyb20gJy4vdmVyc2lvbic7XG5cbmV4cG9ydCB7IHZlcnNpb24sIGluaXQgfTtcblxuZXhwb3J0IGRlZmF1bHQgeyB2ZXJzaW9uOiB2ZXJzaW9uLCBpbml0OiBpbml0IH07XG4iXSwibmFtZXMiOlsiY2xvc2VJZnJhbWUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7RUFBQTtFQUNBLE1BQU0sWUFBWSxHQUFHLHVCQUF1QixDQUFDO0FBQzdDO0VBQ08sTUFBTSxLQUFLLEdBQUc7RUFDckIsRUFBRSxJQUFJLEVBQUUsWUFBWTtFQUNwQixFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsWUFBWSxDQUFDLE1BQU0sQ0FBQztFQUNoQyxDQUFDOztFQ0pNLElBQUksVUFBVSxHQUFHLElBQUksQ0FBQztBQUM3QjtFQUNBO0VBQ0E7RUFD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
