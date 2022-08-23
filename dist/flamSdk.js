/**
 * flamsdk v0.0.1
 * Author: flamSdk
 * Date: 2022-08-23
 * License: MIT
 */

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = global || self, factory(global.flamSdk = {}));
}(this, (function (exports) { 'use strict';

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

    function placeOrder(clientData, productId, orderDetails, callback) {
        let pages = {
            main: "http://localhost:3000",
            error: "http://localhost:3000/error"
        };

        // if (!clientData || !clientData.enviornment || !clientData.key) {
        // show error page here
        let url = `${pages.error}/Something went wrong!`;
        this.renderWithRetry(url);
        callback({ message: "Error Occured!" }, null);
        // } else {
        //   this.token = clientData.key;
        //   let url = `${pages.main}/?product_id=${productId}`
        //   this.renderWithRetry(url);
        // }
    }

    function init(options) {
      /* eslint-disable */
      assert.check(
        options,
        { type: 'object', message: 'options parameter is not valid' },
        // {
        //   domain: { type: 'string', message: 'domain option is required' },
        //   clientID: { type: 'string', message: 'clientID option is required' },
        //   responseType: {
        //     optional: true,
        //     type: 'string',
        //     message: 'responseType is not valid'
        //   },
        // }
        {
          key: { type: 'string', message: 'key is required' },
          environment: {
            optional: true,
            type: 'string',
            environment: 'environment used is sandbox'
          }
        }
      );


      if (options.overrides) {
        assert.check(
          options.overrides,
          { type: 'object', message: 'overrides option is not valid' },
        );
      }

      this.baseOptions = options;

      let _this = this;

      this.renderWithRetry = function renderWithRetry(url, productId) {
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

        // http://localhost:3000/?product_id=${productId}

        document.head.appendChild(styleSheet);

        const UI = document.createElement('div');
        UI.innerHTML = `
      <div class="flam-sdk-ui" id="flam-sdk-ui">
        <div class="flam-sdk-bg" id="flam-sdk-bg">
          <div class="flam-sdk-loading" id="flam-sdk-loading"><div></div><div></div><div></div><div></div></div>
        </div>
        <iframe id="flam-sdk-iframe" style="opacity: 0" name="flam-sdk-iframe" src="${url}" style="opacity: 0"></iframe>
      </div>
    `;

        body.appendChild(UI);

        // this gets called when just the iFrame has loaded and not iFrame + website
        document.getElementById('flam-sdk-iframe').addEventListener('load', () => {
          _this.iWindow = document.getElementById("flam-sdk-iframe").contentWindow;

          document.getElementById('flam-sdk-bg').style.display = 'none';

          // Bring the iframe back
          document.getElementById('flam-sdk-iframe').style.opacity = '1';

          window.addEventListener('message', this.receiveMessage);
          this.sendMessage({ type: "data" });
        });
      };

      this.placeOrder = placeOrder;

      this.receiveMessage = function receiveMessage(event) {
        if (event.origin == 'http://localhost:3000') {
          console.log('event listened', event);

          switch (event.data.type) {
            case 'close':
              _this.closeModal();
          }
        }
      };

      this.sendMessage = function sendMessage(message) {
        console.log(message);
        _this.iWindow.postMessage(message, "*");
      };

      this.closeModal = function closeModal() {
        const element = document.getElementById('flam-sdk-ui');
        element.remove();
        window.removeEventListener('message', this.receiveMessage);
      };

      /* eslint-enable */
    }

    var version = { raw: '0.1.1' };

    var index = { version: version, init: init };

    exports.default = index;
    exports.init = init;
    exports.version = version;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
