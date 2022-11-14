// const sample = {
//   productId: productId,
//   variantId: variantId,
//   refId: random,
//   photo: 'https://images.pexels.com/photos/2274725/pexels-photo-2274725.jpeg',
//   video: '',
//   animation: 'airplane',
//   photo: 'https://images.pexels.com/photos/2274725/pexels-photo-2274725.jpeg',
//   video:'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
//   allowVideoLater: true,
//   theme: {
//     color: '#234f55'
//   },
//   prefill: {
//     hide: false,
//     name: 'John Doe Prints',
//     email: 'support@email.com',
//     phone: '+91 98765 43210'
//   },
//   logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Facebook_f_logo_%282019%29.svg/2048px-Facebook_f_logo_%282019%29.svg.png'
// };

let key = '';
let selectedVariant = {
  variantId: '',
  photoUrl: ''
};
const environment = 'PRODUCTION';

let SDKInstance;
let SDKRes;

const variantList = {
  EiXPI1y2fEv_6q6JOf3GNnMPNE4: [
    {
      variantId: 'eccecce3-ccbf-4863-8968-cf1d71d20b96',
      photoUrl:
        'https://i.ibb.co/4MMkMhT/eccecce3-ccbf-4863-8968-cf1d71d20b96.png'
    },
    {
      variantId: '04ba9f6b-2d86-4d0a-b876-9cba99c12184',
      photoUrl:
        'https://i.ibb.co/94YZS8P/04ba9f6b-2d86-4d0a-b876-9cba99c12184.png'
    },
    {
      variantId: 'd1ca9d88-6d4e-473e-b327-12ef9b8d289c',
      photoUrl:
        'https://i.ibb.co/M6jbsHJ/d1ca9d88-6d4e-473e-b327-12ef9b8d289c.png'
    },
    {
      variantId: '0e7d9878-063f-440a-9378-b6db9d1b8385',
      photoUrl:
        'https://i.ibb.co/D59xgBx/0e7d9878-063f-440a-9378-b6db9d1b8385.png'
    },
    {
      variantId: 'd9396959-ae53-426f-ba9e-30da2ba92e62',
      photoUrl:
        'https://i.ibb.co/cQXBYsR/d9396959-ae53-426f-ba9e-30da2ba92e62.png'
    },
    {
      variantId: 'f5566341-02e0-4989-a0e0-95d7448c6491',
      photoUrl:
        'https://i.ibb.co/gwVKbXJ/f5566341-02e0-4989-a0e0-95d7448c6491.png'
    }
  ]
};

const renderVariants = sdkKey => {
  key = sdkKey;
  const variantListDiv = document.querySelector('#variant-list-div');
  const data = variantList[sdkKey];
  variantListDiv.innerHTML = '';

  if (data) {
    variantListDiv.innerHTML +=
      '<p class="mb-2">Variants</p><div id="variant-list" class="flex gap-4 flex-wrap"></div>';

    data.map(item => {
      const variantCard = `
        <div id="variant-${item.variantId}" class="variant-card w-60 h-auto bg-gray-200 border border-gray-300 flex flex-col gap-4 justify-between p-2 cursor-pointer " onclick="selectVariant('${item.variantId}')">
          <img class="w-60 h-auto" src="${item.photoUrl}" alt="${item.variantId}" />
          <p class="mb-1">${item.variantId}</p>
        </div>
      `;

      document.querySelector('#variant-list').innerHTML += variantCard;
    });
  } else {
    alert('Please enter valid key!');
  }
};

const selectVariant = variantId => {
  const productsListDiv = document.querySelector('#products-list-div');
  productsListDiv.innerHTML = '';
  const data = variantList[key];
  data.map(item => {
    const div = document.querySelector(`#variant-${item.variantId}`);
    if (item.variantId === variantId) {
      selectedVariant = item;
      div.classList.remove('bg-gray-200');
      div.classList.add('bg-gray-400');
    } else {
      div.classList.add('bg-gray-200');
      div.classList.remove('bg-gray-400');
    }
  });
  document.querySelector('#get-products-btn').classList.remove('hidden');
};

async function apiCall(settings, url) {
  try {
    const data = await fetch(url, settings)
      .then(res => res.json())
      .then(data => data);
    return data;
  } catch (error) {
    console.log(error);
  }
}

const buyProduct = productId => {
  console.log('Buyyy');
  SDKInstance = new FlamSaasSDK.init({
    environment: environment === 'PRODUCTION' ? 'PRODUCTION' : 'SANDBOX',
    key
  });

  let orderDetails = {
    productId: productId,
    refId: uuidv4(),
    variantId: selectedVariant.variantId,
    prefill: {
      hide: true
    },
    photo: selectedVariant.photoUrl,
    allowVideoLater: false,
    theme: {
      primaryColor: '#c77f4f',
      secondaryColor: '#faf9f8',
      headerText: 'Upload the video below and check preview'
    }
  };

  SDKInstance.placeOrder(orderDetails, (err, res) => {
    if (err) {
      console.log('ERR at client side', err);
    } else {
      SDKRes = res.data;
      SDKRes.variantId = orderDetails.variantId;
      SDKRes.productId = orderDetails.productId;
      document.querySelector('#other-actions').classList.remove('hidden');
      alert('Card created successfully!');
      document.getElementById('ref-id').innerHTML = SDKRes.refId;
      document.getElementById('order-id').innerHTML = SDKRes.orderId;
      console.log('RESSS', SDKRes);
    }
  });
};

const renderProducts = productList => {
  const productsListDiv = document.querySelector('#products-list-div');
  productsListDiv.innerHTML = '';

  if (productList.length > 0) {
    productsListDiv.innerHTML +=
      '<p class="mb-2">Products</p><div id="products-list" class="flex gap-4 flex-wrap"></div>';

    productList.map(item => {
      const productCard = `
        <div id="product-${item.productServiceId}" class="product-card w-60 h-auto bg-gray-200 border border-gray-300 flex flex-col gap-4 justify-between p-2 cursor-pointer ">
          <img class="w-60 h-auto" src="${item.productImage}" alt="${item.productServiceId}" />
         <div class="flex flex-col gap-1">
          <p class="mb-1">${item.productHeader}</p>
          <p class="mb-1">${item.productServiceId}</p>
          <button onclick="buyProduct('${item.productServiceId}')" class="w-fit px-2 py-1 bg-black text-white">Buy Product</button>
         </div>
        </div>
      `;

      document.querySelector('#products-list').innerHTML += productCard;
    });
  } else {
    alert('No products found!');
  }
};

async function getProducts() {
  try {
    if (!key) {
      alert('Please add a key');
      return;
    }
    const data = await apiCall(
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json;charset=utf-8',
          'x-api-key': key
        }
      },
      environment === 'PRODUCTION'
        ? `https://api.flamapp.com/saas/api/v2/products`
        : `https://dev.flamapp.com/saas/api/v2/products`
    );

    const products = data.data.filter(
      product =>
        product.productMetaData.photo.isActive &&
        product.productMetaData.video.isActive
    );

    renderProducts(products);
  } catch (error) {
    if (error) console.log(error);
  }
}

function uuidv4() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  );
}

document
  .querySelector('#sdk-key')
  .addEventListener('change', e => renderVariants(e.target.value));

async function finalizeOrder() {
  try {
    console.log('finalizeOrder');
    if (!SDKRes) {
      alert('Order not created. Please place an order');
      return;
    }
    console.log('SDK', SDKRes);
    const data = await apiCall(
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8',
          'x-api-key': key
        },
        body: JSON.stringify({
          refId: SDKRes.refId,
          photoUrl: SDKRes.photoUrl,
          meta_data: {
            inner_height: 1800,
            inner_width: 1200,
            outer_height: 2175,
            outer_width: 1575,
            color_code: '',
            image_dpi: 300
          }
        })
      },
      `https://api.flamapp.com/saas/api/v1/orders/finalize`
      // `https://dev.flamapp.com/saas/api/v1/orders/finalize`
    );
    alert('Order Finalized');
  } catch (err) {
    console.log(err);
  }
}

function updateOrder() {
  if (!SDKRes) {
    alert('Order not created. Please place an order');
    return;
  }

  let orderDetails = {
    productId: SDKRes.productId,
    refId: SDKRes.refId,
    variantId: SDKRes.variantId,
    orderId: SDKRes.orderId,
    photo: selectedVariant.photoUrl,
    theme: {
      primaryColor: '#c77f4f',
      secondaryColor: '#faf9f8',
      headerText: 'Upload the video below and check preview'
    },
    prefill: {
      hide: true
    },
    allowVideoLater: false
  };

  SDKInstance.placeOrder(orderDetails, (err, res) => {
    if (err) {
      console.log('ERR at client side', err);
    } else {
      console.log('RESSS', SDKRes);
      alert('Card updated successfully');
    }
  });
}
