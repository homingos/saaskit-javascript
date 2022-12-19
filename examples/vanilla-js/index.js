const sdk = new FlamSaasSDK.init({
  environment: 'PRODUCTION',
  key: '5dcac254-4b87-4ef7-96fe-b79cecdd54cf'
});

function launchSDK() {
  const data = {
    productId: 'a623e6a2-b366-4fb0-b193-ec1ad2d36b5d',
    variantId: 'a623e6a2-b366-4fb0-b193-ec1ad2d36b5d',
    refId: '1234podsadssssssssssuq',
    photo: {
      changable: true,
      url: 'https://plus.unsplash.com/premium_photo-1661962407604-711dda73e4d1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHwxOXx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=60',
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
    theme: {
      color: '#1EA18A'
    },
    handleSuccess: res => console.log(res),
    handleFailure: res => console.log(res)
  };
  sdk.placeOrder(data);
}
