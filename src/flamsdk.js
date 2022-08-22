export function FlamSDK() {
  let token = '';
  let _this = this;
  this.renderWithRetry = function renderWithRetry() {
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
      <div class="flam-sdk-ui">
        <div class="flam-sdk-bg" id="flam-sdk-bg">
          <div class="flam-sdk-loading" id="flam-sdk-loading"><div></div><div></div><div></div><div></div></div>
        </div>
        <iframe id="flam-sdk-iframe" style="opacity: 0" name="flam-sdk-iframe" src="http://localhost:3000/" style="opacity: 0"></iframe>
      </div>
    `;

    body.appendChild(UI);

    // this gets called when just the iFrame has loaded and not iFrame + website
    document.querySelector('#flam-sdk-iframe').addEventListener('load', () => {
      // iWindow = iframe.contentWindow;

      document.getElementById('flam-sdk-bg').style.display = 'none';

      // Bring the iframe back
      document.getElementById('flam-sdk-iframe').style.opacity = '1';
    });
  };

  this.placeOrder = function placeOrder() {
    if (token == 'abc') {
      this.token = token;
      this.renderWithRetry();
      window.addEventListener('message', this.receiveMessage);
    } else {
      alert('Wrong sdk creds');
    }
  };

  this.receiveMessage = function receiveMessage() {
    if (event.origin == 'http://localhost:3000') {
      console.log('event listened', event);

      switch (event.data.type) {
        case 'close':
          _this.closeModal();
      }
    }
  };

  this.sendMessage = function sendMessage() {};

  this.closeModal = function closeModal() {
    const element = document.getElementById('flam-sdk-iframe');
    element.remove();
    window.removeEventListener('message', this.receiveMessage);
  };
}
