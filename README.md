# Analytics-tracking-node

This package aims to simplify the use of Analytics.

## Installation

```bash
npm install --from-git git@github.com:homingos/analytics-tracking-node.git#1.1.0
```

## Usage

All the arguments used here are optional and can be used as per need !!

```js
const serviceRequests = {
	enviornment: "sandbox | Production",
	adjustToken: "Adjust Token",
	tagManagerArgs: {
		gtmId: "React TagManager GTM ID",
	},
};
```

After initialization

```js
AnalyticsService.init(serviceRequests);
```

### Enjoy!

All in One service package.

### Typescript

Everything will be typed in the future builds.

## License

This analytics-tracking-node package is an open-sourced software licensed under the MIT license.

## Contributing

Issues and PRs are obviously welcomed and encouraged, both for new features and documentation.
