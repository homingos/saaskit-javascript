

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
<script src="https://unpkg.com/flamsdk@2.0.7/dist/FlamSaasSDK.min.js"></script>
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
  environment: 'SANDBOX' | 'PRODUCTION'
  key: '{YOUR_FLAMSDK_KEY}'
};

const sdk = FlamSaasSDK.init(clientInit);
```

**Parameters**

All parameters can be considered optional unless otherwise stated.

| Option        | Type              | Description                                                        |
| :------------ | ----------------- | ------------------------------------------------------------------ |
| `environment` | string (required) | Environment to be loaded.       |
| `key`         | string (required) | Flam SDK key received from `business.flamapp.com` after signin up. |

### API

#### sdk.placeOrder(options)

Loads an instance of the SDK in iframe on the client website. It takes all the necessary details from the client and injects it to the SDK for the user to place order.

**Parameters**

All parameters can be considered optional unless otherwise stated.

| Option            | Type                | Description                                                                                                                                                                                                                                                       |
| :---------------- | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `productId`       | string (required)   | Product ID for the product to be ordered from SDK                                                                                                                                                                                                                 |
| `varientId`       | string (required)   | Varient ID for the product to be ordered from SDK                                                                                                                                                                                                                 |
| `refId`           | string (required)   | Reference ID set up by the client for their convenience and tracking                                                                                                                                                                                                                                                                                                                                                                                                    |
| `photo`           | object (required)  | The object with `url` can be passed if client wants the user to upload images on their own website instead of the FlamSDK. `url` can be `''` (empty string) when not sending photo.                                                                                                                                                          |
| `video`           | object (required)   | The object with `url` can be passed if client wants the user to upload video on their own website instead of the FlamSDK and a `default` field to pass a video which user can select inside the SDK. `url` can be `''` (empty string) when not sending video.                                                                                                                                             |
| `color` | string (optional)   | color in the form of **HEX**, which can be passed by the client to customise the primary and secondary colour of the SDK UI according to their needs.                              |
| `handleSuccess` | function (required)  | This method is used to perform action on create success.                 |
| `handleFailure` | function (required)  | This method is used to perform action on create failure.                 |

```js
sdk.placeOrder(
  {
      productId: '<product-id>',
      varientId: '<varient-id>',
      refId: "<ref-id>",
      photo: {
        url: '<photo-url>'
      },
      video: {
        url: '<video-url>',
        default: '<default-video-url>'
      },
      color: '#000000',
      handleSuccess: data => {
        console.log('sdkRes', data);
      },
      handleFailure: err => {
        console.log(err);
      }
  }
);
```

#### sdk.updateOrder(options)


**Parameters**

All parameters can be considered optional unless otherwise stated.

| Option            | Type                | Description                                                                                                                                                                                                                                                       |
| :---------------- | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `refId`       | string (required)   | Order ID for the product to be ordered from SDK                                                                                                                                                                                                                 |
| `color` | string (optional)   | color in the form of **HEX**, which can be passed by the client to customise the primary and secondary colour of the SDK UI according to their needs.                              |
| `handleSuccess` | function (required)  | This method is used to perform action on create success.                 |
| `handleFailure` | function (required)  | This method is used to perform action on create failure.                 |
| `handleClose` | function (required)  | This method is used to perform action on close button.                 |

```js
sdk.updateOrder(
  {
		  refId: '',
      color: '#000000',
      handleSuccess: data => {
        console.log('sdkRes', data);
      },
      handleFailure: err => {
        console.log(err);
      },
      handleClose: err => {
        console.log(err);
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
