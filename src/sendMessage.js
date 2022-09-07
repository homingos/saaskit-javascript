import { PAGES } from './constants';

export default function sendMessage(message) {
  this.iWindow.postMessage(message, PAGES.main);
}
