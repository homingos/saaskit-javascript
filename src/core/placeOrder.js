import { handleSend, handleListener } from '../helpers/messageHandlers';
import { warn } from '../helpers/warn';
import { renderIframe } from '../helpers/renderIframe';

export function loadFrame(data) {
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

export function placeOrder(data) {
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

export function updateOrder(data) {
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
