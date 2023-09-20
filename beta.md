## Data Persistence (BETA)

The data persistence feature aims to temporarily persist events in Redis, leading to better event delivery. The SDK can retry delivery, multiple times, even if your server restarts, crashes, or redeploys.

| To use this feature, you will need to host a Redis server and use it as the intermediary data storage queue. |
| :----------------------------------------------------------------------------------------------------------- |

A sample SDK initialization is shown below:

```javascript
const client = new Analytics(
  "write_key",
  {
    dataPlaneUrl: DATA_PLANE_URL // default: https://us-east-1.hightouch-events.com with default path set to /v1/batch
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
