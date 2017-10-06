# moltin-paymentrequest-api

> 💳 Demoing the [Payment Request API](https://www.w3.org/TR/payment-request/) with [moltin](https://www.moltin.com)

## Using

Add your `client_id` to `config/prod.env.js`:

```js
// config/prod.env.js
module.exports = {
  NODE_ENV: '"production"',
  MOLTIN_CLIENT_ID: '"xyz"'
}
```

👉 Try out the [demo](https://moltin-paymentrequest-api.now.sh/#/).

**Note**: This demo will only work in [browsers with support](http://caniuse.com/#feat=payment-request) (Chrome 61+, Edge 15+) for the Payment Request API.

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report
```

For detailed explanation on how things work, checkout the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).
