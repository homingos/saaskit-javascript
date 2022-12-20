const sdk = new FlamSaasSDK.init({
  environment: 'PRODUCTION',
  key: '5dcac254-4b87-4ef7-96fe-b79cecdd54cf'
});

function uuidv4() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  );
}

function launchSDK() {
  const data = {
    productId: 'a623e6a2-b366-4fb0-b193-ec1ad2d36b5d',
    varientId: 'a623e6a2-b366-4fb0-b193-ec1ad2d36b5d',
    refId: uuidv4(),
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
    color: '#1EA18A',
    handleSuccess: data => console.log(data),
    handleFailure: data => console.log(data)
  };
  sdk.placeOrder(data);
}
