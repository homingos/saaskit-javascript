import { handleListener } from '../helpers/messageHandlers';
import { renderIframe } from '../helpers/renderIframe';
import { warn } from '../helpers/warn';
import { placeOrder, updateOrder } from './placeOrder';

// import assert from '../helpers/assert';
function init(options) {
  try {
    if (!options || typeof options !== 'object') {
      throw new Error('Invalid paramerters passed');
    }

    if (!options.key || typeof options.key !== 'string') {
      throw new Error('KEY is required or missing !!');
    }

    if (!options.environment || typeof options.environment !== 'string') {
      throw new Error('ENVIRONMENT must be STAGE or PRODUCTION !!');
    }

    // const devLink = 'http://localhost:3000/';
    const devLink = 'https://dev.sdk.zingcam.tech/';

    const link =
      options.environment === 'PRODUCTION'
        ? devLink
        : 'https://stage.sdk.zingcam.tech';

    // const link = options.enviornment === 'PRODUCTION' ? 'https://prod.sdk.zingcam.tech' : 'https://stage.sdk.zingcam.tech';

    localStorage.setItem('options', JSON.stringify(options));
    window.addEventListener(
      'message',
      e => {
        handleListener(e.data, link);
      },
      false
    );
    renderIframe(link);
  } catch (err) {
    warn(err.message);
  }
}

init.prototype.placeOrder = placeOrder;
init.prototype.updateOrder = updateOrder;

export default init;
