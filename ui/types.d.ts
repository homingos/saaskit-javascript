interface dataFromClientType {
  client_data: {
    // name: string;
    // email: string;
    // phone: string;
    // logoUrl: string;
    environment: 'SANDBOX' | 'PRODUCTION';
    key: string;
  };
  order_details?: {
    productId: string;
    refId: string;
    photo?: string;
    video?: string;
    animation: string;
    prefill?: {
      name?: string;
      email?: string;
      phone?: string;
    };
    logo?: string;
  };
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

interface ReceivedEventType {
  data: { type: string; payload: any };
  origin: string;
}
