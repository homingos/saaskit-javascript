import { PAGES } from './constants';

export default function receiveMessage(event) {
  if (event.origin == PAGES.main) {
    switch (event.data.type) {
      case 'CLOSE':
        this.close();
        break;
      case 'READY_TO_RECEIVE':
        this.sendMessage({
          type: 'INITIAL_DATA',
          payload: {
            client_data: this.clientData,
            order_details: this.order_details
          }
        });
        break;
      case 'READY_TO_RECEIVE_ERR':
        this.sendMessage({
          type: 'INITIAL_DATA_ERR',
          payload: {
            ...this.clientData,
            email:
              this.order_details &&
              this.order_details.prefill &&
              this.order_details.prefill.email
                ? this.order_details.prefill.email
                : '',
            phone:
              this.order_details &&
              this.order_details.prefill &&
              this.order_details.prefill.phone
                ? this.order_details.prefill.phone
                : ''
          }
        });
        break;
      case 'CREATED':
        this.callback(null, {
          code: 201,
          data: event.data.payload,
          message: 'Order placed successfully!'
        });
        this.close();
        break;
      case 'UPDATED':
        this.callback(null, {
          code: 201,
          data: event.data.payload,
          message: 'Order updated successfully!'
        });
        this.close();
        break;
      case 'ERROR':
        this.callback(
          {
            code: event.data.payload.code,
            message: event.data.payload.message
          },
          null
        );
        break;
    }
  }
}
