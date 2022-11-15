/* eslint-disable compat/compat */
import { PAGES } from './constants';

export let trackOrder = null;

/**
 * Renders the UI for Placing Order
 * @function
 * @param {String} url url to either order flow or error page
 */

export default async function renderWithRetry(url) {
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

  const UI = document.createElement('div');
  UI.id = 'flam-sdk-wrapper';

  var RegExp = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i;

  const newUrl = () => {
    if (
      this.order_details &&
      this.order_details.theme &&
      this.order_details.theme.primaryColor &&
      this.order_details.theme.secondaryColor &&
      RegExp.test(this.order_details.theme.primaryColor) &&
      RegExp.test(this.order_details.theme.secondaryColor)
    ) {
      const color1 = '/?color1=';
      const color2 = '&color2=';
      return (
        url +
        color1 +
        encodeURIComponent(this.order_details.theme.primaryColor) +
        color2 +
        encodeURIComponent(this.order_details.theme.secondaryColor)
      );
    }
    return url;
  };

  UI.innerHTML = `
      <div class="flam-sdk-loading-wrapper" id="flam-sdk-loading-wrapper">
        <div class="flam-sdk-loading" id="flam-sdk-loading"><div></div><div></div><div></div><div></div></div>
      </div>
      <iframe id="flam-sdk-iframe" style="opacity: 0" name="flam-sdk-iframe" src="" style="opacity: 0"></iframe>      
    `;

  body.appendChild(UI);

  const iFrame = document.getElementById('flam-sdk-iframe');

  try {
    // check if website online
    await fetch(PAGES.main);

    // save window context for sending messages to iframe
    this.iWindow = iFrame.contentWindow;

    // message event handler
    trackOrder = e => this.receiveMessage(e);

    // event listener for receiving messages from iframe
    window.addEventListener('message', trackOrder);

    iFrame.src = newUrl();
  } catch (err) {
    if (err.message === 'Failed to fetch') {
      this.close();
      this.callback({
        code: 500,
        message: 'Unable to access SDK Website!'
      });
    } else {
      this.callback({
        code: 500,
        message: 'Please try again'
      });
    }
    return;
  }

  iFrame.addEventListener('load', async e => {
    e.preventDefault();

    try {
      // hide initial loading
      document.getElementById('flam-sdk-loading-wrapper').style.display =
        'none';

      // Show the iframe content
      iFrame.style.opacity = '1';


    } catch (err) {
      if (err.message === 'Failed to fetch') {
        this.close();
        this.callback({
          code: 500,
          message: 'Unable to access SDK Website!'
        });
        return;
      }
      this.callback({
        code: 500,
        message: 'Please try again'
      });
    }
  });
}
