function handleListener(data) {
  switch (data.type) {
    case 'READY':
      handleSend({
        type: 'INITIAL_DATA',
        message: localStorage.getItem('options')
      });
      window.__SDK_READY = true;
      break;
    case 'CLOSE':
      {
        const iframe = document.getElementById('flam-sdk-iframe');
        iframe.style.display = 'none';
      }
      break;
    case 'SUCCESS':
      window.handleSuccess(data.message);
      break;
    case 'FAIL':
      window.handleFailure(data.message);
      break;
    default:
      console.log(data);
  }
}

const handleSend = message => {
  const iframe = document.getElementById('flam-sdk-iframe');
  iframe.contentWindow.postMessage(message, 'https://prod.sdk.zingcam.tech');
};

export { handleListener, handleSend };
