import { handleListener } from '../helpers/messageHandlers';
import { renderIframe } from '../helpers/renderIframe';
import { warn } from '../helpers/warn';
import { placeOrder } from './placeOrder';

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

    localStorage.setItem('options', JSON.stringify(options));
    window.addEventListener(
      'message',
      e => {
        handleListener(e.data);
      },
      false
    );
    renderIframe();
  } catch (err) {
    warn(err.message);
  }
}

init.prototype.placeOrder = placeOrder;

export default init;
