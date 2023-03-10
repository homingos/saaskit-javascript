import { warn } from '../helpers/warn';
import { placeOrder, updateOrder } from './placeOrder';

// BETA | STABLE
const RELEASE_TYPE = 'BETA';

const DEV_LINK = 'https://dev.sdk.zingcam.tech'; // 'https://dev.sdk.zingcam.tech';
const STAGE_LINK = 'https://stage.sdk.zingcam.tech';
const PROD_LINK = 'https://prod.sdk.zingcam.tech';

const links = {
  BETA: [DEV_LINK, STAGE_LINK],
  STABLE: [PROD_LINK, STAGE_LINK]
};

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

    const link =
      links[RELEASE_TYPE][options.environment === 'PRODUCTION' ? 0 : 1];

    localStorage.setItem('options', JSON.stringify(options));
    localStorage.setItem('__FLAM_SDK_LINK', link);
  } catch (err) {
    warn(err.message);
  }
}

init.prototype.placeOrder = placeOrder;
init.prototype.updateOrder = updateOrder;

export default init;
