const buyBtn = document.querySelector('#placeorder');

buyBtn.addEventListener('click', () => {

  console.log(FlamSDK)

  const flam = new FlamSDK();

  flam.placeOrder('abc');
});
