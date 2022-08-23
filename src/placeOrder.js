import { PAGES } from './constants';

export default function placeOrder({ product_id, order_details, callback }) {
  if (
    !this.clientData ||
    !this.clientData.environment ||
    !this.clientData.key
  ) {
    let url = `${PAGES.error}/Something went wrong!`;
    this.renderWithRetry({
      url,
      order_details,
      callback
    });
    callback({ message: 'Error Occured!' }, null);
  } else {
    let url = `${PAGES.main}/?product_id=${product_id}`;
    this.renderWithRetry(url);
  }
}
