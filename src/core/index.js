import { handleListener } from '../helpers/messageHandlers';
import { renderIframe } from '../helpers/renderIframe';
import { assignHandler } from './assignHandler';
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

function alphaNumericUUID() {
  let mask = '';
  const chars = '#A';
  if (chars.indexOf('A') > -1) mask += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (chars.indexOf('#') > -1) mask += '0123456789';
  let result = 'FLM';
  for (let i = 5; i > 0; --i)
    result += mask[Math.round(Math.random() * (mask.length - 1))];
  return result;
}

function loadButtons() {
  const buttons = document.querySelectorAll('.zingcam-sdk-btn');

  buttons.forEach(button => {
    button.addEventListener('click', event => {
      // Your event handler code goes here
      console.log({ dataset: button.dataset });

      const orderData = {
        productId: button.dataset.productId,
        varientId: button.dataset.variantId,
        refId: button.dataset.refId || alphaNumericUUID(),
        photo: {
          changable: button.dataset.photoChange === 'true' || false,
          url: button.dataset.photoFile || '',
          allowCrop: button.dataset.photoCrop === 'true' || false,
          maxSize: ''
        },
        video: {
          changable: button.dataset.videoChange === 'true' || false,
          url: button.dataset.videoFile || '',
          allowTrim: button.dataset.videoTrim === 'true' || false,
          allowPosAdjust: button.dataset.videoAdjust === 'true' || false,
          maxSize: ''
        },
        prefill: {
          name: '',
          email: '',
          contact: ''
        },
        color: button.dataset.color,
        handleSuccess: window.handleSuccess,
        handleFailure: window.handleFailure
      };

      console.log({ orderData });

      placeOrder(orderData);
    });
  });
}

init.prototype.placeOrder = placeOrder;
init.prototype.assignHandler = assignHandler;
init.prototype.loadButtons = loadButtons;

export default init;

// videoAdjust
// :
// "true"
// videoChange
// :
// "true"
// videoFile
// :
// "true"
// videoTrim
// :
// "true"
