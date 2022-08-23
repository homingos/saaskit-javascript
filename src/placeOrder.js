export default function placeOrder(clientData, productId, orderDetails, callback) {
    let pages = {
        main: "http://localhost:3000",
        error: "http://localhost:3000/error"
    }

    // if (!clientData || !clientData.enviornment || !clientData.key) {
    // show error page here
    let url = `${pages.error}/Something went wrong!`
    this.renderWithRetry(url);
    callback({ message: "Error Occured!" }, null)
    // } else {
    //   this.token = clientData.key;
    //   let url = `${pages.main}/?product_id=${productId}`
    //   this.renderWithRetry(url);
    // }
};