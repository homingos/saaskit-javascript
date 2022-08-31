import { res } from './sdk';

export default function close() {
  window.removeEventListener('message', res);

  // remove the UI
  const element = document.getElementById('flam-sdk-wrapper');
  if (element) {
    element.remove();
  }

  // remove the styles
  const styleSheet = document.getElementById('saas-sdk-style');

  if (styleSheet) {
    styleSheet.remove();
  }
}
