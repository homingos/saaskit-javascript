/**
 * flamsdk v1.0.10
 * Author: bucharitesh
 * Date: 2022-12-23
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
    iframe.contentWindow.postMessage(message, 'https://v1.sdk.zingcam.tech/');
  };

  // https://v1.sdk.zingcam.tech
  // http://localhost:3000/

  const renderIframe = () => {
    const styleSheet = document.createElement('style');
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

    document.head.appendChild(styleSheet);
    const body = document.querySelector('body');
    const wrapper = document.createElement('div');
    wrapper.id = 'flam-sdk-wrapper';
    wrapper.innerHTML = `<iframe id="flam-sdk-iframe" style="display: none" name="flam-sdk-iframe" src="https://v1.sdk.zingcam.tech/" style="opacity: 0"></iframe>`;
    body.appendChild(wrapper);
  };

  // https://v1.sdk.zingcam.tech
  // http://localhost:3000

  function placeOrder(data) {
    try {
      if ((!data.productId, !data.refId)) {
        throw 'ProductID and RefId are required';
      }
      window.handleSuccess = data.handleSuccess;
      window.handleFailure = data.handleFailure;
      const iframe = document.getElementById('flam-sdk-iframe');
      iframe.style.display = 'block';

      handleSend({ type: 'CLIENT_DATA', message: JSON.stringify(data) });
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

  var version = { raw: '1.0.10' };
  version.raw;

  var index = { version: version, init: init };

  exports["default"] = index;
  exports.init = init;
  exports.version = version;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
