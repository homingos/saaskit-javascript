function handleListener(data, link) {
  switch (data.type) {
    case 'READY': {
      handleSend({
        type: 'INITIAL_DATA',
        message: localStorage.getItem('options')
      });
      window.__SDK_READY = true;
      break;
    }
    case 'CLOSE': {
      const iframe = document.getElementById('flam-sdk-iframe');
      iframe.style.display = 'none';
      break;
    }
    case 'DIRECT_CLOSE': {
      const iframe = document.getElementById('flam-sdk-iframe');
      iframe.style.display = 'none';
      window.handleClose();
      break;
    }
    case 'SUCCESS': {
      window.handleSuccess(data.message);
      break;
    }
    case 'FAIL': {
      window.handleFailure(data.message);
      break;
    }
    default:
      console.log(data);
  }
}

const handleSend = message => {
  const iframe = document.getElementById('flam-sdk-iframe');
<<<<<<< Updated upstream
  iframe.contentWindow.postMessage(message, 'https://dev.sdk.zingcam.tech');
=======
  iframe.contentWindow.postMessage(message, '*');
>>>>>>> Stashed changes
};

export { handleListener, handleSend };
