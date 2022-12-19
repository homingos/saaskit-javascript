import { handleSend } from '../helper/messageHandlers';

/**
 * Makes a call to the `placeOrder` to launch a UI for placing the orders.
 *
 * @method placeOrder
 * @param {Object} data
 * @param {String} data.productId Product ID of the product (required]
 * @param {String} data.variantId Variant ID of the product (required)
 * @param {String} data.refId Random generated Ref ID, must be unique. (required)
 * @param {Object} [data.photo] 
 * @param {string} [data.photo.changeable] If set to true, Client can re-upload the picture even if one passes the url.
 * @param {string} [data.photo.url] Photo URL sent by the Client.
 * @param {string} [data.photo.allowCrop] If set to true, Allows the Client to allow Cropping the video.
 * @param {string} [data.photo.maxSize] Max Size limit that a user can set for Uploading.
 * @param {Object} [data.video]
 * @param {string} [data.video.changeable] If set to true, Client can re-upload the picture even if one passes the url.
 * @param {string} [data.video.url] Video URL sent by the Client.
 * @param {string} [data.video.allowTrim] If set to true, Allows the Client to allow triming the video.
 * @param {string} [data.video.maxSize] Max Size limit that a user can set for Uploading.
 * @param {Object} [data.prefill]
 * @param {string} [data.prefill.name] SDK config for Name of the Client
 * @param {string} [data.prefill.email] SDK config for Email of the Client
 * @param {string} [data.prefill.contact] SDK config for Contact Number of the Client
 * @param {Object} [data.theme]
 * @param {string} [data.theme.color] hex color for themeing the UI
 * @param {callback} [handleSuccess]
 * @param {callback} [handleFailure]
 * @memberof init.prototype
 */

function placeOrder(data) {
  try {
    if ((!data.productId, !data.refId)) {
      throw 'ProductID and RefId are required';
    }
    const iframe = document.getElementById('flam-sdk-iframe');
    iframe.style.display = 'block';
    handleSend({ type: 'CLIENT_DATA', message: JSON.stringify(data) });
  } catch (err) {
    console.log(err);
  }
}

export { placeOrder };