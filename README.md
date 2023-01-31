
# Saaskit-javascript

Client Side SDK toolkit for SaaS.

If you want to read the full API documentation of SaasSdk, see [here](<[https://business.flamapp.com](https://business.flamapp.com/)>).

## Index

- [Install](#install)
- [FlamSaasSDK.init](#flamsaassdkinit)
- [API](#api)
- [Author](#author)
- [License](#license)

#### You can checkout the demo [here](https://homingos.github.io/saaskit-javascript/examples/vanilla-js/)

## Install

From CDN:

```html
<!-- Latest patch release -->
<script src="https://unpkg.com/flamsdk@2.0.3/dist/FlamSaasSDK.min.js"></script>
```

From [npm](<[https://npmjs.org](https://npmjs.org/)>):

```sh
npm i flamsdk
```

or if using yarn:

```sh
yarn add flamsdk
```

After installing the `flamsdk` module using [npm](<[https://npmjs.org](https://npmjs.org/)>), you'll need to bundle it up along with all of its dependencies, or import it using:

```
import FlamSaasSDK from 'flamsdk';
```

## FlamSaasSDK.init

Provides support for the initialization flow.

### Initialize

```js
const clientInit = {
  enviornment: 'sandbox | production', //optional, default to sandbox
  key: '{YOUR_FLAMSDK_KEY}'
};

const sdk = FlamSaasSDK.init(clientInit);
```

**Parameters**

All parameters can be considered optional unless otherwise stated.

| Option        | Type              | Description                                                        |
| :------------ | ----------------- | ------------------------------------------------------------------ |
| `enviornment` | string (optional) | Environment to be loaded. If not given it uses sandbox.            |
| `key`         | string (required) | Flam SDK key recieved from `business.flamapp.com` after signin up. |

### API

#### sdk.placeOrder(options, callback)

Loads an instance of the SDK in iframe on the client website. It takes all the necessary details from the client and injects it to the SDK for the user to place order and the status of the same can be fetched using a custom callback function passed by the client.

**Parameters**

All parameters can be considered optional unless otherwise stated.

| Option            | Type                | Description                                                                                                                                                                                                                                                       |
| :---------------- | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `productId`       | string (required)   | Product ID for the product to be ordered from SDK                                                                                                                                                                                                                 |
| `varientId`       | string (required)   | Variant ID for the product to be ordered from SDK                                                                                                                                                                                                                 |
| `refId`           | string (required)   | Reference ID set up by the client for their convenience and tracking                                                                                                                                                                                                                                                                                                                                                                                                    |
| `photo`           | object (optional)   | The object with url can be passed if client wants the user to upload images on their own website instead of the FlamSDK                                                                                                                                                          |
| `video`           | object (optional)   | The object with url can be passed if client wants the user to upload video on their own website instead of the FlamSDK                                                                                                                                                    |
| `color` | object (optional)   | color in the form of **HEX**, which can be passed by the client to customise the primary and secondary colour of the SDK UI according to their needs.                              |

```js
sdk.placeOrder(
  {
    productId: '96f0d15e-63cd-485b-8f37-bb474d287129',
    varientId: 'VARIANT-1',
    refId: '04607c6a-9964-47de-a0c2-853b3f89bd88',
    photo: {
	     url : 'https://images.pexels.com/photos/2274725/pexels-photo-2274725.jpeg',
    },
    video: {
	      url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      },
    color: '#a62107',
    handleSuccess: data => {
        sdkRes = data;
        console.log('sdkRes', sdkRes);
        showFinalize();
    },
    handleFailure: data => {
       console.log(data);
    }
  }
);
```

## Issue Reporting

If you have found a bug or if you have a feature request, please report them at this [Support Center](<[https://help.flamapp.com](https://help.flamapp.com/)>).

## Author

[Flam](<[https://flamapp.com/](https://flamapp.com/)>)

## License

This project is licensed under the MIT license. See the [LICENSE](LICENSE) file for more info.
