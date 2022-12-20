function uuidv4() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  );
}

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

function debounce(func, wait, immediate) {
  var timeout;

  return function executedFunction() {
    var context = this;
    var args = arguments;

    var later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };

    var callNow = immediate && !timeout;

    clearTimeout(timeout);

    timeout = setTimeout(later, wait);

    if (callNow) func.apply(context, args);
  };
}

async function handleFileUpload(name, file) {
  try {
    const res = await apiCall(
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8',
          'x-api-key': '5dcac254-4b87-4ef7-96fe-b79cecdd54cf'
        },
        body: JSON.stringify({
          filename: file.name,
          content_type: file.type
        })
      },
      `https://dev.flamapp.com/zingcam/v1/signed-url`
    );
    console.log('RES', res.data, res.data.uploadUrl);

    const res2 = await apiCall(
      {
        method: 'PUT',
        headers: {
          'x-api-key': '5dcac254-4b87-4ef7-96fe-b79cecdd54cf'
        },
        body: file
      },
      res.data.uploadUrl
    );

    console.log('res2', res2);
    exampleState[name] = res.data.resourceUrl;
  } catch (err) {
    console.log('Err', err);
  }
}

async function getVariants(key) {
  try {
    const res = await apiCall(
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json;charset=utf-8',
          'x-api-key': key
        }
      },
      `https://dev.flamapp.com/zingcam/product/client/product-variant`
    );

    if (res.data && res.data.length > 0) {
      renderVariants(res.data.flat());
    } else {
      alert('No variants found for this key!');
    }
  } catch (err) {
    console.log('ERrr', err);
    alert('Failed to fetch variants!');
  }
}

function renderVariants(variantList) {
  console.log('variantList', variantList);
  const variantListWrapDiv = document.querySelector('#variant-list-wrap');

  variantListWrapDiv.innerHTML = '';

  const label = document.createElement('p');
  label.classList.add('font-medium', 'pl-1', 'mb-3');

  variantListWrapDiv.appendChild(label);

  const variantListDiv = document.createElement('div');

  variantListDiv.setAttribute('id', 'variant-list');

  variantListDiv.classList.add(
    'grid',
    'grid-cols-1',
    'sm:grid-cols-2',
    'md:grid-cols-3',
    'lg:grid-cols-4',
    'gap-4'
  );

  variantList.forEach(variant => {
    const variantId = variant._id;
    const productId = variant.product_service_id._id;

    const variantDiv = document.createElement('div');

    variantDiv.className =
      'variant border border-indigo-200 bg-indigo-100 rounded-lg px-4 py-3 cursor-pointer';

    variantDiv.addEventListener('click', () => {
      selectVariant(variantId, productId);
    });

    variantDiv.dataset.variant = variantId;

    variantDiv.innerHTML = `
      <div class="mb-2">
        <p>Variant ID</p>
        <p class="truncate">${variantId}</p>
      </div>
      <div>
        <p>Product ID</p>
        <p class="truncate">${productId}</p>
      </div>
    `;
    variantListDiv.appendChild(variantDiv);
  });

  variantListWrapDiv.appendChild(variantListDiv);

  selectVariant(variantList[0]._id, variantList[0].product_service_id._id);
}

function selectVariant(variantId, productId) {
  const variantDivs = document.querySelectorAll('.variant');
  exampleState.variantId = variantId;
  exampleState.productId = productId;

  variantDivs.forEach(element => {
    element.className = '';
    if (element.dataset.variant === variantId) {
      element.className =
        'variant border-2 border-indigo-300 bg-indigo-200 rounded-lg px-4 py-3 cursor-pointer';
    } else {
      element.className =
        'variant border border-indigo-200 bg-indigo-100 rounded-lg px-4 py-3 cursor-pointer';
    }
  });
}

// order state
const exampleState = {};

const sdk = new FlamSaasSDK.init({
  environment: 'PRODUCTION',
  key: '5dcac254-4b87-4ef7-96fe-b79cecdd54cf'
});

function launchSDK() {
  const data = {
    productId: 'a623e6a2-b366-4fb0-b193-ec1ad2d36b5d',
    varientId: 'a623e6a2-b366-4fb0-b193-ec1ad2d36b5d',
    refId: uuidv4(),
    photo: {
      changable: true,
      url: '',
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

async function handleInputChange(e) {
  console.log(e.target.name);
  switch (e.target.name) {
    case 'video-file':
    case 'photo-file':
      handleFileUpload(e.target.name, e.target.files[0]);
      break;
    case 'photo-change':
    case 'video-change':
    case 'photo-crop':
    case 'video-trim':
      exampleState[e.target.name] = e.target.checked;
      break;
    case 'sdk-color':
      console.log(e.target.value);
      exampleState.color = e.target.value;
      break;
    case 'sdk-key':
      exampleState.sdkKey = e.target.value;
      getVariants(e.target.value);
      break;
    default:
      console.log('Default case');
  }
}

document.addEventListener('input', debounce(handleInputChange, 250));

document.querySelector('#launch-btn').addEventListener('click', e => {
  if (!exampleState.sdkKey) {
    alert('Please enter a key');
  } else {
    const orderData = {
      productId: exampleState.productId,
      varientId: exampleState.variantId,
      refId: uuidv4(),
      photo: {
        changable: exampleState['photo-change'] || false,
        url: exampleState['photo-file'] || '',
        allowCrop: exampleState['photo-crop'] || false,
        maxSize: ''
      },
      video: {
        changable: exampleState['video-change'] || false,
        url: exampleState['video-file'] || '',
        allowTrim: exampleState['video-trim'] || false,
        maxSize: ''
      },
      prefill: {
        name: exampleState['prefill-name'] || '',
        email: exampleState['prefill-email'] || '',
        contact: exampleState['prefill-contact'] || ''
      },
      color: exampleState.color
    };

    console.log('orderData', orderData);

    launchSDK(orderData);
  }
});
