import { PAGES } from './constants';

export default function receiveMessage(event) {
  console.log('EVENT', event);
  if (event.origin == PAGES.main) {
    switch (event.data.type) {
      case 'CLOSE':
        this.close();
        break;
      case 'READY_TO_RECEIVE':
        this.sendMessage(
          {
            type: 'INITIAL_DATA',
            payload: {
              client_data: this.clientData,
              order_details: this.order_details
            }
          },
          '*'
        );
        break;
      case 'READY_TO_RECEIVE_ERR':
        this.sendMessage(
          {
            type: 'INITIAL_DATA_ERR',
            payload: {
              email: this.order_details.prefill.name || '',
              phone: this.order_details.prefill.phone || ''
            }
          },
          '*'
        );
        break;
      case 'CREATED':
        this.callback(null, {
          code: 201,
          data: event.data.payload,
          message: 'Order placed successfully'
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
