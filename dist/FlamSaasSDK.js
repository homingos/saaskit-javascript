/**
 * flamsdk v2.0.1
 * Author: FlamSaasSDK
 * Date: 2022-12-17
 * License: MIT
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.FlamSaasSDK = {}));
}(this, (function (exports) { 'use strict';

  function handleListener(data) {
    switch (data.type) {
      case 'READY':
        handleSend({
          type: 'INITIAL_DATA',
          message: localStorage.getItem('options')
        });
        break;
      case 'CLOSE':
        {
          const iframe = document.getElementById('flam-sdk-iframe');
          iframe.style.display = 'none';
        }
        break;
      case 'SUCCESS':
        window.successHandler(JSON.parse(data.message));
        break;
      case 'FAIL':
        window.failHandler(data.message);
        break;
      default:
        console.log(data);
    }
  }

  const handleSend = message => {
    const iframe = document.getElementById('flam-sdk-iframe');
    iframe.contentWindow.postMessage(message, 'http://localhost:3000/');
  };

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

  /* eslint-disable no-continue */

  function get() {
    if (!Object.assign) {
      return objectAssignPolyfill;
    }

    return Object.assign;
  }

  function objectAssignPolyfill(target) {
    if (target === undefined || target === null) {
      throw new TypeError('Cannot convert first argument to object');
    }

    var to = Object(target);
    for (var i = 1; i < arguments.length; i++) {
      var nextSource = arguments[i];
      if (nextSource === undefined || nextSource === null) {
        continue;
      }

      var keysArray = Object.keys(Object(nextSource));
      for (
        var nextIndex = 0, len = keysArray.length;
        nextIndex < len;
        nextIndex++
      ) {
        var nextKey = keysArray[nextIndex];
        var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
        if (desc !== undefined && desc.enumerable) {
          to[nextKey] = nextSource[nextKey];
        }
      }
    }
    return to;
  }

  var objectAssign = {
    get: get,
    objectAssignPolyfill: objectAssignPolyfill
  };

  /* eslint-disable no-param-reassign */

  function pick(object, keys) {
    return keys.reduce(function (prev, key) {
      if (object[key]) {
        prev[key] = object[key];
      }
      return prev;
    }, {});
  }

  function getKeysNotIn(obj, allowedKeys) {
    var notAllowed = [];
    for (var key in obj) {
      if (allowedKeys.indexOf(key) === -1) {
        notAllowed.push(key);
      }
    }
    return notAllowed;
  }

  function objectValues(obj) {
    var values = [];
    for (var key in obj) {
      values.push(obj[key]);
    }
    return values;
  }

  function extend() {
    var params = objectValues(arguments);
    params.unshift({});
    return objectAssign.get().apply(undefined, params);
  }

  function merge(object, keys) {
    return {
      base: keys ? pick(object, keys) : object,
      with: function (object2, keys2) {
        object2 = keys2 ? pick(object2, keys2) : object2;
        return extend(this.base, object2);
      }
    };
  }

  function blacklist(object, blacklistedKeys) {
    return Object.keys(object).reduce(function (p, key) {
      if (blacklistedKeys.indexOf(key) === -1) {
        p[key] = object[key];
      }
      return p;
    }, {});
  }

  function camelToSnake(str) {
    var newKey = '';
    var index = 0;
    var code;
    var wasPrevNumber = true;
    var wasPrevUppercase = true;

    while (index < str.length) {
      code = str.charCodeAt(index);
      if (
        (!wasPrevUppercase && code >= 65 && code <= 90) ||
        (!wasPrevNumber && code >= 48 && code <= 57)
      ) {
        newKey += '_';
        newKey += str[index].toLowerCase();
      } else {
        newKey += str[index].toLowerCase();
      }
      wasPrevNumber = code >= 48 && code <= 57;
      wasPrevUppercase = code >= 65 && code <= 90;
      index++;
    }

    return newKey;
  }

  function snakeToCamel(str) {
    var parts = str.split('_');
    return parts.reduce(function (p, c) {
      return p + c.charAt(0).toUpperCase() + c.slice(1);
    }, parts.shift());
  }

  function toSnakeCase(object, exceptions) {
    if (typeof object !== 'object' || assert.isArray(object) || object === null) {
      return object;
    }
    exceptions = exceptions || [];

    return Object.keys(object).reduce(function (p, key) {
      var newKey = exceptions.indexOf(key) === -1 ? camelToSnake(key) : key;
      p[newKey] = toSnakeCase(object[key]);
      return p;
    }, {});
  }

  function toCamelCase(object, exceptions, options) {
    if (typeof object !== 'object' || assert.isArray(object) || object === null) {
      return object;
    }

    exceptions = exceptions || [];
    options = options || {};
    return Object.keys(object).reduce(function (p, key) {
      var newKey = exceptions.indexOf(key) === -1 ? snakeToCamel(key) : key;

      p[newKey] = toCamelCase(object[newKey] || object[key], [], options);

      if (options.keepOriginal) {
        p[key] = toCamelCase(object[key], [], options);
      }
      return p;
    }, {});
  }

  function getLocationFromUrl(href) {
    var match = href.match(
      /^(https?:|file:|chrome-extension:)\/\/(([^:/?#]*)(?::([0-9]+))?)([/]{0,1}[^?#]*)(\?[^#]*|)(#.*|)$/
    );
    return (
      match && {
        href: href,
        protocol: match[1],
        host: match[2],
        hostname: match[3],
        port: match[4],
        pathname: match[5],
        search: match[6],
        hash: match[7]
      }
    );
  }

  function getOriginFromUrl(url) {
    if (!url) {
      return undefined;
    }
    var parsed = getLocationFromUrl(url);
    if (!parsed) {
      return null;
    }
    var origin = parsed.protocol + '//' + parsed.hostname;
    if (parsed.port) {
      origin += ':' + parsed.port;
    }
    return origin;
  }

  function trim(options, key) {
    var trimmed = extend(options);
    if (options[key]) {
      trimmed[key] = options[key].trim();
    }
    return trimmed;
  }

  function trimMultiple(options, keys) {
    return keys.reduce(trim, options);
  }

  function trimUserDetails(options) {
    return trimMultiple(options, ['username', 'email', 'phoneNumber']);
  }

  /**
   * Updates the value of a property on the given object, using a deep path selector.
   * @param {object} obj The object to set the property value on
   * @param {string|array} path The path to the property that should have its value updated. e.g. 'prop1.prop2.prop3' or ['prop1', 'prop2', 'prop3']
   * @param {any} value The value to set
   * @ignore
   */
  function updatePropertyOn(obj, path, value) {
    if (typeof path === 'string') {
      path = path.split('.');
    }

    var next = path[0];

    if (obj.hasOwnProperty(next)) {
      if (path.length === 1) {
        obj[next] = value;
      } else {
        updatePropertyOn(obj[next], path.slice(1), value);
      }
    }
  }

  var objectHelper = {
    toSnakeCase: toSnakeCase,
    toCamelCase: toCamelCase,
    blacklist: blacklist,
    merge: merge,
    pick: pick,
    getKeysNotIn: getKeysNotIn,
    extend: extend,
    getOriginFromUrl: getOriginFromUrl,
    getLocationFromUrl: getLocationFromUrl,
    trimUserDetails: trimUserDetails,
    updatePropertyOn: updatePropertyOn
  };

  function redirect(url) {
    getWindow().location = url;
  }

  function getDocument() {
    return getWindow().document;
  }

  function getWindow() {
    return window;
  }

  function getOrigin() {
    var location = getWindow().location;
    var origin = location.origin;

    if (!origin) {
      origin = objectHelper.getOriginFromUrl(location.href);
    }

    return origin;
  }

  var windowHelper = {
    redirect: redirect,
    getDocument: getDocument,
    getWindow: getWindow,
    getOrigin: getOrigin
  };

  function IframeHandler(options) {
    this.url = options.url;
  }

  IframeHandler.prototype.init = function () {
    var _window = windowHelper.getWindow();
    const styleSheet = _window.document.createElement('style');
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

      z-index: 1000;
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
      z-index: 1000;
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

    _window.document.head.appendChild(styleSheet);
    const body = _window.document.querySelector('body');
    const wrapper = _window.document.createElement('div');
    wrapper.id = 'flam-sdk-wrapper';
    wrapper.innerHTML = `<iframe id="flam-sdk-iframe" style="display: none" name="flam-sdk-iframe" src="${this.url}" style="opacity: 0"></iframe>`;
    body.appendChild(wrapper);
  };

  /**
   * Makes a call to the `placeOrder` to launch a UI for placing the orders.
   *
   * @method placeOrder
   * @param {Object} data
   * @param {String} data.productId Product ID of the product (required]
   * @param {String} data.variantId Variant ID of the product (required)
   * @param {String} data.refId Random generated Ref ID, must be unique. (required)
   * @param {Object} [data.photo] 
   * @param {string} [data.photo.changeable] If set to true, Client can re-upload the picture even if one passes the url.
   * @param {string} [data.photo.url] Photo URL sent by the Client.
   * @param {string} [data.photo.allowCrop] If set to true, Allows the Client to allow Cropping the video.
   * @param {string} [data.photo.maxSize] Max Size limit that a user can set for Uploading.
   * @param {Object} [data.video]
   * @param {string} [data.video.changeable] If set to true, Client can re-upload the picture even if one passes the url.
   * @param {string} [data.video.url] Video URL sent by the Client.
   * @param {string} [data.video.allowTrim] If set to true, Allows the Client to allow triming the video.
   * @param {string} [data.video.maxSize] Max Size limit that a user can set for Uploading.
   * @param {Object} [data.prefill]
   * @param {string} [data.prefill.name] SDK config for Name of the Client
   * @param {string} [data.prefill.email] SDK config for Email of the Client
   * @param {string} [data.prefill.contact] SDK config for Contact Number of the Client
   * @param {Object} [data.theme]
   * @param {string} [data.theme.color] hex color for themeing the UI
   * @param {callback} [handleSuccess]
   * @param {callback} [handleFailure]
   * @memberof init.prototype
   */

  function placeOrder(data) {
    try {
      if ((!data.productId, !data.refId)) {
        throw 'ProductID and RefId are required';
      }
      const iframe = document.getElementById('flam-sdk-iframe');
      iframe.style.display = 'block';
      handleSend({ type: 'CLIENT_DATA', message: JSON.stringify(data) });
    } catch (err) {
      console.log(err);
    }
  }

  /**
   * Initializes a SDK instance
   * @constructor
   * @param {Object} options
   * @param {String} options.key the API Key found on your Application settings page
   * @param {String} [options.environment] enviornment SANDBOX | PRODUCTION
   */
  function init(options) {
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
      throw 'Please try again';
    }

    options.environment =
      options &&
      typeof options.environment === 'string' &&
      options.environment.toUpperCase() === 'PRODUCTION'
        ? 'PRODUCTION'
        : 'SANDBOX';

    try {
      localStorage.setItem('options', JSON.stringify(options));
      window.addEventListener(
        'message',
        e => {
          handleListener(e.data);
        },
        false
      );
      const handler = new IframeHandler({
        url: 'http://localhost:3000'
      });

      handler.init();
    } catch (err) {
      console.log(err);
    }
  }

  init.prototype.placeOrder = placeOrder;

  var version = { raw: '1.0.10' };

  var index = { version: version, init: init };

  exports.default = index;
  exports.init = init;
  exports.version = version;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
