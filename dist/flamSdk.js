/**
 * flamsdk v0.0.1
 * Author: bucharitesh
 * Date: 2022-08-30
 * License: MIT
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.flamSdk = {}));
}(this, (function (exports) { 'use strict';

  function close() {
    const element = document.getElementById('flam-sdk-ui');
    element.remove();
    window.removeEventListener('message', e => {
      this.receiveMessage(e);
    });
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
                email: this?.order_details?.prefill?.name || '',
                phone: this?.order_details?.prefill?.phone || ''
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
        // const res = await fetch(PAGES.main);

        // hide loading
        document.getElementById('flam-sdk-bg').style.display = 'none';

        // Bring the iframe back
        iFrame.style.opacity = '1';

        // for receiving messages from iframe
        window.addEventListener('message', e => {
          this.receiveMessage(e);
        });

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmxhbVNkay5qcyIsInNvdXJjZXMiOlsiLi4vc3JjL2Nsb3NlSUZyYW1lLmpzIiwiLi4vc3JjL2hlbHBlci9hc3NlcnQuanMiLCIuLi9zcmMvY29uc3RhbnRzLmpzIiwiLi4vc3JjL3BsYWNlT3JkZXIuanMiLCIuLi9zcmMvcmVjZWl2ZU1lc3NhZ2UuanMiLCIuLi9zcmMvcmVuZGVyV2l0aFJldHJ5LmpzIiwiLi4vc3JjL3NlbmRNZXNzYWdlLmpzIiwiLi4vc3JjL3Nkay5qcyIsIi4uL3NyYy92ZXJzaW9uLmpzIiwiLi4vc3JjL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGNsb3NlKCkge1xuICBjb25zdCBlbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZsYW0tc2RrLXVpJyk7XG4gIGVsZW1lbnQucmVtb3ZlKCk7XG4gIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgZSA9PiB7XG4gICAgdGhpcy5yZWNlaXZlTWVzc2FnZShlKTtcbiAgfSk7XG59XG4iLCJ2YXIgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuXG5mdW5jdGlvbiBhdHRyaWJ1dGUobywgYXR0ciwgdHlwZSwgdGV4dCkge1xuICAgIHR5cGUgPSB0eXBlID09PSAnYXJyYXknID8gJ29iamVjdCcgOiB0eXBlO1xuICAgIGlmIChvICYmIHR5cGVvZiBvW2F0dHJdICE9PSB0eXBlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcih0ZXh0KTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHZhcmlhYmxlKG8sIHR5cGUsIHRleHQpIHtcbiAgICBpZiAodHlwZW9mIG8gIT09IHR5cGUpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKHRleHQpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gdmFsdWUobywgdmFsdWVzLCB0ZXh0KSB7XG4gICAgaWYgKHZhbHVlcy5pbmRleE9mKG8pID09PSAtMSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IodGV4dCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBjaGVjayhvLCBjb25maWcsIGF0dHJpYnV0ZXMpIHtcbiAgICBpZiAoIWNvbmZpZy5vcHRpb25hbCB8fCBvKSB7XG4gICAgICAgIHZhcmlhYmxlKG8sIGNvbmZpZy50eXBlLCBjb25maWcubWVzc2FnZSk7XG4gICAgfVxuICAgIGlmIChjb25maWcudHlwZSA9PT0gJ29iamVjdCcgJiYgYXR0cmlidXRlcykge1xuICAgICAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKGF0dHJpYnV0ZXMpO1xuXG4gICAgICAgIGZvciAodmFyIGluZGV4ID0gMDsgaW5kZXggPCBrZXlzLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICAgICAgdmFyIGEgPSBrZXlzW2luZGV4XTtcbiAgICAgICAgICAgIGlmICghYXR0cmlidXRlc1thXS5vcHRpb25hbCB8fCBvW2FdKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFhdHRyaWJ1dGVzW2FdLmNvbmRpdGlvbiB8fCBhdHRyaWJ1dGVzW2FdLmNvbmRpdGlvbihvKSkge1xuICAgICAgICAgICAgICAgICAgICBhdHRyaWJ1dGUobywgYSwgYXR0cmlidXRlc1thXS50eXBlLCBhdHRyaWJ1dGVzW2FdLm1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoYXR0cmlidXRlc1thXS52YWx1ZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlKG9bYV0sIGF0dHJpYnV0ZXNbYV0udmFsdWVzLCBhdHRyaWJ1dGVzW2FdLnZhbHVlX21lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuXG4vKipcbiAqIFdyYXAgYEFycmF5LmlzQXJyYXlgIFBvbHlmaWxsIGZvciBJRTlcbiAqIHNvdXJjZTogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvQXJyYXkvaXNBcnJheVxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IGFycmF5XG4gKiBAcHJpdmF0ZVxuICovXG5mdW5jdGlvbiBpc0FycmF5KGFycmF5KSB7XG4gICAgaWYgKHRoaXMuc3VwcG9ydHNJc0FycmF5KCkpIHtcbiAgICAgICAgcmV0dXJuIEFycmF5LmlzQXJyYXkoYXJyYXkpO1xuICAgIH1cblxuICAgIHJldHVybiB0b1N0cmluZy5jYWxsKGFycmF5KSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbn1cblxuZnVuY3Rpb24gc3VwcG9ydHNJc0FycmF5KCkge1xuICAgIHJldHVybiBBcnJheS5pc0FycmF5ICE9IG51bGw7XG59XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgICBjaGVjazogY2hlY2ssXG4gICAgYXR0cmlidXRlOiBhdHRyaWJ1dGUsXG4gICAgdmFyaWFibGU6IHZhcmlhYmxlLFxuICAgIHZhbHVlOiB2YWx1ZSxcbiAgICBpc0FycmF5OiBpc0FycmF5LFxuICAgIHN1cHBvcnRzSXNBcnJheTogc3VwcG9ydHNJc0FycmF5XG59OyIsImNvbnN0IFNES19CQVNFX1VSTCA9ICdodHRwOi8vbG9jYWxob3N0OjMwMDAnO1xuXG5leHBvcnQgY29uc3QgUEFHRVMgPSB7XG4gIG1haW46IFNES19CQVNFX1VSTCxcbiAgZXJyb3I6IGAke1NES19CQVNFX1VSTH0vZXJyb3JgXG59O1xuIiwiaW1wb3J0IHsgUEFHRVMgfSBmcm9tICcuL2NvbnN0YW50cyc7XG5pbXBvcnQgYXNzZXJ0IGZyb20gJy4vaGVscGVyL2Fzc2VydCc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHBsYWNlT3JkZXIob3JkZXJfZGV0YWlscywgY2FsbGJhY2spIHtcbiAgLy8gdHJ5IHtcbiAgLy8gICBhc3NlcnQuY2hlY2soXG4gIC8vICAgICBvcHRpb25zLFxuICAvLyAgICAgeyB0eXBlOiAnb2JqZWN0JywgbWVzc2FnZTogJ2NsaWVudERhdGEgcGFyYW1ldGVyIGlzIG5vdCB2YWxpZCcgfSxcbiAgLy8gICAgIHtcbiAgLy8gICAgICAga2V5OiB7IHR5cGU6ICdzdHJpbmcnLCBtZXNzYWdlOiAna2V5IGlzIHJlcXVpcmVkJyB9LFxuICAvLyAgICAgICBlbnZpcm9ubWVudDoge1xuICAvLyAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAvLyAgICAgICAgIG1lc3NhZ2U6ICdlbnZpcm9ubWVudCBpcyByZXF1aXJlZCdcbiAgLy8gICAgICAgfVxuICAvLyAgICAgfVxuICAvLyAgICk7XG4gIC8vIH0gY2F0Y2ggKGVycikge31cblxuICB0aGlzLm9yZGVyX2RldGFpbHMgPSBvcmRlcl9kZXRhaWxzO1xuXG4gIGlmIChcbiAgICAhdGhpcy5jbGllbnREYXRhIHx8XG4gICAgIXRoaXMuY2xpZW50RGF0YS5lbnZpcm9ubWVudCB8fFxuICAgICF0aGlzLmNsaWVudERhdGEua2V5IHx8XG4gICAgIW9yZGVyX2RldGFpbHMucHJvZHVjdElkIHx8XG4gICAgIW9yZGVyX2RldGFpbHMucmVmSWQgfHxcbiAgICAhb3JkZXJfZGV0YWlscy5hbmltYXRpb25cbiAgKSB7XG4gICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICBsZXQgdXJsID0gYCR7UEFHRVMuZXJyb3J9L1NvbWV0aGluZyB3ZW50IHdyb25nIWA7XG4gICAgICB0aGlzLnJlbmRlcldpdGhSZXRyeSh7XG4gICAgICAgIHVybCxcbiAgICAgICAgZXJyb3I6IHRydWVcbiAgICAgIH0pO1xuICAgICAgY2FsbGJhY2soeyBjb2RlOiA0MDAsIG1lc3NhZ2U6ICdJbnN1ZmljaWFudCBkYXRhIScgfSwgbnVsbCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignY2FsbGJhY2sgZnVuY3Rpb24gaXMgcmVxdWlyZWQhJyk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGlmICghY2FsbGJhY2spIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignY2FsbGJhY2sgZnVuY3Rpb24gaXMgcmVxdWlyZWQhJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxldCB1cmwgPSBgJHtQQUdFUy5tYWlufWA7XG4gICAgICAvLyB0aGlzLnByb2R1Y3RfaWQgPSBwcm9kdWN0X2lkO1xuICAgICAgdGhpcy5jYWxsYmFjayA9IGNhbGxiYWNrO1xuICAgICAgdGhpcy5yZW5kZXJXaXRoUmV0cnkoeyB1cmwsIGVycm9yOiBmYWxzZSB9KTtcbiAgICB9XG4gIH1cbn1cbiIsImltcG9ydCB7IFBBR0VTIH0gZnJvbSAnLi9jb25zdGFudHMnO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiByZWNlaXZlTWVzc2FnZShldmVudCkge1xuICBpZiAoZXZlbnQub3JpZ2luID09IFBBR0VTLm1haW4pIHtcbiAgICBzd2l0Y2ggKGV2ZW50LmRhdGEudHlwZSkge1xuICAgICAgY2FzZSAnQ0xPU0UnOlxuICAgICAgICB0aGlzLmNsb3NlKCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnUkVBRFlfVE9fUkVDRUlWRSc6XG4gICAgICAgIHRoaXMuc2VuZE1lc3NhZ2UoXG4gICAgICAgICAge1xuICAgICAgICAgICAgdHlwZTogJ0lOSVRJQUxfREFUQScsXG4gICAgICAgICAgICBwYXlsb2FkOiB7XG4gICAgICAgICAgICAgIGNsaWVudF9kYXRhOiB0aGlzLmNsaWVudERhdGEsXG4gICAgICAgICAgICAgIC8vIHByb2R1Y3RfaWQ6IHRoaXMucHJvZHVjdF9pZCxcbiAgICAgICAgICAgICAgb3JkZXJfZGV0YWlsczogdGhpcy5vcmRlcl9kZXRhaWxzXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICAnKidcbiAgICAgICAgKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdSRUFEWV9UT19SRUNFSVZFX0VSUic6XG4gICAgICAgIHRoaXMuc2VuZE1lc3NhZ2UoXG4gICAgICAgICAge1xuICAgICAgICAgICAgdHlwZTogJ0lOSVRJQUxfREFUQV9FUlInLFxuICAgICAgICAgICAgcGF5bG9hZDoge1xuICAgICAgICAgICAgICBlbWFpbDogdGhpcz8ub3JkZXJfZGV0YWlscz8ucHJlZmlsbD8ubmFtZSB8fCAnJyxcbiAgICAgICAgICAgICAgcGhvbmU6IHRoaXM/Lm9yZGVyX2RldGFpbHM/LnByZWZpbGw/LnBob25lIHx8ICcnXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICAnKidcbiAgICAgICAgKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdDUkVBVEVEJzpcbiAgICAgICAgdGhpcy5jYWxsYmFjayhudWxsLCB7XG4gICAgICAgICAgY29kZTogMjAxLFxuICAgICAgICAgIGRhdGE6IGV2ZW50LmRhdGEucGF5bG9hZCxcbiAgICAgICAgICBtZXNzYWdlOiAnT3JkZXIgcGxhY2VkIHN1Y2Nlc3NmdWxseSdcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdFUlJPUic6XG4gICAgICAgIHRoaXMuY2FsbGJhY2soXG4gICAgICAgICAge1xuICAgICAgICAgICAgY29kZTogZXZlbnQuZGF0YS5wYXlsb2FkLmNvZGUsXG4gICAgICAgICAgICBtZXNzYWdlOiBldmVudC5kYXRhLnBheWxvYWQubWVzc2FnZVxuICAgICAgICAgIH0sXG4gICAgICAgICAgbnVsbFxuICAgICAgICApO1xuICAgICAgICAvLyB0aGlzLmNsb3NlKCk7IC8vIHNob3VsZCB3ZSBjbG9zZSB0aGUgbW9kYWwgb24gZXJyb3IgP1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cbn1cbiIsImltcG9ydCB7IFBBR0VTIH0gZnJvbSAnLi9jb25zdGFudHMnO1xuXG5leHBvcnQgZGVmYXVsdCBhc3luYyBmdW5jdGlvbiByZW5kZXJXaXRoUmV0cnkoeyB1cmwsIGVycm9yIH0pIHtcbiAgY29uc3QgYm9keSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2JvZHknKTtcblxuICBjb25zdCBzdHlsZVNoZWV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcbiAgc3R5bGVTaGVldC50eXBlID0gJ3RleHQvY3NzJztcbiAgc3R5bGVTaGVldC5pbm5lclRleHQgPSBgXG4gICAgLmZsYW0tc2RrLWJnIHtcbiAgICAgIHBvc2l0aW9uOiBmaXhlZDtcbiAgICAgIHRvcDogMDtcbiAgICAgIHJpZ2h0OiAwO1xuICAgICAgYm90dG9tOiAwO1xuICAgICAgbGVmdDogMDtcblxuICAgICAgbWluLWhlaWdodDogMTAwdmg7XG4gICAgICBtaW4td2lkdGg6IDEwMHZ3O1xuICAgICAgYm9yZGVyOiBub25lO1xuICAgICAgYmFja2dyb3VuZDogcmdiYSgwLDAsMCwgMC40KTtcblxuICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICB9XG5cbiAgICAjZmxhbS1zZGstaWZyYW1lIHtcbiAgICAgIHBvc2l0aW9uOiBmaXhlZDtcbiAgICAgIHRvcDogMDtcbiAgICAgIHJpZ2h0OiAwO1xuICAgICAgYm90dG9tOiAwO1xuICAgICAgbGVmdDogMDtcblxuICAgICAgbWluLWhlaWdodDogMTAwdmg7XG4gICAgICBtaW4td2lkdGg6IDEwMHZ3O1xuICAgICAgYm9yZGVyOiBub25lO1xuICAgIH1cblxuICAgIC5mbGFtLXNkay1sb2FkaW5nIHtcbiAgICAgIGRpc3BsYXk6IGlubGluZS1ibG9jaztcbiAgICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgICAgIHdpZHRoOiA4MHB4O1xuICAgICAgaGVpZ2h0OiA4MHB4O1xuICAgIH1cbiAgICAuZmxhbS1zZGstbG9hZGluZyBkaXYge1xuICAgICAgYm94LXNpemluZzogYm9yZGVyLWJveDtcbiAgICAgIGRpc3BsYXk6IGJsb2NrO1xuICAgICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgICAgd2lkdGg6IDY0cHg7XG4gICAgICBoZWlnaHQ6IDY0cHg7XG4gICAgICBtYXJnaW46IDhweDtcbiAgICAgIGJvcmRlcjogM3B4IHNvbGlkICMwMDA7XG4gICAgICBib3JkZXItcmFkaXVzOiA1MCU7XG4gICAgICBhbmltYXRpb246IGZsYW0tc2RrLWxvYWRpbmcgMS4ycyBjdWJpYy1iZXppZXIoMC41LCAwLCAwLjUsIDEpIGluZmluaXRlO1xuICAgICAgYm9yZGVyLWNvbG9yOiAjMDAwIHRyYW5zcGFyZW50IHRyYW5zcGFyZW50IHRyYW5zcGFyZW50O1xuICAgIH1cbiAgICAuZmxhbS1zZGstbG9hZGluZyBkaXY6bnRoLWNoaWxkKDEpIHtcbiAgICAgIGFuaW1hdGlvbi1kZWxheTogLTAuNDVzO1xuICAgIH1cbiAgICAuZmxhbS1zZGstbG9hZGluZyBkaXY6bnRoLWNoaWxkKDIpIHtcbiAgICAgIGFuaW1hdGlvbi1kZWxheTogLTAuM3M7XG4gICAgfVxuICAgIC5mbGFtLXNkay1sb2FkaW5nIGRpdjpudGgtY2hpbGQoMykge1xuICAgICAgYW5pbWF0aW9uLWRlbGF5OiAtMC4xNXM7XG4gICAgfVxuICAgIEBrZXlmcmFtZXMgZmxhbS1zZGstbG9hZGluZyB7XG4gICAgICAwJSB7XG4gICAgICAgIHRyYW5zZm9ybTogcm90YXRlKDBkZWcpO1xuICAgICAgfVxuICAgICAgMTAwJSB7XG4gICAgICAgIHRyYW5zZm9ybTogcm90YXRlKDM2MGRlZyk7XG4gICAgICB9XG4gICAgfVxuICBgO1xuXG4gIGF3YWl0IGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoc3R5bGVTaGVldCk7XG5cbiAgY29uc3QgVUkgPSBhd2FpdCBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgVUkuaW5uZXJIVE1MID0gYFxuICAgICAgPGRpdiBjbGFzcz1cImZsYW0tc2RrLXVpXCIgaWQ9XCJmbGFtLXNkay11aVwiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwiZmxhbS1zZGstYmdcIiBpZD1cImZsYW0tc2RrLWJnXCI+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImZsYW0tc2RrLWxvYWRpbmdcIiBpZD1cImZsYW0tc2RrLWxvYWRpbmdcIj48ZGl2PjwvZGl2PjxkaXY+PC9kaXY+PGRpdj48L2Rpdj48ZGl2PjwvZGl2PjwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGlmcmFtZSBpZD1cImZsYW0tc2RrLWlmcmFtZVwiIHN0eWxlPVwib3BhY2l0eTogMFwiIG5hbWU9XCJmbGFtLXNkay1pZnJhbWVcIiBzcmM9XCIke3VybH1cIiBzdHlsZT1cIm9wYWNpdHk6IDBcIj48L2lmcmFtZT5cbiAgICAgIDwvZGl2PlxuICAgIGA7XG5cbiAgYXdhaXQgYm9keS5hcHBlbmRDaGlsZChVSSk7XG5cbiAgY29uc3QgaUZyYW1lID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZsYW0tc2RrLWlmcmFtZScpO1xuXG4gIC8vIGlGcmFtZS5jb250ZW50V2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgZSA9PiB7XG4gIC8vICAgY29uc29sZS5sb2coJ0lmcmFtZSBFcnJvcicsIGUpO1xuICAvLyB9KTtcblxuICBpRnJhbWUuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIGFzeW5jIGUgPT4ge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAvLyBjb25zb2xlLmxvZygnSWZyYW1lIExvYWQnLCBlKTtcblxuICAgIHRyeSB7XG4gICAgICAvLyBjb25zdCByZXMgPSBhd2FpdCBmZXRjaChQQUdFUy5tYWluKTtcblxuICAgICAgLy8gaGlkZSBsb2FkaW5nXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmxhbS1zZGstYmcnKS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuXG4gICAgICAvLyBCcmluZyB0aGUgaWZyYW1lIGJhY2tcbiAgICAgIGlGcmFtZS5zdHlsZS5vcGFjaXR5ID0gJzEnO1xuXG4gICAgICAvLyBmb3IgcmVjZWl2aW5nIG1lc3NhZ2VzIGZyb20gaWZyYW1lXG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGUgPT4ge1xuICAgICAgICB0aGlzLnJlY2VpdmVNZXNzYWdlKGUpO1xuICAgICAgfSk7XG5cbiAgICAgIC8vIGZvciBzZW5kaW5nIG1lc3NhZ2VzIHRvIGlmcmFtZVxuICAgICAgdGhpcy5pV2luZG93ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZsYW0tc2RrLWlmcmFtZScpLmNvbnRlbnRXaW5kb3c7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBpZiAoZXJyLm1lc3NhZ2UgPT09ICdGYWlsZWQgdG8gZmV0Y2gnKSB7XG4gICAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICAgICAgdGhpcy5jYWxsYmFjayh7XG4gICAgICAgICAgY29kZTogNTAwLFxuICAgICAgICAgIG1lc3NhZ2U6ICdTREsgZG93biEnXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG59XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBzZW5kTWVzc2FnZShtZXNzYWdlKSB7XG4gICAgdGhpcy5pV2luZG93LnBvc3RNZXNzYWdlKG1lc3NhZ2UsIFwiKlwiKVxufTsiLCJpbXBvcnQgY2xvc2VJZnJhbWUgZnJvbSAnLi9jbG9zZUlGcmFtZSc7XG5pbXBvcnQgYXNzZXJ0IGZyb20gJy4vaGVscGVyL2Fzc2VydCc7XG5pbXBvcnQgcGxhY2VPcmRlciBmcm9tICcuL3BsYWNlT3JkZXInO1xuaW1wb3J0IHJlY2VpdmVNZXNzYWdlIGZyb20gJy4vcmVjZWl2ZU1lc3NhZ2UnO1xuaW1wb3J0IHJlbmRlcldpdGhSZXRyeSBmcm9tICcuL3JlbmRlcldpdGhSZXRyeSc7XG5pbXBvcnQgc2VuZE1lc3NhZ2UgZnJvbSAnLi9zZW5kTWVzc2FnZSc7XG5cbi8qKlxuICogSGFuZGxlcyBhbGwgdGhlIGJyb3dzZXIncyBBdXRoTi9BdXRoWiBmbG93c1xuICogQGNvbnN0cnVjdG9yXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogQHBhcmFtIHtTdHJpbmd9IG9wdGlvbnMua2V5IHRoZSBBUEkgS2V5IGZvdW5kIG9uIHlvdXIgQXBwbGljYXRpb24gc2V0dGluZ3MgcGFnZVxuICogQHBhcmFtIHtTdHJpbmd9IFtvcHRpb25zLmVudmlyb25tZW50XSBlbnZpb3JubWVudCBzYW5kYm94IHwgcHJvZHVjdGlvblxuICogQHBhcmFtIHtTdHJpbmd9IFtvcHRpb25zLm5hbWVdIG5hbWUgb2YgY2xpZW50XG4gKiBAcGFyYW0ge1N0cmluZ30gW29wdGlvbnMubG9nb1VybF0gY2xpZW50J3MgYnJhbmQgbG9nbyB1cmxcbiAqIEBwYXJhbSB7U3RyaW5nfSBbb3B0aW9ucy5lbWFpbF0gY2xpZW50J3Mgc3VwcG9ydCBlbWFpbCBmb3IgZXJyb3IgcGFnZVxuICogQHBhcmFtIHtTdHJpbmd9IFtvcHRpb25zLnBob25lXSBjbGllbnQncyBzdXBwb3J0IHBob25lIGZvciBlcnJvciBwYWdlXG4gKi9cbmZ1bmN0aW9uIGluaXQob3B0aW9ucykge1xuICAvKiBlc2xpbnQtZGlzYWJsZSAqL1xuICB0cnkge1xuICAgIGFzc2VydC5jaGVjayhcbiAgICAgIG9wdGlvbnMsXG4gICAgICB7IHR5cGU6ICdvYmplY3QnLCBtZXNzYWdlOiAnY2xpZW50RGF0YSBwYXJhbWV0ZXIgaXMgbm90IHZhbGlkJyB9LFxuICAgICAge1xuICAgICAgICBrZXk6IHsgdHlwZTogJ3N0cmluZycsIG1lc3NhZ2U6ICdrZXkgaXMgcmVxdWlyZWQnIH0sXG4gICAgICAgIGVudmlyb25tZW50OiB7XG4gICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgICAgbWVzc2FnZTogJ2Vudmlyb25tZW50IGlzIHJlcXVpcmVkJ1xuICAgICAgICB9XG4gICAgICAgIC8vIG5hbWU6IHsgdHlwZTogJ3N0cmluZycsIG1lc3NhZ2U6ICduYW1lIGlzIHJlcXVpcmVkJyB9LFxuICAgICAgICAvLyBsb2dvVXJsOiB7IHR5cGU6ICdzdHJpbmcnLCBtZXNzYWdlOiAnbG9nb1VybCBpcyByZXF1aXJlZCcgfSxcbiAgICAgICAgLy8gZW1haWw6IHsgdHlwZTogJ3N0cmluZycsIG1lc3NhZ2U6ICdlbWFpbCBpcyByZXF1aXJlZCcgfSxcbiAgICAgICAgLy8gcGhvbmU6IHsgdHlwZTogJ3N0cmluZycsIG1lc3NhZ2U6ICdwaG9uZSBpcyByZXF1aXJlZCcgfVxuICAgICAgfVxuICAgICk7XG5cbiAgICBpZiAob3B0aW9ucy5vdmVycmlkZXMpIHtcbiAgICAgIGFzc2VydC5jaGVjayhvcHRpb25zLm92ZXJyaWRlcywge1xuICAgICAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICAgICAgbWVzc2FnZTogJ292ZXJyaWRlcyBvcHRpb24gaXMgbm90IHZhbGlkJ1xuICAgICAgfSk7XG4gICAgfVxuICB9IGNhdGNoIChlcnIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoZXJyLm1lc3NhZ2UpO1xuICB9XG4gIC8qIGVzbGludC1lbmFibGUgKi9cbiAgdGhpcy5jbGllbnREYXRhID0gb3B0aW9ucztcblxuICAvKiBlc2xpbnQtZW5hYmxlICovXG59XG5cbi8vIGNvcmUgbWV0aG9kc1xuaW5pdC5wcm90b3R5cGUucmVuZGVyV2l0aFJldHJ5ID0gcmVuZGVyV2l0aFJldHJ5O1xuaW5pdC5wcm90b3R5cGUucGxhY2VPcmRlciA9IHBsYWNlT3JkZXI7XG5pbml0LnByb3RvdHlwZS5yZWNlaXZlTWVzc2FnZSA9IHJlY2VpdmVNZXNzYWdlO1xuaW5pdC5wcm90b3R5cGUuc2VuZE1lc3NhZ2UgPSBzZW5kTWVzc2FnZTtcbmluaXQucHJvdG90eXBlLmNsb3NlID0gY2xvc2VJZnJhbWU7XG5cbmV4cG9ydCBkZWZhdWx0IGluaXQ7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHsgcmF3OiAnMC4wLjEnIH07IiwiaW1wb3J0IGluaXQgZnJvbSAnLi9zZGsnO1xuaW1wb3J0IHZlcnNpb24gZnJvbSAnLi92ZXJzaW9uJztcblxuZXhwb3J0IHsgdmVyc2lvbiwgaW5pdCB9O1xuXG5leHBvcnQgZGVmYXVsdCB7IHZlcnNpb246IHZlcnNpb24sIGluaXQ6IGluaXQgfTtcbiJdLCJuYW1lcyI6WyJjbG9zZUlmcmFtZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztFQUFlLFNBQVMsS0FBSyxHQUFHO0VBQ2hDLEVBQUUsTUFBTSxP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
