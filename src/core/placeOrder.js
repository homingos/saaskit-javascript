import { handleSend } from '../helpers/messageHandlers';

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

export function placeOrder(data) {
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
