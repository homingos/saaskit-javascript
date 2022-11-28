function launchSDK() {
  SDKInstance = new FlamSaasSDK.init({
    environment: 'PRODUCTION',
    key: '123455'
  });

  let orderDetails = {
    first_name: 'Yuvraj',
    last_name: 'Singh'
  };

  SDKInstance.placeOrder(orderDetails, (err, res) => {
    if (err) {
      console.log('ERR from callback', err);
    } else {
      console.log('RES from callback', res);
    }
  });
}
