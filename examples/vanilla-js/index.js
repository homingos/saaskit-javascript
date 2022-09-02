let key = document.getElementById('sdkkey').value;

let resi;

let random = uuidv4();
document.getElementById('refi').value = random;

document.getElementById('sdkkey').addEventListener('change', e => {
  key = e.target.value;
});

document.getElementById('finalize').style.display = 'none';

function uuidv4() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  );
}

function handleRandom() {
  random = uuidv4();
  document.getElementById('refi').value = random;
}

async function handleFinalize() {
  try {
    if (!resi) {
      alert('Order not created. Please place an order');
      return;
    }
    const data = await ApiCall(
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8',
          'x-api-key': key
        },
        body: JSON.stringify({
          refId: resi
        })
      },
      `https://api.flamapp.com/saas/api/v1/orders/finalize`
    );
    alert('Order Finalized');
  } catch (err) {
    console.log(err);
  }
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
    if (!key) {
      alert('Please add a key');
      return;
    }
    document.getElementById('product_list').innerHTML = '';
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

    const x = data.data.filter(
      w => w.productMetaData.photo.isActive && w.productMetaData.video.isActive
    );

    x.forEach((item, index) => {
      const card = `<div class = 'col'>
      <div class="card" style="width: 18rem">
        <img
          style="height: 14rem; object-fit: cover"
          src="${item.productImage}"
          class="card-img-top"
          alt="product ${index}"
        />
        <div class="card-body">
          <h5 class="card-title">${item.productHeader}</h5>
          <p class="card-text">
            ${item.productSubHeader}
          </p>
          
          <button id="placeorder-${index}" onclick="buyCard('${item.productServiceId}')" class="placeorder btn btn-primary">
            Buy
          </button>
        </div>
      </div>
      </div>
    `;
      document.getElementById('product_list').innerHTML += card;
    });
  } catch (error) {
    if (error) console.log(error);
  }
}

function buyCard(id) {
  const flam = new FlamSaasSDK.init({
    environment: 'production',
    key: key
  });

  let orderDetails = {
    productId: id,
    refId: random,
    photo: 'https://images.pexels.com/photos/2274725/pexels-photo-2274725.jpeg',
    video: '',
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
      resi = res.data.refId;
      document.getElementById('finalize').style.display = 'block';
      alert('Card created successfully!');
      document.getElementById('refId').innerHTML = resi;
      console.log('RESSS', res);
    }
  });
}
