const axios = require("axios");
const HightouchEvents = require('@hightouchio/events-sdk-node');
require('dotenv').config({ path: '../../.env' });

const writeKey = process.env.WRITE_KEY;
const dataPlaneUrl = process.env.DATAPLANE_URL;

const axiosInstanceWithInterceptors = axios.create();
axiosInstanceWithInterceptors.interceptors.response.use(
  function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response;
  }, function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    if(error.response.status === 404) {
      console.log(error.config.url)
      console.log(error.config.headers)
      console.log(error.config.data)
    }
    return Promise.reject(error);
  });

const client = new HightouchEvents(writeKey, {
  axiosInstance: axiosInstanceWithInterceptors,
  dataPlaneUrl,
  gzip: false,
  flushAt: 2,
  logLevel: 'debug',
});
/**
 * Sample function to send 3 hightouch events[identify,track,track] and make sure events are flowing
 */
function test() {
  client.identify(
    {
      userId: 1456,
      traits: {
        name: 'Name Username',
        email: 'name@website.com',
        plan: 'Free',
        friends: 21,
      },
    },
    () => {
      console.log('In identify call');
    },
  );

  client.track(
    {
      userId: 'Test user 1',
      event: 'Item Purchased',
      properties: {
        revenue: 19.95,
        shippingMethod: 'Premium',
      },
    },
    () => {
      console.log('In track call');
    },
  );
  client.track(
    {
      userId: 'Test user 2',
      event: 'Item Viewed',
      properties: {
        price: 45,
        currency: 'USD',
        productId: 'Product-12345',
      },
    },
    () => {
      console.log('In track call 2');
    },
  );

  // await client.flush();
}

try {
  test();
} catch (e) {
  console.log(e.message);
}

exports.HightouchEvents = HightouchEvents;

// run this file with the command "node app"
