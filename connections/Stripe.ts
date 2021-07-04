import {
  APIKeyCredentials,
  CardDetails,
  ParsedAuthorizationResponse,
  ParsedCancelResponse,
  ParsedCaptureResponse,
  ProcessorConnection,
  RawAuthorizationRequest,
  RawCancelRequest,
  RawCaptureRequest,
} from '@primer-io/app-framework';

import HttpClient from '../common/HTTPClient';

import {baseApiUrl} from './urls'


const StripeConnection: ProcessorConnection<APIKeyCredentials, CardDetails> = {
  name: 'STRIPE',

  website: 'stripe.com',

  configuration: {
    accountId: 'acct_1J8T97IWaJ0iZr3m',
    apiKey: 'sk_test_51J8T97IWaJ0iZr3mbhOAV5sMN4RNTBIdBU43Nq5LwtmBav4SJNhgHN6jO7mYfmrzJzR6xe0ZhTF9CjDtnFRsuzyX00xrCyVCSc',
  },

  
  /**
   *
   * You should authorize a transaction and return an appropriate response
   */
  async authorize(
    request: RawAuthorizationRequest<APIKeyCredentials, CardDetails>,
  ): Promise<ParsedAuthorizationResponse> {

    const apiKey = request.processorConfig.apiKey

    // merchant reference as optional object paramater identified in RawAuthorizationRequest
    const merchantReference: string = request.merchantReference ? request.merchantReference : ""

    // pass parameters as though through url to api
    const paymentRequestParams = 
      `amount=${request.amount}
      &currency=${request.currencyCode}
      &capture_method=manual
      &confirm=true
      &payment_method_data[type]=card
      &payment_method_data[card][exp_month]=${request.paymentMethod.expiryMonth}
      &payment_method_data[card][exp_year]=${request.paymentMethod.expiryYear}
      &payment_method_data[billing_details][name]=${request.paymentMethod.cardholderName}
      &payment_method_data[card][cvc]=${request.paymentMethod.cvv}
      &payment_method_data[card][number]=${request.paymentMethod.cardNumber}
      ${merchantReference ? `&description=${merchantReference}` : ""}`.replace(/\n\s+/g, "")
      

    const result = await HttpClient.request(baseApiUrl, {
      method: "post", 
      headers: {
        Authorization: `Bearer ${request.processorConfig.apiKey}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }, 
      body: paymentRequestParams
    }
)

    let response: ParsedAuthorizationResponse;

      // parse text to access error messages/id
    const responseText = JSON.parse(result.responseText)

    if (result.statusCode == 200) {
      response = {processorTransactionId: responseText.id, transactionStatus: "AUTHORIZED"}
    } else if (result.statusCode >= 400 && result.statusCode < 500) {
      response = {declineReason: responseText.error.message, transactionStatus: "DECLINED"} 
    } else {
      response = { errorMessage: "Could not connect to Stripe", transactionStatus: 'FAILED'}
    }

      
    return response

  },

  /**
   * Capture a payment intent
   * This method should capture the funds on an authorized transaction
   */
  async capture(
    request: RawCaptureRequest<APIKeyCredentials>,
  ): Promise<ParsedCaptureResponse> {

    const id = request.processorTransactionId

    // if merchantReference exists, pass it through body in request, otherwise pass empty string
    const merchantReference: string = request.merchantReference ? request.merchantReference : ""

    const url: string = `${baseApiUrl}/${id}/capture`

    const result = await HttpClient.request(
      url, {
        method: "post", 
        headers: {
          Authorization: `Bearer ${request.processorConfig.apiKey}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }, 
        body: merchantReference
      }
    )

    let response: ParsedCaptureResponse;

    const responseText = JSON.parse(result.responseText)

    if (result.statusCode == 200 && responseText.status == "succeeded") {
      response = {transactionStatus: "SETTLED"}
    } else if (result.statusCode == 200 && responseText.status == "processing") {
      response = {transactionStatus: "SETTLING"}
    }else if (responseText) {
      response = { errorMessage: responseText.error.message, transactionStatus: 'FAILED'}
    } else {
      response = { errorMessage: "Could not connect to Stripe", transactionStatus: 'FAILED'}
    }

    return response
  },

  /**
   * Cancel a payment intent
   * This one should cancel an authorized transaction
   */
  async cancel(
    request: RawCancelRequest<APIKeyCredentials>,
  ): Promise<ParsedCancelResponse> {

    const id = request.processorTransactionId
    const url: string = `${baseApiUrl}/${id}/cancel`
    
    const merchantReference: string = request.merchantReference ? request.merchantReference : ""

    const result = await HttpClient.request(
      url, {
        method: "post", 
        headers: {
          Authorization: `Bearer ${request.processorConfig.apiKey}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }, 
        body: merchantReference
      }
    )

    let response: ParsedCaptureResponse;

    const responseText = JSON.parse(result.responseText)

    
    if (result.statusCode == 200 && responseText.status == "canceled") {
      response = {transactionStatus: "CANCELLED"}
    } else if (responseText) {
      response = { errorMessage: responseText.error.message, transactionStatus: 'FAILED'}
    } else {
      response = { errorMessage: "Could not connect to Stripe", transactionStatus: 'FAILED'}
    }

    return response
  },
};

export default StripeConnection;