/**
 * flamsdk v2.0.4-beta.0
 * Author: bucharitesh
 * Date: 2023-02-23
 * License: MIT
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.FlamSaasSDK = {}));
})(this, (function (exports) { 'use strict';

  function handleListener(data, link) {
    switch (data.type) {
      case 'READY': {
        handleSend({
          type: 'INITIAL_DATA',
          message: localStorage.getItem('options')
        });
        window.__SDK_READY = true;
        break;
      }
      case 'CLOSE': {
        const iframe = document.getElementById('flam-sdk-iframe');
        iframe.style.display = 'none';
        break;
      }
      case 'DIRECT_CLOSE': {
        const iframe = document.getElementById('flam-sdk-iframe');
        iframe.style.display = 'none';
        window.handleClose();
        break;
      }
      case 'SUCCESS': {
        window.handleSuccess(data.message);
        break;
      }
      case 'FAIL': {
        window.handleFailure(data.message);
        break;
      }
      default:
        console.log(data);
    }
  }

  const handleSend = message => {
    const iframe = document.getElementById('flam-sdk-iframe');
<<<<<<< Updated upstream
    iframe.contentWindow.postMessage(message, 'https://dev.sdk.zingcam.tech');
=======
    iframe.contentWindow.postMessage(message, '*');
>>>>>>> Stashed changes
  };

  const renderIframe = link => {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'saas-sdk-style';
    styleSheet.innerText = `
    body {
      overflow: hidden;
    }

    #flam-sdk-loading-wrapper {
      display: none;
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

    #flam-sdk-loading {
      width: 48px;
      height: 48px;
      border: 5px solid #FFF;
      border-bottom-color: transparent;
      border-radius: 50%;
      display: inline-block;
      box-sizing: border-box;
      animation: sdkrotation 1s linear infinite;
      }
  
    @keyframes sdkrotation {
      0% {
          transform: rotate(0deg);
      }
      100% {
          transform: rotate(360deg);
      }
    }
  `;

    document.head.appendChild(styleSheet);
    const body = document.querySelector('body');
    const wrapper = document.createElement('div');
    wrapper.id = 'flam-sdk-wrapper';
    wrapper.innerHTML = `
<<<<<<< Updated upstream
    <iframe id="flam-sdk-iframe" style="display: none" name="flam-sdk-iframe" src="https://dev.sdk.zingcam.tech" style="opacity: 0"></iframe>
=======
    <iframe id="flam-sdk-iframe" style="display: none" name="flam-sdk-iframe" src='${link}' style="opacity: 0"></iframe>
>>>>>>> Stashed changes
    <div id="flam-sdk-loading-wrapper">
      <span id="flam-sdk-loading"></span>
    </div>
  `;
    body.appendChild(wrapper);
  };

  function warn (message) {
    const styles = ['color: black', 'background: yellow'].join(';');

    const name = '[ZINGCAM SDK]';

    message = name + ': ' + message;
    console.log('%c%s', styles, message);
  }

  function renderFrameOnReady(data) {
    setTimeout(() => {
      if (window.__SDK_READY) {
        const loader = document.getElementById('flam-sdk-loading-wrapper');
        loader.style.display = 'none';

        const iframe = document.getElementById('flam-sdk-iframe');
        iframe.style.display = 'block';

        handleSend({ type: 'CLIENT_DATA', message: JSON.stringify(data) });

        return;
      }
      renderFrameOnReady(data);
    }, 0);
  }

  function placeOrder(data) {
    try {
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid paramerters passed');
      }

      if (!data.productId || typeof data.productId !== 'string') {
        throw new Error('PRODUCT ID is invalid or missing');
      }

      if (!data.varientId || typeof data.varientId !== 'string') {
        throw new Error('VARIENT ID is invalid or missing');
      }

      if (!data.refId || typeof data.refId !== 'string') {
        throw new Error('REF ID is invalid or missing');
      }

      if (!data.photo || typeof data.photo !== 'object') {
        throw new Error('photo options are invalid or missing');
      }

      if (!data.video || typeof data.video !== 'object') {
        throw new Error('video options are invalid or missing');
      }

      window.handleSuccess = data.handleSuccess;
      window.handleFailure = data.handleFailure;
      window.handleClose = data.handleClose;

      const loader = document.getElementById('flam-sdk-loading-wrapper');
      loader.style.display = 'flex';

      renderFrameOnReady(data);
    } catch (err) {
      warn(err.message);
    }
  }

  function updateOrder(data) {
    try {
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid paramerters passed');
      }

      if (!data.refId || typeof data.refId !== 'string') {
        throw new Error('REF ID is invalid or missing');
      }

      window.handleSuccess = data.handleSuccess;
      window.handleFailure = data.handleFailure;
      window.handleClose = data.handleClose;

      const loader = document.getElementById('flam-sdk-loading-wrapper');
      loader.style.display = 'flex';

      renderFrameOnReady({ ...data, existingOrder: true });
    } catch (err) {
      warn(err.message);
    }
  }

  // import assert from '../helpers/assert';
  function init(options) {
    try {
      if (!options || typeof options !== 'object') {
        throw new Error('Invalid paramerters passed');
      }

      if (!options.key || typeof options.key !== 'string') {
        throw new Error('KEY is required or missing !!');
      }

      if (!options.environment || typeof options.environment !== 'string') {
        throw new Error('ENVIRONMENT must be STAGE or PRODUCTION !!');
      }

      // const devLink = 'http://localhost:3000/';
      const devLink = 'https://dev.sdk.zingcam.tech/';

      const link =
        options.environment === 'PRODUCTION'
          ? devLink
          : 'https://stage.sdk.zingcam.tech';

      // const link = options.enviornment === 'PRODUCTION' ? 'https://prod.sdk.zingcam.tech' : 'https://stage.sdk.zingcam.tech';

      localStorage.setItem('options', JSON.stringify(options));
      window.addEventListener(
        'message',
        e => {
          handleListener(e.data, link);
        },
        false
      );
      renderIframe(link);
    } catch (err) {
      warn(err.message);
    }
  }

  init.prototype.placeOrder = placeOrder;
  init.prototype.updateOrder = updateOrder;

  var version = { raw: '2.0.4-beta.0' };
  version.raw;

  var index = { version: version, init: init };

  exports["default"] = index;
  exports.init = init;
  exports.version = version;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
