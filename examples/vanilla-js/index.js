const buyBtn = document.querySelector('#placeorder');

buyBtn.addEventListener('click', () => {

  const flam = new flamSdk.init({
    environment: "sandbox",
    key: "o78N5gJ639CcgCbc9zsj-00edz0",
  });

  let orderDetails = {
    "refId": "04607c6a-9964-47de-a0c2-853b3f89bd67",
    "photoUrl": "https://images.pexels.com/photos/2274725/pexels-photo-2274725.jpeg",
    "videoUrl": "https://images.pexels.com/videos/2274725/pexels-video-2274725.mp4",
    "photoCorousal": [
      "https://images.pexels.com/photos/2274725/pexels-photo-2274725.jpeg",
      "https://images.pexels.com/photos/2274725/pexels-photo-2274725.jpeg",
      "https://images.pexels.com/photos/2274725/pexels-photo-2274725.jpeg",
      "https://images.pexels.com/photos/2274725/pexels-photo-2274725.jpeg",
      "https://images.pexels.com/photos/2274725/pexels-photo-2274725.jpeg"
    ],
    "animation": "CONFETTI",
    "message": "Happy Birthday",
  };

  let productId = "04607c6a-9964-47de-a0c2-853b3f89bd67";

  flam.placeOrder({
    product_id: productId,
    order_details: orderDetails,
    callback: (err, res) => {
      if (err) {
        console.log("ERR at client side", err)
      } else {
        console.log("RES", res)
      }
    }
  });
});
