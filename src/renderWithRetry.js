import { PAGES } from './constants';
export let trackOrder = null;
export default async function renderWithRetry({ url, error }) {
  const body = document.querySelector('body');

  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.id = 'saas-sdk-style';
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
  UI.id = 'flam-sdk-wrapper';
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
    console.log('THIS 1', this);
    e.preventDefault();
    // console.log('Iframe Load', e);

    try {
      if (this.clientData.environment == 'production') {
        await fetch(PAGES.main);
      }

      // hide loading
      document.getElementById('flam-sdk-bg').style.display = 'none';

      // Bring the iframe back
      iFrame.style.opacity = '1';

      trackOrder = e => {
        this.receiveMessage(e);
      };

      // for receiving messages from iframe
      window.addEventListener('message', trackOrder);

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
