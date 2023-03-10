const unmountSDK = () => {
  const iframeWrapper = document.getElementById('flam-sdk-wrapper');
  iframeWrapper.remove();

  const styleSheet = document.getElementById('saas-sdk-style');
  styleSheet.remove();

  window.__SDK_READY = false;
  window.removeEventListener('message', window.__FlamSDKListener);
};

function handleListener(data, link) {
  switch (data.type) {
    case 'READY': {
      window.__SDK_READY = true;
      console.log('READY_READY test');
      handleSend({
        type: 'INITIAL_DATA',
        message: localStorage.getItem('options')
      });
      break;
    }
    case 'CLOSE': {
      unmountSDK();
      break;
    }
    case 'DIRECT_CLOSE': {
      unmountSDK();
      window.handleClose();
      break;
    }
    case 'SUCCESS': {
      unmountSDK();
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
  iframe.contentWindow.postMessage(message, '*');
};

export { handleListener, handleSend };
