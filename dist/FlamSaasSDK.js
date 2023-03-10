/**
 * flamsdk v2.0.4-beta.0
 * Author: bucharitesh
 * Date: 2023-03-10
 * License: MIT
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.FlamSaasSDK = {}));
})(this, (function (exports) { 'use strict';

  function warn (message) {
    const styles = ['color: black', 'background: yellow'].join(';');

    const name = '[ZINGCAM SDK]';

    message = name + ': ' + message;
    console.log('%c%s', styles, message);
  }

  const unmountSDK = () => {
    const iframeWrapper = document.getElementById('flam-sdk-wrapper');
    iframeWrapper.remove();

    const styleSheet = document.getElementById('saas-sdk-style');
    styleSheet.remove();

    window.__SDK_READY = false;
    window.removeEventListener('message', window.__FlamSDKListener);
  };

  function handleListener(data, link) {
    switch (data.type) {
      case 'READY': {
        window.__SDK_READY = true;
        console.log('READY_READY test');
        handleSend({
          type: 'INITIAL_DATA',
          message: localStorage.getItem('options')
        });
        break;
      }
      case 'CLOSE': {
        unmountSDK();
        break;
      }
      case 'DIRECT_CLOSE': {
        unmountSDK();
        window.handleClose();
        break;
      }
      case 'SUCCESS': {
        unmountSDK();
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
    iframe.contentWindow.postMessage(message, '*');
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
    <iframe id="flam-sdk-iframe" style="display: none" name="flam-sdk-iframe" src='${link}' style="opacity: 0"></iframe>
    <div id="flam-sdk-loading-wrapper">
      <span id="flam-sdk-loading"></span>
    </div>
  `;
    body.appendChild(wrapper);
  };

  function loadFrame(data) {
    window.__FlamSDKListener = e => {
      handleListener(e.data, localStorage.getItem('__FLAM_SDK_LINK'));
    };

    window.addEventListener('message', window.__FlamSDKListener, false);

    renderIframe(localStorage.getItem('__FLAM_SDK_LINK'));

    window.handleSuccess = data.handleSuccess;
    window.handleFailure = data.handleFailure;
    window.handleClose = data.handleClose;

    const loader = document.getElementById('flam-sdk-loading-wrapper');
    loader.style.display = 'flex';

    displayFrameOnReady(data);
  }

  function displayFrameOnReady(data) {
    setTimeout(() => {
      if (window.__SDK_READY) {
        const loader = document.getElementById('flam-sdk-loading-wrapper');
        loader.style.display = 'none';

        const iframe = document.getElementById('flam-sdk-iframe');
        iframe.style.display = 'block';

        handleSend({ type: 'CLIENT_DATA', message: JSON.stringify(data) });

        return;
      }
      displayFrameOnReady(data);
    }, 500);
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

      loadFrame(data);
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

      loadFrame({ ...data, existingOrder: true });
    } catch (err) {
      warn(err.message);
    }
  }

  // BETA | STABLE
  const RELEASE_TYPE = 'BETA';

  const DEV_LINK = 'http://localhost:3000'; // 'https://dev.sdk.zingcam.tech';
  const STAGE_LINK = 'https://stage.sdk.zingcam.tech';
  const PROD_LINK = 'https://prod.sdk.zingcam.tech';

  const links = {
    BETA: [DEV_LINK, STAGE_LINK],
    STABLE: [PROD_LINK, STAGE_LINK]
  };

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

      const link =
        links[RELEASE_TYPE][options.environment === 'PRODUCTION' ? 0 : 1];

      console.log('LINK', link);

      localStorage.setItem('options', JSON.stringify(options));
      localStorage.setItem('__FLAM_SDK_LINK', link);
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
