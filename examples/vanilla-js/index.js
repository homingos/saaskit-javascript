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
    const res = await fetch(url, settings);
    if (res) {
      const data = await res.json();
      return data;
    } else {
      return null;
    }
  } catch (error) {
    console.log('Err', error);
    return { error };
  }
}

document.getElementById('launch-btn').style.display = 'none';

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
    if (!file) {
      exampleState[name] = '';
      return;
    }

    setLoading(name, true);

    // start loading and disable input here
    // handle no file input, empty the url
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

    // stop loading and enable input here
    exampleState[name] = res.data.resourceUrl;

    setLoading(name, false);
  } catch (err) {
    // stop loading, show alert and empty the url
    console.log('Err', err);
  }
}

function setLoading(name, value) {
  document.querySelector(`#${name}`).disabled = value;
  const launchBtn = document.querySelector(`#launch-btn`);
  if (launchBtn) {
    launchBtn.disabled = value;
  }

  document.querySelector(`#${name}-loading`).classList.toggle('hidden');
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
      sdkInstance = new FlamSaasSDK.init({
        environment: 'PRODUCTION',
        key
      });

      setTimeout(() => {
        document.getElementById('launch-btn').style.display = 'block';
      }, 1000);

      renderVariants(res.data.flat());

      const launchBtn = document.querySelector(`#launch-btn`);
      if (launchBtn) {
        launchBtn.disabled = false;
      }
    } else {
      if (key !== '') {
        const launchBtn = document.querySelector(`#launch-btn`);
        if (launchBtn) {
          launchBtn.disabled = true;
        }
        alert('No variants found for this key!');
      }
    }
  } catch (err) {
    console.log('ERrr', err);
    const launchBtn = document.querySelector(`#launch-btn`);
    if (launchBtn) {
      launchBtn.disabled = true;
    }
    alert('Failed to fetch variants!');
  }
}

function renderVariants(variantList) {
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
const exampleState = {
  color: '#000000'
};

let loadingState = {
  'photo-file': false,
  'video-file': false,
  sdkInit: false,
  finalize: false
};

let sdkInstance;

let sdkRes;

let finalizeRes = {};

async function handleInputChange(e) {
  switch (e.target.name) {
    case 'video-file':
    case 'photo-file':
      handleFileUpload(e.target.name, e.target.files[0]);
      break;
    case 'sdk-color':
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

const params = new Proxy(new URLSearchParams(window.location.search), {
  get: (searchParams, prop) => searchParams.get(prop),
});

if(params.key) {
  exampleState.sdkKey = params.key;
  getVariants(params.key);
}

async function showFinalize() {
  const finalizeDivWrap = document.querySelector('#finalize');
  finalizeDivWrap.innerHTML = '';

  finalizeDivWrap.innerHTML = `
      <div
      class="border-t border-indigo-300 h-full bg-indigo-50 text-indigo-900 px-3 py-5"
    >
      <div class="mb-2">
        <p>Ref ID</p>
        <p class="truncate">${sdkRes.ref_id}</p>
      </div>
      <div class="mb-2">
        <p>Order ID</p>
        <p class="truncate">${sdkRes.order_id}</p>
      </div>
      <div class="my-2">
        <p>Print Url (click below link to copy)</p>
        <p class="truncate" id="print_url">finalize to see this.</p>
      </div>
      <button
        class="self-start bg-indigo-500 text-white px-4 py-1 rounded-md text-lg"
        id="finalize-btn"
        onclick="finalizeOrder()"
      >
        Finalize Order
      </button>
      
    </div>
  `;

  const printUrlEle = document.getElementById('print_url');

  printUrlEle.addEventListener('click', async () => {
    console.log(finalizeRes, finalizeRes.data.print_url);
    if (finalizeRes && finalizeRes.data.print_url) {
      await navigator.clipboard.writeText(finalizeRes.data.print_url);
      alert('copied to clipboard');
    }
  });

  // printUrlEle.textContent = finalizeRes.print_url;
}

async function finalizeOrder() {
  console.log('finalize order');
  console.log('sdkRes', sdkRes);
  try {
    const launchBtn = document.querySelector('#finalize-btn');
    launchBtn.innerHTML = 'loading';
    launchBtn.setAttribute('disabled', true);

    const res = await apiCall(
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8',
          'x-api-key': exampleState.sdkKey
        },
        body: JSON.stringify({
          photo_url: exampleState.photo_file,
          ref_id: sdkRes.ref_id,
          meta_data: {
            inner_height: 0,
            inner_width: 0,
            outer_height: 0,
            outer_width: 0,
            color_code: sdkRes.border_color || '000000',
            image_dpi: 0
          }
        })
      },
      `https://dev.flamapp.com/zingcam/order/finalize`
    );

    console.log('RES', res);
    alert('Order finalized!');

    finalizeRes = res;

    document.getElementById('print_url').textContent =
      finalizeRes.data.print_url;

    launchBtn.innerHTML = 'Finalized';
  } catch (err) {
    console.log('ERrr', err);
    alert('Failed to finalize order!');
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
      // varientId: '',
      // productId: 'fcb50d3c-887f-4dce-8c83-56a563750ba7',
      // varientId: 'd9396959-ae53-426f-ba9e-30da2ba92e62',
      refId: uuidv4(),
      photo: {
        url: exampleState['photo-file'] || ''
      },
      video: {
        url: exampleState['video-file'] || '',
        default: 'https://flam-videoshop-assets.s3.ap-south-1.amazonaws.com/flam/app/videos/1_LT_Flam.mp4'
      },
      prefill: {
        name: exampleState['prefill-name'] || '',
        email: exampleState['prefill-email'] || '',
        contact: exampleState['prefill-contact'] || ''
      },
      color: exampleState.color || '',
      handleSuccess: data => {
        sdkRes = data;
        console.log('sdkRes', sdkRes);
        showFinalize();
      },
      handleFailure: data => {
        console.log(data);
      }
    };

    console.log('orderData', orderData);

    sdkInstance.placeOrder(orderData);
  }
});
