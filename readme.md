# Events Node.js SDK

This SDK lets you track user event data from your Node applications.

## Installing the SDK

Run the following command to install the Node.js SDK via **npm**:

```bash
$ npm install @ht-sdks/events-sdk-node
```

## Using the SDK

Create a global client:

```javascript
const Analytics = require('@ht-sdks/events-sdk-node');

const client = new Analytics(WRITE_KEY, {
  dataPlaneUrl: DATA_PLANE_URL,
});
```

## SDK Initialization Options

Below parameters are optional and can be passed during SDK initialization:

| Name                   | Type     | Default value                            | Description                                                                                       |
| :--------------------- | :------- | :--------------------------------------- | :------------------------------------------------------------------------------------------------ |
| `dataPlaneUrl`         | String   |                                          | The data plane URL.                                                                               |
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
