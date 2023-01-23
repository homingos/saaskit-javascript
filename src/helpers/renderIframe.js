export const renderIframe = () => {
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
  wrapper.innerHTML = `<iframe id="flam-sdk-iframe" style="display: none" name="flam-sdk-iframe" src="https://zingcam-sdk-v2-dev.vercel.app" style="opacity: 0"></iframe>`;
  body.appendChild(wrapper);
};

// http://192.168.1.64:3000
// https://v1.sdk.zingcam.tech
// https://zingcam-sdk-v2-dev.vercel.app
// http://localhost:3000
