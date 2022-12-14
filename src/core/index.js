import { handleListener } from '../helpers/messageHandlers';
import { renderIframe } from '../helpers/renderIframe';
import { placeOrder } from './placeOrder';

function init(options) {
  try {
    if (!options.key) {
      throw 'Please add your key!';
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
    console.log(err);
  }

  // return placeOrder;
}

init.prototype.placeOrder = placeOrder;

export default init;
