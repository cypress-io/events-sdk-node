# Hightouch Node.js SDK

Hightouch's Node SDK lets you track event data from your Node applications. After integrating the SDK, you will be able to send event data to numerous destinations.

## Installing the SDK

Run the following command to install the Node.js SDK via **npm**:

```bash
$ npm install @hightouchio/events-sdk-node
```

## Using the SDK

Create a global Hightouch client:

```javascript
const Analytics = require('@hightouchio/events-sdk-node');

const client = new Analytics(WRITE_KEY, {
  dataPlaneUrl: DATA_PLANE_URL, // default: https://events.us-east-1.hightouch.com
});
```

## SDK Initialization Options

Below parameters are optional and can be passed during SDK initialization:

| Name                   | Type     | Default value                            | Description                                                                                       |
| :--------------------- | :------- | :--------------------------------------- | :------------------------------------------------------------------------------------------------ |
| `dataPlaneUrl`         | String   | `https://events.us-east-1.hightouch.com` | The data plane URL.                                                                               |
| `path`                 | String   | `/v1/batch`                              | Path to batch endpoint.                                                                           |
| `flushAt`              | Number   | 20                                       | The number of events to be flushed when reached this limit.                                       |
| `flushInterval`        | Number   | 10000                                    | The maximum timespan (in milliseconds) after which the events from the in-memory queue is flushed |
| `maxQueueSize`         | Number   | 460800(500kb)                            | Maximum payload size of a batch request                                                           |
| `maxInternalQueueSize` | Number   | 20000                                    | The maximum length of the in-memory queue                                                         |
| `logLevel`             | String   | 'info'                                   | Log level. `Ex: 'debug', 'error'`                                                                 |
| `axiosConfig`          | Object   | N/A                                      | Axios config                                                                                      |
| `axiosInstance`        | Object   | N/A                                      | Axios instance                                                                                    |
| `axiosRetryConfig`     | Object   | N/A                                      | Axios retry configuration                                                                         |
| `retryCount`           | Number   | 3                                        | Number of times requests will be retried by axios if failed                                       |
| `errorHandler`         | Function | N/A                                      | A function that will be called if request to server failed                                        |
| `gzip`                 | Boolean  | true                                     | Whether to compress request with gzip or not                                                      |

## Example calls

> Unlike the client-side SDKs that deal with a single user at a given time, the server-side SDKs deal with multiple users simultaneously. Therefore, you must specify either the userId or anonymousId every time while making any API calls supported by the Node SDK.

Identify
```javascript
client.identify({
  userId: "1hKOmRA4GRlm",
  traits: {
    name: "Alex Keener",
    email: "alex@example.com",
    plan: "Free",
    friends: 21,
  },
})
```

Track
```javascript
client.track({
  userId: "1hKOmRA4GRlm",
  event: "Item Viewed",
  properties: {
    revenue: 19.95,
    shippingMethod: "Premium",
  },
})
```

Page
```javascript
client.page({
  userId: "1hKOmRA4GRlm",
  category: "Food",
  name: "Pizza",
  properties: {
    url: "https://example.com",
    title: "Pizza",
    referrer: "https://google.com",
  },
})
```

Screen
```javascript
client.screen({
  userId: "12345",
  category: "Food",
  name: "Pizza",
  properties: {
    screenSize: 10,
    title: "Pizza",
    referrer: "https://google.com",
  },
})
```

Group
```javascript
client.group({
  userId: "12345",
  groupId: "1",
  traits: {
    name: "Company",
    description: "Google",
  },
})
```

Alias
```javascript
client.alias({
  previousId: "old_id",
  userId: "new_id",
})
```

## Data Persistence (BETA)

The data persistence feature aims to temporarily persist events in Redis, leading to better event delivery. The SDK can retry delivery, multiple times, even if your server restarts, crashes, or redeploys.

| To use this feature, you will need to host a Redis server and use it as the intermediary data storage queue. |
| :----------------------------------------------------------------------------------------------------------- |

A sample SDK initialization is shown below:

```javascript
const client = new Analytics(
  "write_key",
  {
    dataPlaneUrl: DATA_PLANE_URL // default: https://events.us-east-1.hightouch.com with default path set to /v1/batch
    flushAt: <number> = 20,
    flushInterval: <ms> = 20000
    maxInternalQueueSize: <number> = 20000 // the max number of elements that the SDK can hold in memory,
                                                                // this is different than the Redis list created when persistence is enabled
  }
);
client.createPersistenceQueue(
  {
    queueOpts: queueOpts,
    redisOpts: { host: "localhost" },
  },
  callback,
)
```

To initialize the data persistence queue, you need to call the `createPersistenceQueue()` method which takes several parameters as input - `queueOpts: {}`, `redisOpts: {}` - and an additional `callback: (err) => {}`.

```typescript
queueOpts {
    queueName ?: string = "hightouchEventsQueue",
    isMultiProcessor ? : boolean = false
    // this will be used as a prefix to Redis keys
    prefix ? : string = "hightouch",
    redisOpts : RedisOpts,
    jobOpts ?: JobOpts
}

JobOpts {
    maxAttempts ? : number = 10
}

RedisOpts {
    port?: number = 6379;
    host?: string = localhost;
    db?: number = 0;
    password?: string;
}
```

**If you do not call `createPersistenceQueue` after initializing the SDK, the SDK will not implement data persistence.**

**If you are running multiple Node servers with the same `QueueOpts.queueName` (likely!), you must run `QueueOpts.isMultiProcessor` as `true`.**

### Data Persistence FAQ

_How to ensure that all my events in the queue are processed?_

You can use the `flush()` method to ensure that all events in the queue are processed. The following example highlights the use of `flush()` with a callback:

```javascript
client.flush(function(err, batch){
  console.log('Flushing done');
})
```

### Data Persistence Event flow

- SDK methods (e.g. track) push events to an in-memory array.
- This in-memory array has a maximum size of `maxInternalQueueSize`.
- The in-memory array is periodically flushed to Redis based on `flushAt` and `flushInterval`.
- Once `maxInternalQueueSize` is reached, _new events won’t be accepted (cases where Redis connection is slow or the Redis server is not reachable)_.
- Simultaniously, the SDK will also be retrieving batches from Redis and attempting to send them to the dataplane URL.
- The processor will retry errors up to `JobOpts.maxAttempts` times, with an exponential backoff.
- If the job fails `JobOpts.maxAttempts` times, it will not be retried again and pushed to a failed queue.

## About Hightouch

[**Hightouch**](https://hightouch.com/) is a **composable customer data platform**.
