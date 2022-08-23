export default function closeModal() {
    const element = document.getElementById('flam-sdk-ui');
    element.remove();
    window.removeEventListener('message', this.receiveMessage);
};