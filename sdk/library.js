class FlamSDK {
    token = "";
    placeOrder(token) {
        if (token == "abc") {
            this.token = token;
            const body = document.querySelector("body");

            const iFrame = document.createElement("iframe");
            iFrame.id = "flam-sdk-iframe"
            iFrame.src = "http://localhost:3000/"

            body.appendChild(iFrame)
        } else {
            alert("Wrong sdk creds")
        }
    }
}