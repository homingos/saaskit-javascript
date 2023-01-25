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
      console.log('Hello');
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
      refId: uuidv4(),
      photo: {
        url: exampleState['photo-file'] || ''
      },
      video: {
        url: exampleState['video-file'] || ''
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

const themes = [
  {
    _id: '444f4808-4a86-4fb3-924d-7fd17cd7de38',
    name: 'christmas',
    theme_meta_data: {
      image_url:
        'https://flam-videoshop-assets.s3.ap-south-1.amazonaws.com/flam/web/icons/christmas.png',
      web_preview_data: {
        pos: [0, 0],
        ratio: [1, 1],
        asset_url:
          'https://atul-test-m.s3.ap-south-1.amazonaws.com/AssetBundles/christmas.assetbundle',
        asset_id: 'christmas'
      }
    },
    created_at: '2022-10-19T11:34:54.742Z',
    updated_at: '2022-11-08T15:31:11.960Z',
    display_name: 'christmas'
  },
  {
    _id: '444f4808-4a86-4fb3-924d-7fd17cd7de38',
    name: 'energyexplosion',
    theme_meta_data: {
      image_url:
        'https://flam-videoshop-assets.s3.ap-south-1.amazonaws.com/flam/web/icons/energyexplosion.png',
      web_preview_data: {
        pos: [0, 0],
        ratio: [1, 1],
        asset_url:
          'https://flam-videoshop-assets.s3.ap-south-1.amazonaws.com/flam/web/preview_bundles/energyexplosion.assetbundle',
        asset_id: 'energyexplosion'
      }
    },
    created_at: '2022-10-19T11:34:54.742Z',
    updated_at: '2022-11-08T15:31:11.960Z',
    display_name: 'energyexplosion'
  },
  {
    _id: '444f4808-4a86-4fb3-924d-7fd17cd7de38',
    name: 'girldancing',
    theme_meta_data: {
      image_url:
        'https://flam-videoshop-assets.s3.ap-south-1.amazonaws.com/flam/web/icons/girldancing.png',
      web_preview_data: {
        pos: [0, 0],
        ratio: [1, 1],
        asset_url:
          'https://flam-videoshop-assets.s3.ap-south-1.amazonaws.com/flam/web/preview_bundles/girldancing.assetbundle'
      }
    },
    created_at: '2022-10-19T11:34:54.742Z',
    updated_at: '2022-11-08T15:31:11.960Z',
    display_name: 'girldancing'
  },
  {
    _id: '444f4808-4a86-4fb3-924d-7fd17cd7de38',
    name: 'helloanim',
    theme_meta_data: {
      image_url:
        'https://flam-videoshop-assets.s3.ap-south-1.amazonaws.com/flam/web/icons/helloanim.png',
      web_preview_data: {
        pos: [0, 0],
        ratio: [1, 1],
        asset_url:
          'https://flam-videoshop-assets.s3.ap-south-1.amazonaws.com/flam/web/preview_bundles/helloanim.assetbundle',
        asset_id: 'helloanim'
      }
    },
    created_at: '2022-10-19T11:34:54.742Z',
    updated_at: '2022-11-08T15:31:11.960Z',
    display_name: 'helloanim'
  },
  {
    _id: '444f4808-4a86-4fb3-924d-7fd17cd7de38',
    name: 'oyehappyrobot',
    theme_meta_data: {
      image_url:
        'https://flam-videoshop-assets.s3.ap-south-1.amazonaws.com/flam/web/icons/oyehappyrobot.png',
      web_preview_data: {
        pos: [0, 0],
        ratio: [1, 1],
        asset_url:
          'https://flam-videoshop-assets.s3.ap-south-1.amazonaws.com/flam/web/preview_bundles/oyehappyrobot.assetbundle',
        asset_id: 'oyehappyrobot'
      }
    },
    created_at: '2022-10-19T11:34:54.742Z',
    updated_at: '2022-11-08T15:31:11.960Z',
    display_name: 'oyehappyrobot'
  },
  {
    _id: '444f4808-4a86-4fb3-924d-7fd17cd7de38',
    name: 'planes',
    theme_meta_data: {
      image_url:
        'https://flam-videoshop-assets.s3.ap-south-1.amazonaws.com/flam/web/icons/planes.png',
      web_preview_data: {
        pos: [0, 0],
        ratio: [1, 1],
        asset_url:
          'https://flam-videoshop-assets.s3.ap-south-1.amazonaws.com/flam/web/preview_bundles/planes.assetbundle',
        asset_id: 'planes'
      }
    },
    created_at: '2022-10-19T11:34:54.742Z',
    updated_at: '2022-11-08T15:31:11.960Z',
    display_name: 'planes'
  },
  {
    _id: '444f4808-4a86-4fb3-924d-7fd17cd7de38',
    name: 'santa',
    theme_meta_data: {
      image_url:
        'https://flam-videoshop-assets.s3.ap-south-1.amazonaws.com/flam/web/icons/santa.png',
      web_preview_data: {
        pos: [0, 0],
        ratio: [1, 1],
        asset_url:
          'https://flam-videoshop-assets.s3.ap-south-1.amazonaws.com/flam/web/preview_bundles/santa.assetbundle',
        asset_id: 'santa'
      }
    },
    created_at: '2022-10-19T11:34:54.742Z',
    updated_at: '2022-11-08T15:31:11.960Z',
    display_name: 'santa'
  },
  {
    _id: '444f4808-4a86-4fb3-924d-7fd17cd7de38',
    name: 'sevendwarf',
    theme_meta_data: {
      image_url:
        'https://flam-videoshop-assets.s3.ap-south-1.amazonaws.com/flam/web/icons/sevendwarf.png',
      web_preview_data: {
        pos: [0, 0],
        ratio: [1, 1],
        asset_url:
          'https://flam-videoshop-assets.s3.ap-south-1.amazonaws.com/flam/web/preview_bundles/sevendwarf.assetbundle',
        asset_id: 'sevendwarf'
      }
    },
    created_at: '2022-10-19T11:34:54.742Z',
    updated_at: '2022-11-08T15:31:11.960Z',
    display_name: 'sevendwarf'
  },
  {
    _id: '444f4808-4a86-4fb3-924d-7fd17cd7de38',
    name: 'starwars',
    theme_meta_data: {
      image_url:
        'https://flam-videoshop-assets.s3.ap-south-1.amazonaws.com/flam/web/icons/starwars.png',
      web_preview_data: {
        pos: [0, 0],
        ratio: [1, 1],
        asset_url:
          'https://flam-videoshop-assets.s3.ap-south-1.amazonaws.com/flam/web/preview_bundles/starwars.assetbundle',
        asset_id: 'starwars'
      }
    },
    created_at: '2022-10-19T11:34:54.742Z',
    updated_at: '2022-11-08T15:31:11.960Z',
    display_name: 'starwars'
  },
  {
    _id: '444f4808-4a86-4fb3-924d-7fd17cd7de38',
    name: 'witchcraftparticle',
    theme_meta_data: {
      image_url:
        'https://flam-videoshop-assets.s3.ap-south-1.amazonaws.com/flam/web/icons/witchcraftparticle.png',
      web_preview_data: {
        pos: [0, 0],
        ratio: [1, 1],
        asset_url:
          'https://flam-videoshop-assets.s3.ap-south-1.amazonaws.com/flam/web/preview_bundles/witchcraftparticle.assetbundle',
        asset_id: 'witchcraftparticle'
      }
    },
    created_at: '2022-10-19T11:34:54.742Z',
    updated_at: '2022-11-08T15:31:11.960Z',
    display_name: 'witchcraftparticle'
  },
  {
    _id: '444f4808-4a86-4fb3-924d-7fd17cd7de38',
    name: 'xoxo',
    theme_meta_data: {
      image_url:
        'https://flam-videoshop-assets.s3.ap-south-1.amazonaws.com/flam/web/icons/xoxo.png',
      web_preview_data: {
        pos: [0, 0],
        ratio: [1, 1],
        asset_url:
          'https://flam-videoshop-assets.s3.ap-south-1.amazonaws.com/flam/web/preview_bundles/xoxo.assetbundle',
        asset_id: 'xoxo'
      }
    },
    created_at: '2022-10-19T11:34:54.742Z',
    updated_at: '2022-11-08T15:31:11.960Z',
    display_name: 'xoxo'
  }
];

const sampledta = {
  data: {
    _id: '044d62f4-79b4-442c-bc71-a5bec809fb88',
    product_service_id: {
      _id: 'bdeb37e1-9971-42fe-ba7f-dab1e27c4593',
      product_id: '7928aad7-66a6-4c8e-9f91-8203e2669345',
      client_id: '836dc9e1-b64c-4595-bda9-c70b29329470',
      price: 5,
      is_active: true,
      created_at: '2023-01-06T08:48:17.169Z',
      updated_at: '2023-01-06T08:48:17.169Z'
    },
    theme_id: [
      {
        _id: '8b7f50dc-cfc8-4c41-8e49-f7c7054ae462',
        name: 'no_theme',
        created_at: '2023-01-13T11:56:37.858Z',
        updated_at: '2023-01-13T11:56:37.858Z',
        display_name: 'No Theme'
      },
      {
        _id: '444f4808-4a86-4fb3-924d-7fd17cd7de38',
        name: 'christmasinvitation',
        theme_meta_data: {
          image_url:
            'https://flam-videoshop-assets.s3.ap-south-1.amazonaws.com/flam/web/icons/christmasinvitation.png'
        },
        created_at: '2022-10-19T11:34:54.742Z',
        updated_at: '2022-11-08T15:31:11.960Z',
        display_name: 'Christmas Invitation'
      }
    ],
    variant_meta_data: {
      meta_data: {
        QuadScale: {
          x: '0',
          y: '0',
          z: '0'
        },
        QuadPosition: {
          x: '0',
          y: '0',
          z: '0'
        }
      },
      image_preview_data: {
        top: '25%',
        left: '32%',
        width: '36%',
        height: 'auto',
        filter_url:
          'https://saas-assets.flamapp.com/flam/web/printique_preview/santa_2_filter_preview',
        image_width: '2175',
        preview_url:
          'https://saas-assets.flamapp.com/flam/web/printique_preview/f5566341-02e0-4989-a0e0-95d7448c6491.png',
        image_height: '1575',
        offset_width: '185',
        offset_height: '185',
        playback_width: '1810',
        playback_height: '1203'
      }
    },
    is_dashboard: false,
    created_at: '2023-01-16T09:33:09.657Z',
    updated_at: '2023-01-16T09:33:09.657Z'
  },
  error: false,
  code: 200,
  message: 'The request has been succeeded.'
};
