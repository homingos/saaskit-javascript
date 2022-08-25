import { PAGES } from './constants';

export default function placeOrder({ product_id, order_details, callback }) {
  if (
    !this.clientData ||
    !this.clientData.environment ||
    !this.clientData.key ||
    !product_id
  ) {
    if (callback) {
      let url = `${PAGES.error}/Something went wrong!`;
      this.renderWithRetry({
        url,
        error: true
      });
      callback({ message: 'Insuficiant data!' }, null);
    } else {
      throw new Error('callback function is required!');
    }
  } else {
    if (!callback) {
      throw new Error('callback function is required!');
    } else {
      let url = `${PAGES.main}`;

      this.product_id = product_id;
      this.order_details = order_details;

      this.callback = callback;

      this.renderWithRetry({ url, error: false });
    }
  }
}
