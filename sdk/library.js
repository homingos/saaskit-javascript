class FlamSDK {
    token = "";
    placeOrder(token) {
        if (token == "abc") {
            this.token = token;
            const body = document.querySelector("body");

            const iFrame = document.createElement("iframe");
            iFrame.src = "../../sdk/ui/index.html"

            body.appendChild(iFrame)
        } else {
            alert("Wrong sdk creds")
        }
    }

    
}