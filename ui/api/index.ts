import axios from "axios"

export const getProductData = async ({ productId, apiKey }: { productId: string, apiKey: string }) => {
    const res = await axios.get(`https://dev.homingos.com/saas/api/v1/products`, {
        params: {
            product_id: productId
        },
        headers: {
            "x-api-key": apiKey
        }
    });

    return res?.data;
}

// "o78N5gJ639CcgCbc9zsj-00edz0"