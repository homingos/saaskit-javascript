const buyBtn = document.querySelector('#placeorder');

buyBtn.addEventListener('click', () => {
  const flam = new flamSdk.init({
    name: 'John Doe Prints',
    logoUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Facebook_f_logo_%282019%29.svg/2048px-Facebook_f_logo_%282019%29.svg.png',
    email: 'support@email.com',
    phone: '+91 98765 43210',
    environment: 'sandbox',
    key: 'o78N5gJ639CcgCbc9zsj-00edz0'
  });

  let orderDetails = {
    refId: '04607c6a-9964-47de-a0c2-853b3f89bd76',
    // photo:
    //   'https://images.pexels.com/photos/2274725/pexels-photo-2274725.jpeg',
    //    video:
    // 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',

    animation: 'CONFETTI'
  };

  let productId = '04607c6a-9964-47de-a0c2-853b3f89bd67';

  flam.placeOrder({
    product_id: productId,
    order_details: orderDetails,
    callback: (err, res) => {
      if (err) {
        console.log('ERR at client side', err);
      } else {
        console.log('RES', res);
      }
    }
  });
});
