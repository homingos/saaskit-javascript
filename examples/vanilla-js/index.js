const buyBtn = document.querySelector("#placeorder");

buyBtn.addEventListener("click", () => {
    const flam = new FlamSDK();

    flam.placeOrder("abc");
})

const flam = new FlamSDK();

// flam.placeOrder("abc");