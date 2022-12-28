import { handleSend } from '../helpers/messageHandlers';

export function placeOrder(data) {
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
