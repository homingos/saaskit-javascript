export default function sendMessage(message) {
  this.iWindow.postMessage(message, '*');
}
