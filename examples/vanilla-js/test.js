const dataSet = [
  {
    flamcard_id: 'ee4fcf4a-5305-4d27-acb3-bafa98fd693b',
    key: 'MIIJrTBXBgkqhkiG9w0BBQ0wSjApBgkq'
  },
  {
    flamcard_id: '7c99eb0b-0384-43cb-ac4f-c0e3b6764e49',
    key: 'NlkWXj_ehAH-KSxTJt9XMeExoiM'
  },
  {
    flamcard_id: '7c99eb0b-0384-43cb-ac4f-c0e3b6764e49',
    key: 'NlkWXj_ehAH-KSxTJt9XMeExoiM'
  },
  {
    flamcard_id: 'ee4fcf4a-5305-4d27-acb3-bafa98fd693b',
    key: 'MIIJrTBXBgkqhkiG9w0BBQ0wSjApBgkq'
  },
  {
    flamcard_id: 'ee4fcf4a-5305-4d27-acb3-bafa98fd693b',
    key: 'MIIJrTBXBgkqhkiG9w0BBQ0wSjApBgkq'
  }
];

// ee4fcf4a-5305-4d27-acb3-bafa98fd693b - MIIJrTBXBgkqhkiG9w0BBQ0wSjApBgkq
// 7c99eb0b-0384-43cb-ac4f-c0e3b6764e49 - NlkWXj_ehAH-KSxTJt9XMeExoiM

let currVal = 0;

document.getElementById('test-update').addEventListener('click', () => {
  console.log('test data', currVal, dataSet[currVal]);
  const sdkInstance = new FlamSaasSDK.init({
    environment: 'PRODUCTION',
    key: dataSet[currVal].key
  });

  const orderData = {
    color: '#5e0d2a',
    refId: dataSet[currVal].flamcard_id,
    handleSuccess: async data => {
      alert('Success');
    },
    handleFailure: async data => {
      alert('Failure');
    },
    handleClose: async () => {
      // alert('Close');
      currVal++;
    }
  };

  sdkInstance?.updateOrder(orderData);
});
