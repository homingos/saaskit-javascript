const buyBtn = document.querySelector("#placeorder");

buyBtn.addEventListener("click", () => {
    console.log("Call show popup")
    const flam = new FlamSDK();

    flam.placeOrder("abc");
})

const flam = new FlamSDK();

flam.placeOrder("abc");