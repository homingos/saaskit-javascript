export const renderIframe = () => {
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
    <iframe id="flam-sdk-iframe" style="display: none" name="flam-sdk-iframe" src="https://prod.sdk.zingcam.tech" style="opacity: 0"></iframe>
    <div id="flam-sdk-loading-wrapper">
      <span id="flam-sdk-loading"></span>
    </div>
  `;
  body.appendChild(wrapper);
};
