const sdk = new FlamSaasSDK.init({
  environment: 'PRODUCTION',
  key: '123455'
});

function launchSDK() {
  const data = {
    productId: '12345',
    varientId: '',
    refId: '12345',
    photo: {
      changable: true,
      url: '',
      allowCrop: true,
      maxSize: ''
    },
    video: {
      changable: true,
      url: '',
      allowTrim: true,
      maxSize: ''
    },
    prefill: {
      name: '',
      email: '',
      contact: ''
    },
    color: ''
  };
  sdk.placeOrder(data);
}
