export default function sendMessage(message) {
  console.log('THIS', this);
  this.iWindow.postMessage(message, '*');
}
