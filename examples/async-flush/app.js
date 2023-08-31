// TODO fix this; it's for the 1.0.0 prefork version (forked at 2.0.0).
// Did not fork the 1.0.0 version.
const HTEvents = require('@hightouch/events-sdk-node');
require('dotenv').config({ path: '../../.env' });

const writeKey = process.env.WRITE_KEY;
const dataPlaneUrl = process.env.DATAPLANE_URL;

const client = new HTEvents(writeKey, `${dataPlaneUrl}/v1/batch`, {
  // flushAt: 2,
});
/**
 * Sample function to send 3 events[identify,track,track] and make sure it's completion by promosifiying the flush
 */
async function test() {
  // promisify the flush method
  const flush = () => new Promise((resolve) => client.flush(resolve));

  // call RS client methods as normal –
  // no promisify or await needed and called concurrently
  client.identify(
    {
      userId: 'Test user 1',
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

  // this both flushes and ensures completion
  await flush();
}

test().then(() => {
  console.log('test call done');
});

exports.HTEvents = HTEvents;

// run this file with the command "node app"
