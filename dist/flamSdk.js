/**
 * flamsdk v0.0.1
 * Author: bucharitesh
 * Date: 2022-08-24
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

    const PAGES = {
        main: "http://localhost:3000",
        error: "http://localhost:3000/error"
    };

    function placeOrder({ product_id, order_details, callback }) {
      if (
        !this.clientData ||
        !this.clientData.environment ||
        !this.clientData.key
      ) {
        console.log("THIS", this);
        let url = `${PAGES.error}/Something went wrong!`;
        this.renderWithRetry({
          url,
          order_details,
          callback
        });
        callback({ message: 'Error Occured!' }, null);
      } else {
        let url = `${PAGES.main}/?product_id=${product_id}`;
        this.renderWithRetry(url);
      }
    }

    function receiveMessage(event) {
      if (event.origin == 'http://localhost:3000') {
        console.log('event listened', event);

        switch (event.data.type) {
          case 'close':
            this.close();
        }
      }
    }

    function renderWithRetry(url, productId) {
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

      document.getElementById('flam-sdk-iframe').addEventListener('load', () => {

        // hide loading
        document.getElementById('flam-sdk-bg').style.display = 'none';

        // Bring the iframe back
        document.getElementById('flam-sdk-iframe').style.opacity = '1';

        // for receiving messages from iframe
        window.addEventListener('message', this.receiveMessage);

        // for sending messages to iframe
        this.iWindow = document.getElementById("flam-sdk-iframe").contentWindow;
        setTimeout(() => {
          this.sendMessage({ type: "INITIAL_DATA", data: {} }, "*");
        }, 100);
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
        throw new Error(err.message)
      }
      /* eslint-enable */

      this.clientData = options;

      // core methods
      this.renderWithRetry = renderWithRetry;
      this.placeOrder = placeOrder;
      this.receiveMessage = receiveMessage;
      this.sendMessage = sendMessage;
      this.close = close;

      /* eslint-enable */
    }

    var version = { raw: '0.0.1' };

    var index = { version: version, init: init };

    exports.default = index;
    exports.init = init;
    exports.version = version;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmxhbVNkay5qcyIsInNvdXJjZXMiOlsiLi4vc3JjL2hlbHBlci9hc3NlcnQuanMiLCIuLi9zcmMvY29uc3RhbnRzLmpzIiwiLi4vc3JjL3BsYWNlT3JkZXIuanMiLCIuLi9zcmMvcmVjZWl2ZU1lc3NhZ2UuanMiLCIuLi9zcmMvcmVuZGVyV2l0aFJldHJ5LmpzIiwiLi4vc3JjL3NlbmRNZXNzYWdlLmpzIiwiLi4vc3JjL3Nkay5qcyIsIi4uL3NyYy92ZXJzaW9uLmpzIiwiLi4vc3JjL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbInZhciB0b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5cbmZ1bmN0aW9uIGF0dHJpYnV0ZShvLCBhdHRyLCB0eXBlLCB0ZXh0KSB7XG4gICAgdHlwZSA9IHR5cGUgPT09ICdhcnJheScgPyAnb2JqZWN0JyA6IHR5cGU7XG4gICAgaWYgKG8gJiYgdHlwZW9mIG9bYXR0cl0gIT09IHR5cGUpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKHRleHQpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gdmFyaWFibGUobywgdHlwZSwgdGV4dCkge1xuICAgIGlmICh0eXBlb2YgbyAhPT0gdHlwZSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IodGV4dCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiB2YWx1ZShvLCB2YWx1ZXMsIHRleHQpIHtcbiAgICBpZiAodmFsdWVzLmluZGV4T2YobykgPT09IC0xKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcih0ZXh0KTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGNoZWNrKG8sIGNvbmZpZywgYXR0cmlidXRlcykge1xuICAgIGlmICghY29uZmlnLm9wdGlvbmFsIHx8IG8pIHtcbiAgICAgICAgdmFyaWFibGUobywgY29uZmlnLnR5cGUsIGNvbmZpZy5tZXNzYWdlKTtcbiAgICB9XG4gICAgaWYgKGNvbmZpZy50eXBlID09PSAnb2JqZWN0JyAmJiBhdHRyaWJ1dGVzKSB7XG4gICAgICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMoYXR0cmlidXRlcyk7XG5cbiAgICAgICAgZm9yICh2YXIgaW5kZXggPSAwOyBpbmRleCA8IGtleXMubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgICAgICB2YXIgYSA9IGtleXNbaW5kZXhdO1xuICAgICAgICAgICAgaWYgKCFhdHRyaWJ1dGVzW2FdLm9wdGlvbmFsIHx8IG9bYV0pIHtcbiAgICAgICAgICAgICAgICBpZiAoIWF0dHJpYnV0ZXNbYV0uY29uZGl0aW9uIHx8IGF0dHJpYnV0ZXNbYV0uY29uZGl0aW9uKG8pKSB7XG4gICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZShvLCBhLCBhdHRyaWJ1dGVzW2FdLnR5cGUsIGF0dHJpYnV0ZXNbYV0ubWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChhdHRyaWJ1dGVzW2FdLnZhbHVlcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUob1thXSwgYXR0cmlidXRlc1thXS52YWx1ZXMsIGF0dHJpYnV0ZXNbYV0udmFsdWVfbWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8qKlxuICogV3JhcCBgQXJyYXkuaXNBcnJheWAgUG9seWZpbGwgZm9yIElFOVxuICogc291cmNlOiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9BcnJheS9pc0FycmF5XG4gKlxuICogQHBhcmFtIHtBcnJheX0gYXJyYXlcbiAqIEBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIGlzQXJyYXkoYXJyYXkpIHtcbiAgICBpZiAodGhpcy5zdXBwb3J0c0lzQXJyYXkoKSkge1xuICAgICAgICByZXR1cm4gQXJyYXkuaXNBcnJheShhcnJheSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRvU3RyaW5nLmNhbGwoYXJyYXkpID09PSAnW29iamVjdCBBcnJheV0nO1xufVxuXG5mdW5jdGlvbiBzdXBwb3J0c0lzQXJyYXkoKSB7XG4gICAgcmV0dXJuIEFycmF5LmlzQXJyYXkgIT0gbnVsbDtcbn1cblxuZXhwb3J0IGRlZmF1bHQge1xuICAgIGNoZWNrOiBjaGVjayxcbiAgICBhdHRyaWJ1dGU6IGF0dHJpYnV0ZSxcbiAgICB2YXJpYWJsZTogdmFyaWFibGUsXG4gICAgdmFsdWU6IHZhbHVlLFxuICAgIGlzQXJyYXk6IGlzQXJyYXksXG4gICAgc3VwcG9ydHNJc0FycmF5OiBzdXBwb3J0c0lzQXJyYXlcbn07IiwiZXhwb3J0IGNvbnN0IFBBR0VTID0ge1xuICAgIG1haW46IFwiaHR0cDovL2xvY2FsaG9zdDozMDAwXCIsXG4gICAgZXJyb3I6IFwiaHR0cDovL2xvY2FsaG9zdDozMDAwL2Vycm9yXCJcbn0iLCJpbXBvcnQgeyBQQUdFUyB9IGZyb20gJy4vY29uc3RhbnRzJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcGxhY2VPcmRlcih7IHByb2R1Y3RfaWQsIG9yZGVyX2RldGFpbHMsIGNhbGxiYWNrIH0pIHtcbiAgaWYgKFxuICAgICF0aGlzLmNsaWVudERhdGEgfHxcbiAgICAhdGhpcy5jbGllbnREYXRhLmVudmlyb25tZW50IHx8XG4gICAgIXRoaXMuY2xpZW50RGF0YS5rZXlcbiAgKSB7XG4gICAgY29uc29sZS5sb2coXCJUSElTXCIsIHRoaXMpXG4gICAgbGV0IHVybCA9IGAke1BBR0VTLmVycm9yfS9Tb21ldGhpbmcgd2VudCB3cm9uZyFgO1xuICAgIHRoaXMucmVuZGVyV2l0aFJldHJ5KHtcbiAgICAgIHVybCxcbiAgICAgIG9yZGVyX2RldGFpbHMsXG4gICAgICBjYWxsYmFja1xuICAgIH0pO1xuICAgIGNhbGxiYWNrKHsgbWVzc2FnZTogJ0Vycm9yIE9jY3VyZWQhJyB9LCBudWxsKTtcbiAgfSBlbHNlIHtcbiAgICBsZXQgdXJsID0gYCR7UEFHRVMubWFpbn0vP3Byb2R1Y3RfaWQ9JHtwcm9kdWN0X2lkfWA7XG4gICAgdGhpcy5yZW5kZXJXaXRoUmV0cnkodXJsKTtcbiAgfVxufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcmVjZWl2ZU1lc3NhZ2UoZXZlbnQpIHtcbiAgaWYgKGV2ZW50Lm9yaWdpbiA9PSAnaHR0cDovL2xvY2FsaG9zdDozMDAwJykge1xuICAgIGNvbnNvbGUubG9nKCdldmVudCBsaXN0ZW5lZCcsIGV2ZW50KTtcblxuICAgIHN3aXRjaCAoZXZlbnQuZGF0YS50eXBlKSB7XG4gICAgICBjYXNlICdjbG9zZSc6XG4gICAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICB9XG4gIH1cbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHJlbmRlcldpdGhSZXRyeSh1cmwsIHByb2R1Y3RJZCkge1xuICBjb25zdCBib2R5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpO1xuXG4gIGNvbnN0IHN0eWxlU2hlZXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuICBzdHlsZVNoZWV0LnR5cGUgPSAndGV4dC9jc3MnO1xuICBzdHlsZVNoZWV0LmlubmVyVGV4dCA9IGBcbiAgICAuZmxhbS1zZGstYmcge1xuICAgICAgcG9zaXRpb246IGZpeGVkO1xuICAgICAgdG9wOiAwO1xuICAgICAgcmlnaHQ6IDA7XG4gICAgICBib3R0b206IDA7XG4gICAgICBsZWZ0OiAwO1xuXG4gICAgICBtaW4taGVpZ2h0OiAxMDB2aDtcbiAgICAgIG1pbi13aWR0aDogMTAwdnc7XG4gICAgICBib3JkZXI6IG5vbmU7XG4gICAgICBiYWNrZ3JvdW5kOiByZ2JhKDAsMCwwLCAwLjQpO1xuXG4gICAgICBkaXNwbGF5OiBmbGV4O1xuICAgICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gICAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgIH1cblxuICAgICNmbGFtLXNkay1pZnJhbWUge1xuICAgICAgcG9zaXRpb246IGZpeGVkO1xuICAgICAgdG9wOiAwO1xuICAgICAgcmlnaHQ6IDA7XG4gICAgICBib3R0b206IDA7XG4gICAgICBsZWZ0OiAwO1xuXG4gICAgICBtaW4taGVpZ2h0OiAxMDB2aDtcbiAgICAgIG1pbi13aWR0aDogMTAwdnc7XG4gICAgICBib3JkZXI6IG5vbmU7XG4gICAgfVxuXG4gICAgLmZsYW0tc2RrLWxvYWRpbmcge1xuICAgICAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xuICAgICAgcG9zaXRpb246IHJlbGF0aXZlO1xuICAgICAgd2lkdGg6IDgwcHg7XG4gICAgICBoZWlnaHQ6IDgwcHg7XG4gICAgfVxuICAgIC5mbGFtLXNkay1sb2FkaW5nIGRpdiB7XG4gICAgICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xuICAgICAgZGlzcGxheTogYmxvY2s7XG4gICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgICB3aWR0aDogNjRweDtcbiAgICAgIGhlaWdodDogNjRweDtcbiAgICAgIG1hcmdpbjogOHB4O1xuICAgICAgYm9yZGVyOiAzcHggc29saWQgIzAwMDtcbiAgICAgIGJvcmRlci1yYWRpdXM6IDUwJTtcbiAgICAgIGFuaW1hdGlvbjogZmxhbS1zZGstbG9hZGluZyAxLjJzIGN1YmljLWJlemllcigwLjUsIDAsIDAuNSwgMSkgaW5maW5pdGU7XG4gICAgICBib3JkZXItY29sb3I6ICMwMDAgdHJhbnNwYXJlbnQgdHJhbnNwYXJlbnQgdHJhbnNwYXJlbnQ7XG4gICAgfVxuICAgIC5mbGFtLXNkay1sb2FkaW5nIGRpdjpudGgtY2hpbGQoMSkge1xuICAgICAgYW5pbWF0aW9uLWRlbGF5OiAtMC40NXM7XG4gICAgfVxuICAgIC5mbGFtLXNkay1sb2FkaW5nIGRpdjpudGgtY2hpbGQoMikge1xuICAgICAgYW5pbWF0aW9uLWRlbGF5OiAtMC4zcztcbiAgICB9XG4gICAgLmZsYW0tc2RrLWxvYWRpbmcgZGl2Om50aC1jaGlsZCgzKSB7XG4gICAgICBhbmltYXRpb24tZGVsYXk6IC0wLjE1cztcbiAgICB9XG4gICAgQGtleWZyYW1lcyBmbGFtLXNkay1sb2FkaW5nIHtcbiAgICAgIDAlIHtcbiAgICAgICAgdHJhbnNmb3JtOiByb3RhdGUoMGRlZyk7XG4gICAgICB9XG4gICAgICAxMDAlIHtcbiAgICAgICAgdHJhbnNmb3JtOiByb3RhdGUoMzYwZGVnKTtcbiAgICAgIH1cbiAgICB9XG4gIGA7XG5cbiAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzdHlsZVNoZWV0KTtcblxuICBjb25zdCBVSSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICBVSS5pbm5lckhUTUwgPSBgXG4gICAgICA8ZGl2IGNsYXNzPVwiZmxhbS1zZGstdWlcIiBpZD1cImZsYW0tc2RrLXVpXCI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJmbGFtLXNkay1iZ1wiIGlkPVwiZmxhbS1zZGstYmdcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmxhbS1zZGstbG9hZGluZ1wiIGlkPVwiZmxhbS1zZGstbG9hZGluZ1wiPjxkaXY+PC9kaXY+PGRpdj48L2Rpdj48ZGl2PjwvZGl2PjxkaXY+PC9kaXY+PC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8aWZyYW1lIGlkPVwiZmxhbS1zZGstaWZyYW1lXCIgc3R5bGU9XCJvcGFjaXR5OiAwXCIgbmFtZT1cImZsYW0tc2RrLWlmcmFtZVwiIHNyYz1cIiR7dXJsfVwiIHN0eWxlPVwib3BhY2l0eTogMFwiPjwvaWZyYW1lPlxuICAgICAgPC9kaXY+XG4gICAgYDtcblxuICBib2R5LmFwcGVuZENoaWxkKFVJKTtcblxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmxhbS1zZGstaWZyYW1lJykuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsICgpID0+IHtcblxuICAgIC8vIGhpZGUgbG9hZGluZ1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmbGFtLXNkay1iZycpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG5cbiAgICAvLyBCcmluZyB0aGUgaWZyYW1lIGJhY2tcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmxhbS1zZGstaWZyYW1lJykuc3R5bGUub3BhY2l0eSA9ICcxJztcblxuICAgIC8vIGZvciByZWNlaXZpbmcgbWVzc2FnZXMgZnJvbSBpZnJhbWVcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIHRoaXMucmVjZWl2ZU1lc3NhZ2UpO1xuXG4gICAgLy8gZm9yIHNlbmRpbmcgbWVzc2FnZXMgdG8gaWZyYW1lXG4gICAgdGhpcy5pV2luZG93ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJmbGFtLXNkay1pZnJhbWVcIikuY29udGVudFdpbmRvdztcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHRoaXMuc2VuZE1lc3NhZ2UoeyB0eXBlOiBcIklOSVRJQUxfREFUQVwiLCBkYXRhOiB7fSB9LCBcIipcIilcbiAgICB9LCAxMDApXG4gIH0pO1xufTsiLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBzZW5kTWVzc2FnZShtZXNzYWdlKSB7XG4gICAgdGhpcy5pV2luZG93LnBvc3RNZXNzYWdlKG1lc3NhZ2UsIFwiKlwiKVxufTsiLCJpbXBvcnQgYXNzZXJ0IGZyb20gJy4vaGVscGVyL2Fzc2VydCc7XG5pbXBvcnQgcGxhY2VPcmRlciBmcm9tICcuL3BsYWNlT3JkZXInO1xuaW1wb3J0IHJlY2VpdmVNZXNzYWdlIGZyb20gJy4vcmVjZWl2ZU1lc3NhZ2UnO1xuaW1wb3J0IHJlbmRlcldpdGhSZXRyeSBmcm9tICcuL3JlbmRlcldpdGhSZXRyeSc7XG5pbXBvcnQgc2VuZE1lc3NhZ2UgZnJvbSAnLi9zZW5kTWVzc2FnZSc7XG5cbi8qKlxuICogSGFuZGxlcyBhbGwgdGhlIGJyb3dzZXIncyBBdXRoTi9BdXRoWiBmbG93c1xuICogQGNvbnN0cnVjdG9yXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogQHBhcmFtIHtTdHJpbmd9IG9wdGlvbnMua2V5IHRoZSBBUEkgS2V5IGZvdW5kIG9uIHlvdXIgQXBwbGljYXRpb24gc2V0dGluZ3MgcGFnZVxuICogQHBhcmFtIHtTdHJpbmd9IFtvcHRpb25zLmVudmlyb25tZW50XSBlbnZpb3JubWVudCBzYW5kYm94IHwgcHJvZHVjdGlvblxuICovXG5mdW5jdGlvbiBpbml0KG9wdGlvbnMpIHtcbiAgLyogZXNsaW50LWRpc2FibGUgKi9cbiAgdHJ5IHtcbiAgICBhc3NlcnQuY2hlY2soXG4gICAgICBvcHRpb25zLFxuICAgICAgeyB0eXBlOiAnb2JqZWN0JywgbWVzc2FnZTogJ2NsaWVudERhdGEgcGFyYW1ldGVyIGlzIG5vdCB2YWxpZCcgfSxcbiAgICAgIHtcbiAgICAgICAga2V5OiB7IHR5cGU6ICdzdHJpbmcnLCBtZXNzYWdlOiAna2V5IGlzIHJlcXVpcmVkJyB9LFxuICAgICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgIG1lc3NhZ2U6ICdlbnZpcm9ubWVudCBpcyByZXF1aXJlZCdcbiAgICAgICAgfVxuICAgICAgfVxuICAgICk7XG5cbiAgICBpZiAob3B0aW9ucy5vdmVycmlkZXMpIHtcbiAgICAgIGFzc2VydC5jaGVjayhvcHRpb25zLm92ZXJyaWRlcywge1xuICAgICAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICAgICAgbWVzc2FnZTogJ292ZXJyaWRlcyBvcHRpb24gaXMgbm90IHZhbGlkJ1xuICAgICAgfSk7XG4gICAgfVxuICB9IGNhdGNoIChlcnIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoZXJyLm1lc3NhZ2UpXG4gIH1cbiAgLyogZXNsaW50LWVuYWJsZSAqL1xuXG4gIHRoaXMuY2xpZW50RGF0YSA9IG9wdGlvbnM7XG5cbiAgLy8gY29yZSBtZXRob2RzXG4gIHRoaXMucmVuZGVyV2l0aFJldHJ5ID0gcmVuZGVyV2l0aFJldHJ5O1xuICB0aGlzLnBsYWNlT3JkZXIgPSBwbGFjZU9yZGVyO1xuICB0aGlzLnJlY2VpdmVNZXNzYWdlID0gcmVjZWl2ZU1lc3NhZ2U7XG4gIHRoaXMuc2VuZE1lc3NhZ2UgPSBzZW5kTWVzc2FnZTtcbiAgdGhpcy5jbG9zZSA9IGNsb3NlO1xuXG4gIC8qIGVzbGludC1lbmFibGUgKi9cbn1cblxuZXhwb3J0IGRlZmF1bHQgaW5pdDsiLCJtb2R1bGUuZXhwb3J0cyA9IHsgcmF3OiAnMC4wLjEnIH07IiwiaW1wb3J0IGluaXQgZnJvbSAnLi9zZGsnO1xuaW1wb3J0IHZlcnNpb24gZnJvbSAnLi92ZXJzaW9uJztcblxuZXhwb3J0IHsgdmVyc2lvbiwgaW5pdCB9O1xuXG5leHBvcnQgZGVmYXVsdCB7IHZlcnNpb246IHZlcnNpb24sIGluaXQ6IGluaXQgfTtcbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0lBQUEsSUFBSSxRQUFRLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUM7QUFDekM7SUFDQSxTQUFTLFNBQVMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUU7SUFDeEMsSUFBSSxJQUFJLEdBQUcsSUFBSSxLQUFLLE9BQU8sR0FBRyxRQUFRLEdBQUcsSUFBSSxDQUFDO0lBQzlDLElBQUksSUFBSSxDQUFDLElBQUksT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssSUFBSSxFQUFFO0lBQ3RDLFFBQVEsTUFBTSxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUM5QixLQUFLO0lBQ0wsQ0FBQztBQUNEO0lBQ0EsU0FBUyxRQUFRLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUU7SUFDakMsSUFBSSxJQUFJLE9BQU8sQ0FBQyxLQUFLLElBQUksRUFBRTtJQUMzQixRQUFRLE1BQU0sSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDOUIsS0FBSztJQUNMLENBQUM7QUFDRDtJQUNBLFNBQVMsS0FBSyxDQUFDLENBQUMsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFO0lBQ2hDLElBQUksSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO0lBQ2xDLFFBQVEsTUFBTSxJ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
