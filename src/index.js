function FlamSDK() {
  let token = '';
  let _this = this;
  this.placeOrder = function placeOrder(token) {
    if (token == 'abc') {
      this.token = token;
      const body = document.querySelector('body');

      const iFrame = document.createElement('iframe');
      iFrame.id = 'flam-sdk-iframe';
      iFrame.name = 'flam-sdk-iframe';
      iFrame.src = 'http://localhost:3000/';

      body.appendChild(iFrame);

      window.addEventListener('message', this.receiveMessage);
    } else {
      alert('Wrong sdk creds');
    }
  };

  this.receiveMessage = function receiveMessage(event) {
    if (event.origin == 'http://localhost:3000') {
      console.log('event listened', event);

      switch (event.data.type) {
        case 'close':
          _this.closeModal();
      }
    }
  };

  this.closeModal = function closeModal() {
    const element = document.getElementById('flam-sdk-iframe');
    element.remove();
    window.removeEventListener('message', this.receiveMessage);
  };
}
