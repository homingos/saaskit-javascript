let key = document.getElementById('sdkkey').value;

document.getElementById('sdkkey').addEventListener('change', e => {
  key = e.target.value;
});

function uuidv4() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  );
}

async function ApiCall(settings, url) {
  try {
    const data = await fetch(url, settings)
      .then(res => res.json())
      .then(data => data);
    return data;
  } catch (error) {
    console.log(error);
  }
}

async function getProducts() {
  try {
    const data = await ApiCall(
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json;charset=utf-8',
          'x-api-key': key
        }
      },
      `https://api.flamapp.com/saas/api/v1/products`
    );
    console.log(data);
  } catch (error) {
    if (error) console.log(err);
  }
}

document.getElementById(`placeorder-1`).addEventListener('click', () => {
  console.log('KEY', key);
  const flam = new FlamSaasSDK.init({
    environment: 'SANDBOX',
    key: key
  });

  // '96f0d15e-63cd-485b-8f37-bb474d287129'

  let orderDetails = {
    productId: document.getElementById('product_id').value,
    refId: uuidv4(),
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

  flam.placeOrder(orderDetails, (err, res) => {
    if (err) {
      console.log('ERR at client side', err);
    } else {
      console.log('RESSS', res);
    }
  });
});

document.getElementById(`placeorder-2`).addEventListener('click', () => {
  const flam = new FlamSaasSDK.init({
    environment: 'SANDBOX',
    key: key
  });

  let orderDetails = {
    productId: document.getElementById('product_id').value,
    refId: uuidv4(),
    animation: 'CONFETTI',
    prefill: {
      name: 'John Doe Prints',
      email: 'support@email.com',
      phone: '+91 98765 43210'
    },
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Facebook_f_logo_%282019%29.svg/2048px-Facebook_f_logo_%282019%29.svg.png',
    theme: {
      color: '#32a852'
    }
  };

  flam.placeOrder(orderDetails, (err, res) => {
    if (err) {
      console.log('ERR at client side', err);
    } else {
      console.log('RESSS', res);
    }
  });
});
