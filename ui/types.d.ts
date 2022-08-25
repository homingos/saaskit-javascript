interface dataFromClientType {
  client_data: {
    name: string;
    email: string;
    phone: string;
    logoUrl: string;
    environment: 'sandbox' | 'production';
    key: string;
  };
  order_details?: {
    refId: string;
    photo?: string;
    video?: string;
    photoCorousal?: string[];
    animation?: string;
    message?: string;
  };
  product_id: string;
}

interface productDataType {
  productHeader: string;
  productImage: string;
  productMetaData: {
    audio: {
      isActive: boolean;
    };
    augmentPhoto: {
      isActive: boolean;
    };
    photo: {
      isActive: boolean;
    };
    text: {
      isActive: boolean;
    };
    theme: {
      isActive: boolean;
    };
    video: {
      isActive: boolean;
    };
  };
  productPrice: number;
  productServiceId: string;
}
