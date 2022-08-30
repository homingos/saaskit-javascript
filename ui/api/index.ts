import axios from 'axios';
const backend_base_URL = 'https://api.flamapp.com/saas';

export const getProductData = async ({
  productId,
  apiKey
}: {
  productId: string;
  apiKey: string;
}) => {
  const res = await axios.get(`${backend_base_URL}/api/v1/products`, {
    params: {
      product_id: productId
    },
    headers: {
      'x-api-key': apiKey
    }
  });

  return res?.data;
};

export const getSignedURL = async (data: any) => {
  const res = await axios.post(
    `${backend_base_URL}/orders/v2/signed_url`,
    data,
    {
      headers: {
        Authorization: 'Token 7cc88f57ac9789058ea3e42e8329d0f52ef86acb'
      }
    }
  );
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
  apiKey,
  data
}: {
  apiKey: string;
  data: {
    productId: string;
    clientPhotoURL: string;
    clientVideoURL: string;
    refId: string;
    theme: string;
  };
}) => {
  const res = await axios.post(
    `${backend_base_URL}/api/v1/orders/create`,
    data,
    {
      headers: {
        'x-api-key': apiKey
      }
    }
  );

  return res.data;
};
