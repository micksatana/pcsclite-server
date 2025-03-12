import type { FastifyInstance } from 'fastify';
import PCSCLite, { CardReader } from 'pcsclite';

import { scanThaiIdCard } from '../use-cases';
import { StandardCommands } from '../entities/apdu-commands';
import { delay } from '../utils/delay';
import { parseApduCommandError } from '../entities';
import { decode as decoder } from 'iconv-lite';

export const onTransmitResponseDataWith =
  (server: FastifyInstance) =>
  (reader: CardReader) =>
  (protocol: number) =>
  (
    resolve: (data: Buffer<ArrayBufferLike>) => void,
    reject: (reason: string) => void
  ) =>
  (error: Error, data: Buffer<ArrayBufferLike>) => {
    if (error) {
      server.log.error(`${reader.name}: ${error.message}`);
      reader.disconnect(() => {
        server.log.info(`${reader.name}: disconnected due to an error`);
      });
    } else {
      const field = data.subarray(0, data.length - 2);
      const [sw1, sw2] = data.subarray(-2);

      if (sw1 === 0x90 && sw2 === 0x00) {
        // Command successfully executed (OK).
        const resolveTimeout = setTimeout(() => {
          reject('Timeout');
        }, 3000);
        resolve(field);
        clearTimeout(resolveTimeout);
        return;
      }

      if (sw1 === 0x61) {
        // Response bytes still available
        const expectedLength = sw2;
        reader.transmit(
          Buffer.from([...StandardCommands.GetResponse, expectedLength]),
          expectedLength + 2, // By default using last byte of the data which indicate expected result length, plus two for sw1, and sw2
          protocol,
          onTransmitResponseDataWith(server)(reader)(protocol)(resolve, reject)
        );
        return;
      }

      const error = parseApduCommandError(sw1, sw2);

      if (error) {
        if (error.level === 'warning') {
          server.log.warn(`${reader.name}: ${error.message}`);
        } else {
          server.log.error(`${reader.name}: ${error.message}`);
        }
        reject(error.message);
      } else {
        reject(`Unknown error [${sw1.toString()},${sw2.toString()}]`);
      }
    }
  };

export const transmitWith =
  (server: FastifyInstance) =>
  (reader: CardReader) =>
  (protocol: number) =>
  async (data: number[], resultLength?: number) => {
    return new Promise<Buffer>((resolve, reject) => {
      reader.transmit(
        Buffer.from(data),
        resultLength || data[data.length - 1] + 2, // By default using last byte of the data which indicate expected result length, plus two for sw1, and sw2
        protocol,
        onTransmitResponseDataWith(server)(reader)(protocol)(resolve, reject)
      );
    });
  };

export const onReaderConnectedWith =
  (server: FastifyInstance) =>
  (reader: CardReader) =>
  async (error: Error, protocol: number) => {
    server.log.info(`${reader.name}: ${protocol}`);
    if (error) {
      server.log.error(`${reader.name}: ${error.message}`);
    } else {
      const transmitter = transmitWith(server)(reader)(protocol);

      try {
        const card = await scanThaiIdCard(transmitter, decoder);

        server['adapters'].data.set(card);
      } catch (e) {
        // Clear latest data
        server['adapters'].data.set();
      }
    }
  };

export const onReaderDisconnectedWith =
  (server: FastifyInstance) => (reader: CardReader) => (error?: Error) => {
    if (error) {
      server.log.error(error);
    } else {
      server.log.info(`${reader.name}: disconnected`);
    }
  };

export const onReaderRemovedWith =
  (server: FastifyInstance) => (reader: CardReader) => () => () => {
    server.log.info(`${reader.name}: removed`);
  };

export const onStatusChangedWith =
  (server: FastifyInstance) => (reader: CardReader) => async (status) => {
    const changes = reader.state ^ status.state;
    server.log.info(`${reader.name}: state[${reader.state},${status.state}]`);

    if (changes) {
      if (
        changes & reader.SCARD_STATE_EMPTY &&
        status.state & reader.SCARD_STATE_EMPTY
      ) {
        server.log.info(`${reader.name}: card removed`);
        reader.disconnect(
          reader.SCARD_LEAVE_CARD,
          onReaderDisconnectedWith(server)(reader)
        );
        // Clear latest data
        server['adapters'].data.set();
      } else if (
        changes & reader.SCARD_STATE_PRESENT &&
        status.state & reader.SCARD_STATE_PRESENT
      ) {
        server.log.info(`${reader.name}: card inserted`);
        await delay(1000);
        reader.connect(
          { share_mode: reader.SCARD_SHARE_SHARED },
          onReaderConnectedWith(server)(reader)
        );
      }
    }
  };

export const onReaderDetectedWith =
  (server: FastifyInstance) => (reader: CardReader) => {
    server.log.info(`${reader.name}: detected`);

    reader.on('error', onReaderErrorWith(server)(reader));
    reader.on('status', onStatusChangedWith(server)(reader));
    reader.on('end', onReaderRemovedWith(server)(reader));
  };

export const onReaderErrorWith =
  (server: FastifyInstance) => (reader: CardReader) => (error: Error) => {
    server.log.error(`${reader.name}: ${error.message}`);
  };

export const initializePcsc = (server: FastifyInstance) => {
  const pcsclite = PCSCLite();

  pcsclite.on('reader', onReaderDetectedWith(server));
};
