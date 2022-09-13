import { useEffect, useState } from 'react';

function useMessage(environment: 'SANDBOX' | 'PRODUCTION') {
  const [parentUrl, setParentUrl] = useState('');

  useEffect(() => {
    const url =
      window.location != window.parent.location
        ? document.referrer
        : document.location.href;
    if (!url && environment === 'SANDBOX') {
      setParentUrl('*');
    } else {
      setParentUrl(url);
    }
  }, [environment]);

  const receiveMessage = (
    event: ReceivedEventType,
    handleMessage: (event: ReceivedEventType) => void
  ) => {
    if (event.origin.concat('/') === parentUrl) {
      handleMessage(event);
    }
  };

  function sendMessage(message: { type: string; payload?: any }) {
    parent.postMessage({ ...message, parentUrl }, parentUrl);
  }

  return { sendMessage, receiveMessage, parentUrl };
}

export default useMessage;
