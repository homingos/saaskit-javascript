
# SaasSdk

Client Side SDK toolkit for SaaS.

If you want to read the full API documentation of SaasSdk, see [here]([https://business.flamapp.com](https://business.flamapp.com/)).

## Index

- [Install](#install)
- [FlamSaasSDK.init](#FlamSaasSDK.init)
- [API](#API)
- [Author](#author)
- [License](#license)

## Install

From CDN:

```html
<!-- Latest patch release -->
<script src="https://unpkg.com/flamsdk@0.0.1/dist/FlamSaasSDK.min.js"></script>
```

From [npm]([https://npmjs.org](https://npmjs.org/)):

```sh
npm i flamsdk
```

or if using yarn:

```sh
yarn add flamsdk
```

After installing the `flamsdk` module using [npm]([https://npmjs.org](https://npmjs.org/)), you'll need to bundle it up along with all of its dependencies, or import it using:

```
import FlamSaasSDK from 'flamsdk';
```

## FlamSaasSDK.init

Provides support for the initialization flow.

### Initialize

```js
const clientInit = { 
	enviornment: "sandbox | production", //optional, default to sandbox 
	key: "{YOUR_FLAMSDK_KEY}", 
}; 

const sdk = FlamSaasSDK.init(clientInit);
```

**Parameters**

All parameters can be considered optional unless otherwise stated.

| Option                        | Type              | Description                                                                                                                                                                                                                                                                              |
| :---------------------------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `enviornment`                      | string (optional) | Environment to be loaded. If not given it uses sandbox.                                                                                                                                                                                                     |
| `key`                    | string (required) | Flam SDK key recieved from `business.flamapp.com` after signin up.                                                                                                                                                                                      

### API

#### sdk.placeOrder(options, callback)

Loads an instance of the SDK in iframe on the client website. It takes all the necessary details from the client and injects it to the SDK for the user to place order and the status of the same can be fetched using a custom callback function passed by the client.

**Parameters**

All parameters can be considered optional unless otherwise stated.

| Option                        | Type              | Description                                                                                                                                                                                                                                                                              |
| :---------------------------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `productId` | string (required) | Product ID for the product to be ordered from SDK
| `refId`| string (required) | Reference ID set up by the client for their convenience and tracking
| `photo` | string (optional) | This can be passed if client wants the user to upload images on their own website instead of the FlamSDK   | 
`video`  | string (optional) | This can be passed if client wants the user to upload video on their own website instead of the FlamSDK   
| `prefill` | object (optional) | This is an object which contains the following options: `name: string` `email: string` `phone: string` for the user to contact the client in case of any errors                                                                                                                                                                                     
| `animation` | string (optional)  | This is the animation to be added on the experience which would be received from the `/products` API. In case not provided default one is used for the particular product |
`theme` | object (optional)  | This is an object which contains `color : string` in the form of **HEX**, which can be passed by the client to customise the primary colour of the SDK UI according to their needs. 
| `logo` | string (optional) | This is the logo of the client's organisation to be shown on the SDK. In case not provided a default logo would be used
| `callback` | function (required) | This is a custom function which the client can pass to handle success and error states that occur in SDK. 

```js
sdk.placeOrder(
  {
   productId:  '96f0d15e-63cd-485b-8f37-bb474d287129',
   refId:  '04607c6a-9964-47de-a0c2-853b3f89bd88',
   photo: 'https://images.pexels.com/photos/2274725/pexels-photo-2274725.jpeg',
   video:'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
   animation:  'CONFETTI',
   theme: {
	color : '#234f55',
   },
   prefill: {
	name:  'John Doe Prints',
	email:  'support@email.com',
	phone:  '+91 98765 43210'
   },
   logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Facebook_f_logo_%282019%29.svg/2048px-Facebook_f_logo_%282019%29.svg.png
  },
  function (err, result) {
    // Order pacement result or error
  }
);
```

## Issue Reporting

If you have found a bug or if you have a feature request, please report them at this  [Support Center]([https://help.flamapp.com](https://help.flamapp.com/)).

## Author

[Flam]([https://flamapp.com/](https://flamapp.com/))

## License

This project is licensed under the MIT license. See the [LICENSE](LICENSE) file for more info.

<!-- Vaaaaarrrrsss -->

[npm-image]: [https://img.shields.io/npm/v/auth0-js.svg?style=flat-square](https://img.shields.io/npm/v/auth0-js.svg?style=flat-square)
[npm-url]: [https://npmjs.org/package/auth0-js](https://npmjs.org/package/auth0-js)
[circleci-image]: [https://img.shields.io/circleci/project/github/auth0/auth0.js.svg?branch=master&style=flat-square](https://img.shields.io/circleci/project/github/auth0/auth0.js.svg?branch=master&style=flat-square)
[circleci-url]: [https://circleci.com/gh/auth0/auth0.js](https://circleci.com/gh/auth0/auth0.js)
[codecov-image]: [https://img.shields.io/codecov/c/github/auth0/auth0.js/master.svg?style=flat-square](https://img.shields.io/codecov/c/github/auth0/auth0.js/master.svg?style=flat-square)
[codecov-url]: [https://codecov.io/github/auth0/auth0.js?branch=master](https://codecov.io/github/auth0/auth0.js?branch=master)
[license-image]: [https://img.shields.io/npm/l/auth0-js.svg?style=flat-square](https://img.shields.io/npm/l/auth0-js.svg?style=flat-square)
[license-url]: #license
[downloads-image]: [https://img.shields.io/npm/dm/auth0-js.svg?style=flat-square](https://img.shields.io/npm/dm/auth0-js.svg?style=flat-square)
[downloads-url]: [https://npmjs.org/package/auth0-js](https://npmjs.org/package/auth0-js)
