/**
 * flamsdk v2.0.2-beta.0
 * Author: bucharitesh
 * Date: 2023-01-31
 * License: MIT
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.FlamSaasSDK = {}));
})(this, (function (exports) { 'use strict';

  function handleListener(data) {
    switch (data.type) {
      case 'READY':
        handleSend({
          type: 'INITIAL_DATA',
          message: localStorage.getItem('options')
        });
        window.__SDK_READY = true;
        break;
      case 'CLOSE':
        {
          const iframe = document.getElementById('flam-sdk-iframe');
          iframe.style.display = 'none';
        }
        break;
      case 'SUCCESS':
        window.handleSuccess(data.message);
        break;
      case 'FAIL':
        window.handleFailure(data.message);
        break;
      default:
        console.log(data);
    }
  }

  const handleSend = message => {
    const iframe = document.getElementById('flam-sdk-iframe');
    iframe.contentWindow.postMessage(message, 'https://dev.sdk.zingcam.tech');
  };

  const renderIframe = () => {
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
    <iframe id="flam-sdk-iframe" style="display: none" name="flam-sdk-iframe" src="https://dev.sdk.zingcam.tech" style="opacity: 0"></iframe>
    <div id="flam-sdk-loading-wrapper">
      <span id="flam-sdk-loading"></span>
    </div>
  `;
    body.appendChild(wrapper);
  };

  // http://192.168.1.64:3000
  // https://v1.sdk.zingcam.tech
  // https://zingcam-sdk-v2-dev.vercel.app
  // http://localhost:3000

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
      if ((!data.productId, !data.refId)) {
        throw 'ProductID and RefId are required';
      }
      window.handleSuccess = data.handleSuccess;
      window.handleFailure = data.handleFailure;

      const loader = document.getElementById('flam-sdk-loading-wrapper');
      loader.style.display = 'flex';

      renderFrameOnReady(data);
    } catch (err) {
      console.log(err);
    }
  }

  function init(options) {
    try {
      if (!options.key) {
        throw 'Please add your key!';
      }
      localStorage.setItem('options', JSON.stringify(options));
      window.addEventListener(
        'message',
        e => {
          handleListener(e.data);
        },
        false
      );
      renderIframe();
    } catch (err) {
      console.log(err);
    }

    // return placeOrder;
  }

  init.prototype.placeOrder = placeOrder;

  var version = { raw: '2.0.2-beta.0' };
  version.raw;

  var index = { version: version, init: init };

  exports["default"] = index;
  exports.init = init;
  exports.version = version;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
