# Connections - Processors

## Aim

For this exercise, the aim was to implement a Processor connection using Stripe's [Payment Intents](https://stripe.com/docs/api/payment_intents) API. The program is able to authorize, capture and cancel payments without using Stripe's SDK.

Working on this project helped to solidify my understanding TypeScripts strict type checking system, along with using the Stripe Payment Intents API and becoming familiar with its documentation.

## Set up

### Stripe

First, clone this repo:

`git clone https://github.com/riquiofficial/integrations-challenge.git`

You may use the default sandbox api key and id keys already supplied in the program.

If you wish to use your own, You'll need to create an account with [Stripe](https://dashboard.stripe.com/login) and log in to the dashboard. You can now change your [Integration](https://dashboard.stripe.com/settings/integration) settings to send card information directly as [form-encoded](<https://en.wikipedia.org/wiki/POST_(HTTP)#Use_for_submitting_web_forms>) data (though this is not recommended for live payments).

Once you've done that, you should be able to find an [API Key](https://dashboard.stripe.com/test/apikeys) in the developer section.
This API Key, along with your [account ID](https://dashboard.stripe.com/settings/user) in the user section, can be used to connect the program to your account in the stripeConnection object in `stripe.ts`.

### Dependencies

Ensure you have the latest versions of NPM and Yarn installed. Install required packages:

```bash
yarn install
```

## Get stuck in

There were 4 parts to the exercise:

- Add sandbox credentials to `Stripe.ts`
- Implement the `authorize()` method in `Stripe.ts`
- Implement the `capture()` method in `Stripe.ts`
- Implement the `cancel()` method in `Stripe.ts`

All methods use "POST" methods when sending data and data is encoded with "application/x-www-form-urlencoded".

- The `Authorize` method prepares the payment, and may be used at the start of a checkout process, for example. This amount is held on the customer's card for up to a week. If the payment is not captured in this time, the payment is cancelled and funds released.
- The `Capture` method captures the payment by accessing its retrieved authorized ID
- The `Cancel` method cancels the payment, also by accessing the authorized ID. The remaining `amount_capturable` will be refunded.

You can test and monitor different responses using these [test card numbers](https://stripe.com/docs/testing#cards-responses) by inserting them into the payment object in `main.ts`.

### Run the example

To run the program use the following command:

```bash
yarn start:processors
```

Happy Coding :D

![Code](https://media.tenor.com/images/8460465dd4597849c320adfe461e91e3/tenor.gif)
