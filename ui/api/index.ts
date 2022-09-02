import axios from 'axios';

const backend_base_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const backend_sandbox_base_URL = process.env.NEXT_PUBLIC_SANDBOX_BACKEND_URL;

const getUrl = (env: 'SANDBOX' | 'PRODUCTION') =>
  env == 'PRODUCTION' ? backend_base_URL : backend_sandbox_base_URL;

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
      Authorization: 'Token 7cc88f57ac9789058ea3e42e8329d0f52ef86acb'
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
