import { PAGES } from './constants';

export default function placeOrder(order_details, callback) {
  this.order_details = order_details;

  if (
    !this.clientData ||
    !this.clientData.environment ||
    !this.clientData.key ||
    !order_details.productId ||
    !order_details.refId ||
    !order_details.animation
  ) {
    if (callback) {
      let url = `${PAGES.error}/Something went wrong!`;
      this.renderWithRetry({
        url,
        error: true
      });
      callback({ code: 400, message: 'Insuficiant data!' }, null);
    } else {
      throw new Error('callback function is required!');
    }
  } else {
    if (!callback) {
      throw new Error('callback function is required!');
    } else {
      let url = `${PAGES.main}`;
      // this.product_id = product_id;
      this.callback = callback;
      this.renderWithRetry({ url, error: false });
    }
  }
}
