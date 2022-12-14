import './App.css';

import FlamSaasSDK from 'flamsdk';

const flam = new FlamSaasSDK.init({
  environment: 'sandbox',
  key: '9kA8jejg8CtvAFDW-p2csG4WJWw'
});

let orderDetails = {
  productId: '96f0d15e-63cd-485b-8f37-bb474d287129',
  refId: '04607c6a-9964-47de-a0c2-853b3f89bd87',
  photo: 'https://images.pexels.com/photos/2274725/pexels-photo-2274725.jpeg',
  video:
    'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  animation: 'CONFETTI',
  prefill: {
    name: 'John Doe Prints',
    email: 'support@email.com',
    phone: '+91 98765 43210'
  },
  logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Facebook_f_logo_%282019%29.svg/2048px-Facebook_f_logo_%282019%29.svg.png'
};

const handleBuy = () => {
  flam.placeOrder(orderDetails, (err, res) => {
    if (err) {
      console.log('ERR at client side', err);
    } else {
      console.log('RESSS', res);
    }
  });
};

function App() {
  return (
    <div className="App">
      <button onClick={handleBuy}>Buy</button>
    </div>
  );
}

export default App;
