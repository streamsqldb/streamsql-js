# StreamSQL Javascript Ingestion API

> Upload data on your StreamSQL event streams.

## Install

### npm

```sh
npm install @streamsql/streamsql-js
```

### CDN

If not using a bundler, the package is available via CDN. Include the script tag in all pages where `streamsql` is used.

```html
<script crossorigin src="https://unpkg.com/@streamsql/streamsql-js"></script>
```

## Usage

```javascript
import streamsql from '@streamsql/streamsql-js'

// Initialize the client
streamsql.init(process.env.APIKEY)

// Set custom user properties
streamsql.identify('USER_ID')

// Send data on your streams
streamsql.sendEvent(
  'my-event-stream',
  { eventName: 'My Event' },
)
```

## API

### streamsql

#### `streamsql.init(APIKEY <string>)`

Initialize the streamsql client with your API key. If you are using the CDN script, this must be called first on every page streamsql is used.

#### `streamsql.identify(userId <string>)`

Set a user id to be tied with events. The user id is persisted throughout multiple sessions.Use `streamsql.unidentify()` to clear set user ids.

#### `streamsql.unidentify()`

Clears any stored user ids that were set by `streamsql.identify('userId')`.

#### `streamsql.sendEvent(streamName <string> [,data <object>, onSent? <function>])`

Send data to `streamName`. The stream name must be valid and registered prior to sending. If data is not provided, default options will be sent including page context, any set user ids, timestamps, and so on. `onSent` is a an optional callback that is called with the response status code and response text when sending is complete.

## Related

> streamsql-pixel: Simple starter script to gather some general visitor data.
