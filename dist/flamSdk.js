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

    function closeModal() {
        const element = document.getElementById('flam-sdk-ui');
        element.remove();
        window.removeEventListener('message', this.receiveMessage);
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

    const PAGES = {
        main: "http://localhost:3000",
        error: "http://localhost:3000/error"
    };

    function placeOrder({ product_id, order_details, callback }) {
        if (!this?.clientData || !this?.clientData?.environment || !this?.clientData.key) {
            let url = `${PAGES.error}/Something went wrong!`;
            this.renderWithRetry({
                url,
                order_details,
                callback
            });
            callback({ message: "Error Occured!" }, null);
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
                    this.closeModal();
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

    function init(clientData) {
      /* eslint-disable */
      try {
        assert.check(
          clientData,
          { type: 'object', message: 'clientData parameter is not valid' },
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
              type: 'string',
              message: 'environment is required'
            }
          }
        );

        if (clientData.overrides) {
          assert.check(
            clientData.overrides,
            { type: 'object', message: 'overrides clientData is not valid' },
          );
        }
      } catch (err) {
        throw new Error(err.message)
      }

      this.clientData = clientData;

      // core methods
      this.renderWithRetry = renderWithRetry;
      this.placeOrder = placeOrder;
      this.receiveMessage = receiveMessage;
      this.sendMessage = sendMessage;
      this.closeModal = closeModal;

      /* eslint-enable */
    }

    var version = { raw: '0.1.1' };

    var index = { version: version, init: init };

    exports.default = index;
    exports.init = init;
    exports.version = version;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmxhbVNkay5qcyIsInNvdXJjZXMiOlsiLi4vc3JjL2Nsb3NlTW9kYWwuanMiLCIuLi9zcmMvaGVscGVyL2Fzc2VydC5qcyIsIi4uL3NyYy9jb25zdGFudHMuanMiLCIuLi9zcmMvcGxhY2VPcmRlci5qcyIsIi4uL3NyYy9yZWNlaXZlTWVzc2FnZS5qcyIsIi4uL3NyYy9yZW5kZXJXaXRoUmV0cnkuanMiLCIuLi9zcmMvc2VuZE1lc3NhZ2UuanMiLCIuLi9zcmMvc2RrLmpzIiwiLi4vc3JjL3ZlcnNpb24uanMiLCIuLi9zcmMvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gY2xvc2VNb2RhbCgpIHtcbiAgICBjb25zdCBlbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZsYW0tc2RrLXVpJyk7XG4gICAgZWxlbWVudC5yZW1vdmUoKTtcbiAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIHRoaXMucmVjZWl2ZU1lc3NhZ2UpO1xufTsiLCJ2YXIgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuXG5mdW5jdGlvbiBhdHRyaWJ1dGUobywgYXR0ciwgdHlwZSwgdGV4dCkge1xuICAgIHR5cGUgPSB0eXBlID09PSAnYXJyYXknID8gJ29iamVjdCcgOiB0eXBlO1xuICAgIGlmIChvICYmIHR5cGVvZiBvW2F0dHJdICE9PSB0eXBlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcih0ZXh0KTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHZhcmlhYmxlKG8sIHR5cGUsIHRleHQpIHtcbiAgICBpZiAodHlwZW9mIG8gIT09IHR5cGUpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKHRleHQpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gdmFsdWUobywgdmFsdWVzLCB0ZXh0KSB7XG4gICAgaWYgKHZhbHVlcy5pbmRleE9mKG8pID09PSAtMSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IodGV4dCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBjaGVjayhvLCBjb25maWcsIGF0dHJpYnV0ZXMpIHtcbiAgICBpZiAoIWNvbmZpZy5vcHRpb25hbCB8fCBvKSB7XG4gICAgICAgIHZhcmlhYmxlKG8sIGNvbmZpZy50eXBlLCBjb25maWcubWVzc2FnZSk7XG4gICAgfVxuICAgIGlmIChjb25maWcudHlwZSA9PT0gJ29iamVjdCcgJiYgYXR0cmlidXRlcykge1xuICAgICAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKGF0dHJpYnV0ZXMpO1xuXG4gICAgICAgIGZvciAodmFyIGluZGV4ID0gMDsgaW5kZXggPCBrZXlzLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICAgICAgdmFyIGEgPSBrZXlzW2luZGV4XTtcbiAgICAgICAgICAgIGlmICghYXR0cmlidXRlc1thXS5vcHRpb25hbCB8fCBvW2FdKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFhdHRyaWJ1dGVzW2FdLmNvbmRpdGlvbiB8fCBhdHRyaWJ1dGVzW2FdLmNvbmRpdGlvbihvKSkge1xuICAgICAgICAgICAgICAgICAgICBhdHRyaWJ1dGUobywgYSwgYXR0cmlidXRlc1thXS50eXBlLCBhdHRyaWJ1dGVzW2FdLm1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoYXR0cmlidXRlc1thXS52YWx1ZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlKG9bYV0sIGF0dHJpYnV0ZXNbYV0udmFsdWVzLCBhdHRyaWJ1dGVzW2FdLnZhbHVlX21lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuXG4vKipcbiAqIFdyYXAgYEFycmF5LmlzQXJyYXlgIFBvbHlmaWxsIGZvciBJRTlcbiAqIHNvdXJjZTogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvQXJyYXkvaXNBcnJheVxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IGFycmF5XG4gKiBAcHJpdmF0ZVxuICovXG5mdW5jdGlvbiBpc0FycmF5KGFycmF5KSB7XG4gICAgaWYgKHRoaXMuc3VwcG9ydHNJc0FycmF5KCkpIHtcbiAgICAgICAgcmV0dXJuIEFycmF5LmlzQXJyYXkoYXJyYXkpO1xuICAgIH1cblxuICAgIHJldHVybiB0b1N0cmluZy5jYWxsKGFycmF5KSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbn1cblxuZnVuY3Rpb24gc3VwcG9ydHNJc0FycmF5KCkge1xuICAgIHJldHVybiBBcnJheS5pc0FycmF5ICE9IG51bGw7XG59XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgICBjaGVjazogY2hlY2ssXG4gICAgYXR0cmlidXRlOiBhdHRyaWJ1dGUsXG4gICAgdmFyaWFibGU6IHZhcmlhYmxlLFxuICAgIHZhbHVlOiB2YWx1ZSxcbiAgICBpc0FycmF5OiBpc0FycmF5LFxuICAgIHN1cHBvcnRzSXNBcnJheTogc3VwcG9ydHNJc0FycmF5XG59OyIsImV4cG9ydCBjb25zdCBQQUdFUyA9IHtcbiAgICBtYWluOiBcImh0dHA6Ly9sb2NhbGhvc3Q6MzAwMFwiLFxuICAgIGVycm9yOiBcImh0dHA6Ly9sb2NhbGhvc3Q6MzAwMC9lcnJvclwiXG59IiwiaW1wb3J0IHsgUEFHRVMgfSBmcm9tIFwiLi9jb25zdGFudHNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcGxhY2VPcmRlcih7IHByb2R1Y3RfaWQsIG9yZGVyX2RldGFpbHMsIGNhbGxiYWNrIH0pIHtcbiAgICBpZiAoIXRoaXM/LmNsaWVudERhdGEgfHwgIXRoaXM/LmNsaWVudERhdGE/LmVudmlyb25tZW50IHx8ICF0aGlzPy5jbGllbnREYXRhLmtleSkge1xuICAgICAgICBsZXQgdXJsID0gYCR7UEFHRVMuZXJyb3J9L1NvbWV0aGluZyB3ZW50IHdyb25nIWBcbiAgICAgICAgdGhpcy5yZW5kZXJXaXRoUmV0cnkoe1xuICAgICAgICAgICAgdXJsLFxuICAgICAgICAgICAgb3JkZXJfZGV0YWlscyxcbiAgICAgICAgICAgIGNhbGxiYWNrXG4gICAgICAgIH0pO1xuICAgICAgICBjYWxsYmFjayh7IG1lc3NhZ2U6IFwiRXJyb3IgT2NjdXJlZCFcIiB9LCBudWxsKVxuICAgIH0gZWxzZSB7XG4gICAgICAgIGxldCB1cmwgPSBgJHtQQUdFUy5tYWlufS8/cHJvZHVjdF9pZD0ke3Byb2R1Y3RfaWR9YFxuICAgICAgICB0aGlzLnJlbmRlcldpdGhSZXRyeSh1cmwpO1xuICAgIH1cbn07IiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcmVjZWl2ZU1lc3NhZ2UoZXZlbnQpIHtcbiAgICBpZiAoZXZlbnQub3JpZ2luID09ICdodHRwOi8vbG9jYWxob3N0OjMwMDAnKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdldmVudCBsaXN0ZW5lZCcsIGV2ZW50KTtcblxuICAgICAgICBzd2l0Y2ggKGV2ZW50LmRhdGEudHlwZSkge1xuICAgICAgICAgICAgY2FzZSAnY2xvc2UnOlxuICAgICAgICAgICAgICAgIHRoaXMuY2xvc2VNb2RhbCgpO1xuICAgICAgICB9XG4gICAgfVxufTtcbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHJlbmRlcldpdGhSZXRyeSh1cmwsIHByb2R1Y3RJZCkge1xuICBjb25zdCBib2R5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpO1xuXG4gIGNvbnN0IHN0eWxlU2hlZXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuICBzdHlsZVNoZWV0LnR5cGUgPSAndGV4dC9jc3MnO1xuICBzdHlsZVNoZWV0LmlubmVyVGV4dCA9IGBcbiAgICAuZmxhbS1zZGstYmcge1xuICAgICAgcG9zaXRpb246IGZpeGVkO1xuICAgICAgdG9wOiAwO1xuICAgICAgcmlnaHQ6IDA7XG4gICAgICBib3R0b206IDA7XG4gICAgICBsZWZ0OiAwO1xuXG4gICAgICBtaW4taGVpZ2h0OiAxMDB2aDtcbiAgICAgIG1pbi13aWR0aDogMTAwdnc7XG4gICAgICBib3JkZXI6IG5vbmU7XG4gICAgICBiYWNrZ3JvdW5kOiByZ2JhKDAsMCwwLCAwLjQpO1xuXG4gICAgICBkaXNwbGF5OiBmbGV4O1xuICAgICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gICAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgIH1cblxuICAgICNmbGFtLXNkay1pZnJhbWUge1xuICAgICAgcG9zaXRpb246IGZpeGVkO1xuICAgICAgdG9wOiAwO1xuICAgICAgcmlnaHQ6IDA7XG4gICAgICBib3R0b206IDA7XG4gICAgICBsZWZ0OiAwO1xuXG4gICAgICBtaW4taGVpZ2h0OiAxMDB2aDtcbiAgICAgIG1pbi13aWR0aDogMTAwdnc7XG4gICAgICBib3JkZXI6IG5vbmU7XG4gICAgfVxuXG4gICAgLmZsYW0tc2RrLWxvYWRpbmcge1xuICAgICAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xuICAgICAgcG9zaXRpb246IHJlbGF0aXZlO1xuICAgICAgd2lkdGg6IDgwcHg7XG4gICAgICBoZWlnaHQ6IDgwcHg7XG4gICAgfVxuICAgIC5mbGFtLXNkay1sb2FkaW5nIGRpdiB7XG4gICAgICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xuICAgICAgZGlzcGxheTogYmxvY2s7XG4gICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgICB3aWR0aDogNjRweDtcbiAgICAgIGhlaWdodDogNjRweDtcbiAgICAgIG1hcmdpbjogOHB4O1xuICAgICAgYm9yZGVyOiAzcHggc29saWQgIzAwMDtcbiAgICAgIGJvcmRlci1yYWRpdXM6IDUwJTtcbiAgICAgIGFuaW1hdGlvbjogZmxhbS1zZGstbG9hZGluZyAxLjJzIGN1YmljLWJlemllcigwLjUsIDAsIDAuNSwgMSkgaW5maW5pdGU7XG4gICAgICBib3JkZXItY29sb3I6ICMwMDAgdHJhbnNwYXJlbnQgdHJhbnNwYXJlbnQgdHJhbnNwYXJlbnQ7XG4gICAgfVxuICAgIC5mbGFtLXNkay1sb2FkaW5nIGRpdjpudGgtY2hpbGQoMSkge1xuICAgICAgYW5pbWF0aW9uLWRlbGF5OiAtMC40NXM7XG4gICAgfVxuICAgIC5mbGFtLXNkay1sb2FkaW5nIGRpdjpudGgtY2hpbGQoMikge1xuICAgICAgYW5pbWF0aW9uLWRlbGF5OiAtMC4zcztcbiAgICB9XG4gICAgLmZsYW0tc2RrLWxvYWRpbmcgZGl2Om50aC1jaGlsZCgzKSB7XG4gICAgICBhbmltYXRpb24tZGVsYXk6IC0wLjE1cztcbiAgICB9XG4gICAgQGtleWZyYW1lcyBmbGFtLXNkay1sb2FkaW5nIHtcbiAgICAgIDAlIHtcbiAgICAgICAgdHJhbnNmb3JtOiByb3RhdGUoMGRlZyk7XG4gICAgICB9XG4gICAgICAxMDAlIHtcbiAgICAgICAgdHJhbnNmb3JtOiByb3RhdGUoMzYwZGVnKTtcbiAgICAgIH1cbiAgICB9XG4gIGA7XG5cbiAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzdHlsZVNoZWV0KTtcblxuICBjb25zdCBVSSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICBVSS5pbm5lckhUTUwgPSBgXG4gICAgICA8ZGl2IGNsYXNzPVwiZmxhbS1zZGstdWlcIiBpZD1cImZsYW0tc2RrLXVpXCI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJmbGFtLXNkay1iZ1wiIGlkPVwiZmxhbS1zZGstYmdcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmxhbS1zZGstbG9hZGluZ1wiIGlkPVwiZmxhbS1zZGstbG9hZGluZ1wiPjxkaXY+PC9kaXY+PGRpdj48L2Rpdj48ZGl2PjwvZGl2PjxkaXY+PC9kaXY+PC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8aWZyYW1lIGlkPVwiZmxhbS1zZGstaWZyYW1lXCIgc3R5bGU9XCJvcGFjaXR5OiAwXCIgbmFtZT1cImZsYW0tc2RrLWlmcmFtZVwiIHNyYz1cIiR7dXJsfVwiIHN0eWxlPVwib3BhY2l0eTogMFwiPjwvaWZyYW1lPlxuICAgICAgPC9kaXY+XG4gICAgYDtcblxuICBib2R5LmFwcGVuZENoaWxkKFVJKTtcblxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmxhbS1zZGstaWZyYW1lJykuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsICgpID0+IHtcblxuICAgIC8vIGhpZGUgbG9hZGluZ1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmbGFtLXNkay1iZycpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG5cbiAgICAvLyBCcmluZyB0aGUgaWZyYW1lIGJhY2tcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmxhbS1zZGstaWZyYW1lJykuc3R5bGUub3BhY2l0eSA9ICcxJztcblxuICAgIC8vIGZvciByZWNlaXZpbmcgbWVzc2FnZXMgZnJvbSBpZnJhbWVcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIHRoaXMucmVjZWl2ZU1lc3NhZ2UpO1xuXG4gICAgLy8gZm9yIHNlbmRpbmcgbWVzc2FnZXMgdG8gaWZyYW1lXG4gICAgdGhpcy5pV2luZG93ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJmbGFtLXNkay1pZnJhbWVcIikuY29udGVudFdpbmRvdztcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHRoaXMuc2VuZE1lc3NhZ2UoeyB0eXBlOiBcIklOSVRJQUxfREFUQVwiLCBkYXRhOiB7fSB9LCBcIipcIilcbiAgICB9LCAxMDApXG4gIH0pO1xufTsiLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBzZW5kTWVzc2FnZShtZXNzYWdlKSB7XG4gICAgdGhpcy5pV2luZG93LnBvc3RNZXNzYWdlKG1lc3NhZ2UsIFwiKlwiKVxufTsiLCJpbXBvcnQgY2xvc2VNb2RhbCBmcm9tICcuL2Nsb3NlTW9kYWwnO1xuaW1wb3J0IGFzc2VydCBmcm9tICcuL2hlbHBlci9hc3NlcnQnO1xuaW1wb3J0IHBsYWNlT3JkZXIgZnJvbSAnLi9wbGFjZU9yZGVyJztcbmltcG9ydCByZWNlaXZlTWVzc2FnZSBmcm9tICcuL3JlY2VpdmVNZXNzYWdlJztcbmltcG9ydCByZW5kZXJXaXRoUmV0cnkgZnJvbSAnLi9yZW5kZXJXaXRoUmV0cnknO1xuaW1wb3J0IHNlbmRNZXNzYWdlIGZyb20gJy4vc2VuZE1lc3NhZ2UnO1xuXG5pbXBvcnQgeyBQQUdFUyB9IGZyb20gXCIuL2NvbnN0YW50c1wiO1xuXG5mdW5jdGlvbiBpbml0KGNsaWVudERhdGEpIHtcbiAgLyogZXNsaW50LWRpc2FibGUgKi9cbiAgdHJ5IHtcbiAgICBhc3NlcnQuY2hlY2soXG4gICAgICBjbGllbnREYXRhLFxuICAgICAgeyB0eXBlOiAnb2JqZWN0JywgbWVzc2FnZTogJ2NsaWVudERhdGEgcGFyYW1ldGVyIGlzIG5vdCB2YWxpZCcgfSxcbiAgICAgIC8vIHtcbiAgICAgIC8vICAgZG9tYWluOiB7IHR5cGU6ICdzdHJpbmcnLCBtZXNzYWdlOiAnZG9tYWluIG9wdGlvbiBpcyByZXF1aXJlZCcgfSxcbiAgICAgIC8vICAgY2xpZW50SUQ6IHsgdHlwZTogJ3N0cmluZycsIG1lc3NhZ2U6ICdjbGllbnRJRCBvcHRpb24gaXMgcmVxdWlyZWQnIH0sXG4gICAgICAvLyAgIHJlc3BvbnNlVHlwZToge1xuICAgICAgLy8gICAgIG9wdGlvbmFsOiB0cnVlLFxuICAgICAgLy8gICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgLy8gICAgIG1lc3NhZ2U6ICdyZXNwb25zZVR5cGUgaXMgbm90IHZhbGlkJ1xuICAgICAgLy8gICB9LFxuICAgICAgLy8gfVxuICAgICAge1xuICAgICAgICBrZXk6IHsgdHlwZTogJ3N0cmluZycsIG1lc3NhZ2U6ICdrZXkgaXMgcmVxdWlyZWQnIH0sXG4gICAgICAgIGVudmlyb25tZW50OiB7XG4gICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgICAgbWVzc2FnZTogJ2Vudmlyb25tZW50IGlzIHJlcXVpcmVkJ1xuICAgICAgICB9XG4gICAgICB9XG4gICAgKTtcblxuICAgIGlmIChjbGllbnREYXRhLm92ZXJyaWRlcykge1xuICAgICAgYXNzZXJ0LmNoZWNrKFxuICAgICAgICBjbGllbnREYXRhLm92ZXJyaWRlcyxcbiAgICAgICAgeyB0eXBlOiAnb2JqZWN0JywgbWVzc2FnZTogJ292ZXJyaWRlcyBjbGllbnREYXRhIGlzIG5vdCB2YWxpZCcgfSxcbiAgICAgICk7XG4gICAgfVxuICB9IGNhdGNoIChlcnIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoZXJyLm1lc3NhZ2UpXG4gIH1cblxuICB0aGlzLmNsaWVudERhdGEgPSBjbGllbnREYXRhO1xuXG4gIC8vIGNvcmUgbWV0aG9kc1xuICB0aGlzLnJlbmRlcldpdGhSZXRyeSA9IHJlbmRlcldpdGhSZXRyeTtcbiAgdGhpcy5wbGFjZU9yZGVyID0gcGxhY2VPcmRlcjtcbiAgdGhpcy5yZWNlaXZlTWVzc2FnZSA9IHJlY2VpdmVNZXNzYWdlO1xuICB0aGlzLnNlbmRNZXNzYWdlID0gc2VuZE1lc3NhZ2U7XG4gIHRoaXMuY2xvc2VNb2RhbCA9IGNsb3NlTW9kYWxcblxuICAvKiBlc2xpbnQtZW5hYmxlICovXG59XG5cbmV4cG9ydCBkZWZhdWx0IGluaXQ7IiwibW9kdWxlLmV4cG9ydHMgPSB7IHJhdzogJzAuMS4xJyB9O1xuIiwiaW1wb3J0IGluaXQgZnJvbSAnLi9zZGsnO1xuaW1wb3J0IHZlcnNpb24gZnJvbSAnLi92ZXJzaW9uJztcblxuZXhwb3J0IHsgdmVyc2lvbiwgaW5pdCB9O1xuXG5leHBvcnQgZGVmYXVsdCB7IHZlcnNpb246IHZlcnNpb24sIGluaXQ6IGluaXQgfTsiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztJQUFlLFNBQVMsVUFBVSxHQUFHO0lBQ3JDLElBQUksTUFBTSxPQUFPLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUMzRCxJQUFJLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQztJQUNyQixJQUFJLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBQy9EOztJ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
