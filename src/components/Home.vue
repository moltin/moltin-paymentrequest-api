<template>
  <div class="home">
    <div class="products">
      <h2>Products</h2>
      <div v-if="products.data">
        <div class="products-grid" v-if="products.data.length > 0">
          <div v-for="product in products.data">
            <h3>{{product.name}}</h3>
            <p>{{product.meta.display_price.with_tax.formatted}}</p>
            <button v-on:click="addToCart(product.id)">Add to cart</button>
          </div>
        </div>
        <p v-else>You have no products</p>
      </div>
      <p v-else>Loading your products</p>
    </div>
    <div class="cart">
      <h2>Cart</h2>
      <div v-if="cartItems.data">
        <div v-if="cartItems.data.length > 0">
          <table class="cart-table">
            <thead>
              <th>Item</th>
              <th>Quantity</th>
              <th>Total</th>
            </thead>
            <tbody>
              <tr v-for="item in cartItems.data">
                <td>{{item.name}}</td>
                <td>{{item.quantity}}</td>
                <td>{{item.meta.display_price.with_tax.value.formatted}}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td>Total</td>
                <td>{{cart.data.meta.display_price.with_tax.formatted}}</td>
              </tr>
            </tfoot>
          </table>
          <button v-on:click="completeOrder()">Checkout</button>
          <button v-on:click="emptyCart()">Clear</button>
        </div>
        <p v-else>Your cart is empty</p>
      </div>
      <p v-else>Loading your cart</p>
    </div>
  </div>
</template>

<script>
import Moltin from '../lib/moltin';

export default {
  data() {
    return {
      products: [],
      cartItems: [],
      cart: {},
    };
  },
  created() {
    this.fetchMoltinData();
  },
  methods: {
    async fetchMoltinData() {
      this.products = await Moltin.Products.All();
      await this.fetchCart();
    },

    fetchCart() {
      this.cart = Moltin.Cart.Get();
      this.cartItems = Moltin.Cart.Items();
    },

    async addToCart(product) {
      await Moltin.Cart.AddProduct(product);
      return this.fetchCart();
    },

    async emptyCart() {
      await Moltin.Cart.Delete();
      return this.fetchCart();
    },

    async completeOrder() {
      const paymentMethods = [{ supportedMethods: ['basic-card'] }];
      const options = { requestPayerEmail: true, requestPayerName: true };

      // Build an order item summary from the cart items
      const displayItems = this.cartItems.data.map((item) => {
        const newItem = {};

        newItem.label = item.name;
        newItem.amount = {
          currency: item.meta.display_price.with_tax.value.currency,
          value: item.meta.display_price.with_tax.value.formatted.substring(1),
        };

        return newItem;
      });

      // Instantiate a new `PaymentRequest` interface
      const payment = new PaymentRequest(paymentMethods, {
        total: {
          label: 'Total',
          amount: {
            currency: this.cartItems.meta.display_price.with_tax.currency,
            value: this.cartItems.meta.display_price.with_tax.formatted.substring(1),
          },
        },
        displayItems,
      }, options);

      // Show the payment capture UI
      const paymentResponse = await payment.show();

      // Build the moltin address payload from the `PaymentRequest` response
      const address = {
        first_name: paymentResponse.details.billingAddress.recipient.split(' ')[0],
        last_name: paymentResponse.details.billingAddress.recipient.split(' ')[1],
        line_1: paymentResponse.details.billingAddress.addressLine[0],
        city: paymentResponse.details.billingAddress.city,
        postcode: paymentResponse.details.billingAddress.postalCode,
        county: paymentResponse.details.billingAddress.region,
        country: paymentResponse.details.billingAddress.country,
      };

      // Checkout our cart and create an order
      const order = await Moltin.Cart.Checkout({
        customer: {
          name: paymentResponse.payerName,
          email: paymentResponse.payerEmail,
        },
        shipping_address: address,
        billing_address: address,
      });

      // Pay for the order with Stripe
      await Moltin.Orders.Payment(order.data.id, {
        gateway: 'stripe',
        method: 'purchase',
        first_name: paymentResponse.details.cardholderName.split(' ')[0],
        last_name: paymentResponse.details.cardholderName.split(' ')[1],
        number: paymentResponse.details.cardNumber,
        month: paymentResponse.details.expiryMonth,
        year: paymentResponse.details.expiryYear,
        verification_value: paymentResponse.details.cardSecurityCode,
      });

      // Complete the `PaymentRequest`
      await paymentResponse.complete();
      return this.emptyCart();
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.products-grid {
  display: flex;
  justify-content: space-between;
  max-width: 80%;
  margin: 0 auto 4rem;
}

.cart-table {
  margin: auto;
}

h1, h2 {
  font-weight: normal;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}
</style>
