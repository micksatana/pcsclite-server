# PCSC Lite Server

[![codecov](https://codecov.io/gh/micksatana/pcsclite-server/graph/badge.svg?token=6Fzi1Sihkf)](https://codecov.io/gh/micksatana/pcsclite-server)

This server can be deployed on a device connected with a smartcard reader. It will provide a web server serving with the latest card information it read.

## Implementation

```mermaid
sequenceDiagram
participant r as Card Reader
participant s as pcsclite-server
participant ce as Your Chome Extension
participant w as Your Web App

activate r
r ->> r: Read a card
r -->> s: Buffer
activate s
deactivate r
ce -->> w: Embed code to interact with localhost
s ->> s: Process and save in-memory
w ->> s: GET /cards/latest
activate w
s -->> w: { uid, citizenId, ... }
deactivate w
deactivate s
```

## Usage

```ts
import { initializePcsc, createServer } from 'pcsclite-server';

const server = createServer();

// Modify Fastify server instance as needed
// Then initialize pcsclite using the server instance
initializePcsc(server);

server.listen({ port: 3000, host: '0.0.0.0' });
```

## Security

It should be used with a Chrome Extension which provide a service worker embeded a piece of code to interact with the local pcsclite-server. You should implement a security layer between the pcsclite-server and your Chrome Extension so to prevent malicious actor in your network.
