import axios from 'axios';

const getUrl = (env: 'SANDBOX' | 'PRODUCTION') =>
  env == 'PRODUCTION'
    ? process.env.NEXT_PUBLIC_BACKEND_URL
    : process.env.NEXT_PUBLIC_SANDBOX_BACKEND_URL;

const getAuthKey = (env: 'SANDBOX' | 'PRODUCTION') =>
  env == 'PRODUCTION'
    ? process.env.NEXT_PUBLIC_BACKEND_AUTH_KEY
    : process.env.NEXT_PUBLIC_SANDBOX_BACKEND_AUTH_KEY;

export const getProductData = async ({
  env = 'SANDBOX',
  productId,
  apiKey
}: {
  env: 'SANDBOX' | 'PRODUCTION';
  productId: string;
  apiKey: string;
}) => {
  const res = await axios.get(`${getUrl(env)}/api/v1/products`, {
    params: {
      product_id: productId
    },
    headers: {
      'x-api-key': apiKey
    }
  });

  return res?.data;
};

export const getSignedURL = async (
  env: 'SANDBOX' | 'PRODUCTION' = 'SANDBOX',
  data: any
) => {
  const res = await axios.post(`${getUrl(env)}/orders/v2/signed_url`, data, {
    headers: {
      Authorization: `Token ${getAuthKey(env)}`
    }
  });
  return res.data;
};

export const UploadURLv2 = async (signedURL: string, file: File) => {
  const res = await axios({
    method: 'put',
    url: signedURL,
    data: file,
    headers: {
      'Content-Type': file.type
    }
  });
  return res;
};

export const createCard = async ({
  env = 'SANDBOX',
  apiKey,
  data
}: {
  env: 'SANDBOX' | 'PRODUCTION';
  apiKey: string;
  data: {
    productId: string;
    clientPhotoURL: string;
    clientVideoURL: string;
    refId: string;
    theme: string;
  };
}) => {
  const res = await axios.post(`${getUrl(env)}/api/v1/orders/create`, data, {
    headers: {
      'x-api-key': apiKey
    }
  });

  return res.data;
};

export const getCLientData = async ({
  env = 'SANDBOX',
  apiKey
}: {
  env: 'SANDBOX' | 'PRODUCTION';
  apiKey: string;
}) => {
  const res = await axios.get(`${getUrl(env)}/api/v1/accounts/userprofile`, {
    headers: {
      'x-api-key': apiKey
    }
  });

  return res.data;
};

export const getCreatedProductData = async ({
  env = 'SANDBOX',
  flamCardId
}: {
  env: 'SANDBOX' | 'PRODUCTION';
  flamCardId: string;
}) => {
  // /api/v1/orders/flamcard?flamcard_id=bee5c2d4-20fb-4b7f-8d91-0746a5117ca7
  const res = await axios.get(`${getUrl(env)}/api/v1/orders/flamcard`, {
    params: {
      flamcard_id: flamCardId
    },
    headers: {
      Authorization: `Token ${getAuthKey(env)}`
    }
  });

  return res.data;
};

export const updateCard = async ({
  env = 'SANDBOX',
  data
}: {
  env: 'SANDBOX' | 'PRODUCTION';
  data: {
    flamcardId: string;
    newVideoUrl: string;
  };
}) => {
  const res = await axios.post(`${getUrl(env)}/api/v1/videochange`, data, {
    // api/v1/videochange
    headers: {
      Authorization: `Token ${getAuthKey(env)}`
    }
  });

  return res.data;
};
