interface dataFromClientType {
    client_data: {
        environment: "sandbox" | "production";
        key: string;
    };
    order_details?: {
        refId: string,
        photoUrl?: string,
        videoUrl?: string,
        photoCorousal?: string[],
        animation?: string,
        message?: string
    };
    product_id: string;
}

interface productDataType {
    productHeader: string;
    productImage: string;
    productMetaData: {
        audio: {
            isActive: boolean
        },
        augmentPhoto: {
            isActive: boolean
        },
        photo: {
            isActive: boolean
        },
        text: {
            isActive: boolean
        },
        theme: {
            isActive: boolean
        },
        video: {
            isActive: boolean
        }
    };
    productPrice: number;
    productServiceId: string;
}