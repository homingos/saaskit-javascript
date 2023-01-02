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

// document.getElementById('launch-btn').style.display = 'none';

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
    // exampleState[name] = res.data.resourceUrl;

    console.log({ btn: document.querySelector('.zingcam-sdk-btn').dataset });

    document.querySelector('.zingcam-sdk-btn').dataset[name] =
      res.data.resourceUrl;

    // console.log({ name });

    setLoading(name, false);
  } catch (err) {
    // stop loading, show alert and empty the url
    console.log('Err', err);
  }
}

function setLoading(name, value) {
  document.querySelector(`#${name}`).disabled = value;
  const launchBtn = document.querySelector(`.zingcam-sdk-btn`);
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
      renderVariants(res.data.flat());
    } else {
      alert('Failed to fetch variants!');
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

    const variantDivWrapper = document.createElement('div');
    variantDivWrapper.className = 'variant-wrap flex flex-col gap-2';

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

    variantDivWrapper.appendChild(variantDiv);

    const button = document.createElement('button');
    button.className =
      'zingcam-sdk-btn self-start bg-indigo-500 text-white px-4 py-1 rounded-md text-lg disabled:grayscale disabled:cursor-not-allowed';
    button.textContent = 'Launch SDK';
    button.disabled = true;

    button.dataset.productId = variant.product_service_id._id;
    button.dataset.variantId = variant._id;
    button.dataset.refId = '';

    button.dataset.photoChange = true;
    button.dataset.photoCrop = true;
    button.dataset.photoFile = '';

    button.dataset.videoChange = true;
    button.dataset.videoAdjust = true;
    button.dataset.videoTrim = true;
    button.dataset.videoFile = '';

    button.dataset.color = '#000000';

    variantDivWrapper.appendChild(button);

    variantListDiv.appendChild(variantDivWrapper);
  });

  variantListWrapDiv.appendChild(variantListDiv);

  // selectVariant(variantList[0]._id, variantList[0].product_service_id._id);
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
// const exampleState = {
//   'photo-change': true,
//   'video-change': true,
//   'photo-crop': true,
//   'video-trim': true,
//   'video-adjust': true,
//   color: '#000000'
// };

let loadingState = {
  'photo-file': false,
  'video-file': false,
  sdkInit: false,
  finalize: false
};

let sdkRes;

async function handleInputChange(e) {
  switch (e.target.name) {
    case 'videoFile':
    case 'photoFile':
      console.log('file', e.target.name);
      handleFileUpload(e.target.name, e.target.files[0]);
      break;
    case 'photoChange':
    case 'videoChange':
    case 'photoCrop':
    case 'videoTrim':
    case 'videoAdjust':
      document.querySelector('.zingcam-sdk-btn').dataset[e.target.name] =
        e.target.checked;
      break;
    case 'sdk-color':
      document.querySelector('.zingcam-sdk-btn').dataset.color = e.target.value;
      break;
    default:
      console.log('Default case');
  }
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
      <button
        class="self-start bg-indigo-500 text-white px-4 py-1 rounded-md text-lg"
        id="finalize-btn"
        onclick="finalizeOrder()"
      >
        Finalize Order
      </button>
    </div>
  `;
}

async function finalizeOrder() {
  console.log('finalize order');
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
            color_code: 'red',
            image_dpi: 0
          }
        })
      },
      `https://dev.flamapp.com/zingcam/order/finalize`
    );

    console.log('RES', res);
    alert('Order finalized!');

    launchBtn.innerHTML = 'Finalized';
  } catch (err) {
    console.log('ERrr', err);
    alert('Failed to finalize order!');
  }
}

document.addEventListener('input', debounce(handleInputChange, 250));

getVariants('5dcac254-4b87-4ef7-96fe-b79cecdd54cf');
