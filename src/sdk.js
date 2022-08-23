import closeModal from './closeModal';
import assert from './helper/assert';
import placeOrder from './placeOrder';
import receiveMessage from './receiveMessage';
import renderWithRetry from './renderWithRetry';
import sendMessage from './sendMessage';

function init(options) {
  /* eslint-disable */
  assert.check(
    options,
    { type: 'object', message: 'options parameter is not valid' },
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
        optional: true,
        type: 'string',
        environment: 'environment used is sandbox'
      }
    }
  );


  if (options.overrides) {
    assert.check(
      options.overrides,
      { type: 'object', message: 'overrides option is not valid' },
    );
  }

  this.baseOptions = options;

  let _this = this;

  this.renderWithRetry = renderWithRetry;

  this.placeOrder = placeOrder;

  this.receiveMessage = receiveMessage
  this.sendMessage = sendMessage

  this.closeModal = closeModal

  /* eslint-enable */
}

export default init;