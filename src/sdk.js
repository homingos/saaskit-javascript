import closeModal from './closeModal';
import assert from './helper/assert';
import placeOrder from './placeOrder';
import receiveMessage from './receiveMessage';
import renderWithRetry from './renderWithRetry';
import sendMessage from './sendMessage';

import { PAGES } from "./constants";

function init(clientData) {
  /* eslint-disable */
  try {
    assert.check(
      clientData,
      { type: 'object', message: 'clientData parameter is not valid' },
      // {
      //   domain: { type: 'string', message: 'domain option is required' },
      //   clientID: { type: 'string', message: 'clientID option is required' },
      //   responseType: {
      //     optional: true,
      //     type: 'string',
      //     message: 'responseType is not valid'
      //   },
      // }
      {
        key: { type: 'string', message: 'key is required' },
        environment: {
          type: 'string',
          message: 'environment is required'
        }
      }
    );

    if (clientData.overrides) {
      assert.check(
        clientData.overrides,
        { type: 'object', message: 'overrides clientData is not valid' },
      );
    }
  } catch (err) {
    throw new Error(err.message)
  }

  this.clientData = clientData;

  // core methods
  this.renderWithRetry = renderWithRetry;
  this.placeOrder = placeOrder;
  this.receiveMessage = receiveMessage;
  this.sendMessage = sendMessage;
  this.closeModal = closeModal

  /* eslint-enable */
}

export default init;