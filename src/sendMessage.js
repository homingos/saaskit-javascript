export default function sendMessage(message) {
    console.log(message)
    _this.iWindow.postMessage(message, "*")
};