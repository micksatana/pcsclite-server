import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import type { CardReader } from 'pcsclite';
import fastify from 'fastify';

import {
  onDisconnectCallbackWith,
  onReaderConnectedWith,
  onReaderDetectedWith,
  onReaderDisconnectedWith,
  onReaderErrorWith,
  onReaderRemovedWith,
  onStatusChangedWith,
  onTransmitResponseDataWith,
  rejectTimeoutWith,
  transmitWith,
} from './pcsclite';
import * as Delay from '../utils/delay';
import * as UseCase from '../use-cases/thai-id-card';
import { StandardCommands } from '../entities';

describe('onStatusChangedWith', () => {
  const server = fastify({ logger: true });
  // @ts-expect-error
  const reader: CardReader = {
    SCARD_STATE_EMPTY: 16,
    SCARD_STATE_PRESENT: 32,
    name: 'reader',
    state: 0,
    on: vi.fn(),
    connect: vi.fn(),
    disconnect: vi.fn(),
  };
  const status = { state: 18 };
  const info = vi.spyOn(server.log, 'info').mockImplementation(() => {});
  server['adapters'] = {
    data: {
      set: vi.fn(),
    },
  };

  beforeAll(() => {
    // Ensure no delay during tests
    vi.spyOn(Delay, 'delay').mockResolvedValue(undefined);
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('when no change', () => {
    beforeEach(async () => {
      await onStatusChangedWith(server)(reader)(status);
    });

    it('just log info', () => {
      expect(server.log.info).toBeCalledWith(
        `${reader.name}: state[${reader.state},${status.state}]`
      );
      expect(reader.disconnect).toBeCalled();
      expect(server['adapters'].data.set).toBeCalledWith();
    });
  });

  describe('when insert a card', () => {
    beforeEach(async () => {
      reader.state = 18;
      status.state = 34;
      await onStatusChangedWith(server)(reader)(status);
    });

    it('log info', () => {
      expect(info).toHaveBeenNthCalledWith(
        1,
        `${reader.name}: state[${reader.state},${status.state}]`
      );
      expect(info).toHaveBeenNthCalledWith(2, `${reader.name}: card inserted`);
      expect(reader.connect).toBeCalled();
    });
  });

  describe('when remove a card', () => {
    beforeEach(async () => {
      reader.state = 290;
      status.state = 18;
      await onStatusChangedWith(server)(reader)(status);
    });

    it('log info', () => {
      expect(server.log.info).toBeCalledWith(
        `${reader.name}: state[${reader.state},${status.state}]`
      );
      expect(server.log.info).toBeCalledWith(`${reader.name}: card removed`);
      expect(reader.disconnect).toBeCalled();
      expect(server['adapters'].data.set).toBeCalledWith();
    });
  });
});

describe('transmitWith', () => {
  const server = fastify({ logger: true });
  // @ts-expect-error
  const reader: CardReader = { name: 'reader', transmit: vi.fn() };

  it('set transmit function correctly when specify a length', () => {
    const data = [1, 2];
    const protocol = 1;
    transmitWith(server)(reader)(protocol)(data, 2);
    expect(reader.transmit).toBeCalledWith(
      Buffer.from(data),
      2,
      protocol,
      expect.any(Function)
    );
  });

  it('set transmit function correctly when NOT specify a length', () => {
    const data = [1, 2];
    const protocol = 1;
    transmitWith(server)(reader)(protocol)(data);
    expect(reader.transmit).toBeCalledWith(
      Buffer.from(data),
      data.length + 2,
      protocol,
      expect.any(Function)
    );
  });
});

describe('rejectTimeoutWith', () => {
  it('reject', () => {
    const reject = vi.fn();
    rejectTimeoutWith(reject)();

    expect(reject).toBeCalledWith('Timeout');
  });
});

describe('onDisconnectCallbackWith', () => {
  const server = fastify({ logger: true });
  // @ts-expect-error
  const reader: CardReader = { name: 'reader', on: vi.fn() };
  const info = vi.spyOn(server.log, 'info').mockImplementation(() => {});

  beforeAll(() => {
    onDisconnectCallbackWith(server)(reader)();
  });

  it('log info', () => {
    expect(info).toBeCalledWith(`${reader.name}: disconnected due to an error`);
  });
});

describe('onTransmitResponseDataWith', () => {
  const server = fastify({ logger: true });
  // @ts-expect-error
  const reader: CardReader = {
    name: 'reader',
    disconnect: vi.fn(),
    transmit: vi.fn(),
  };
  const logError = vi.spyOn(server.log, 'error').mockImplementation(() => {});
  const warn = vi.spyOn(server.log, 'warn').mockImplementation(() => {});
  const protocol = 1;
  const resolve = vi.fn();
  const reject = vi.fn();

  describe('when has error', () => {
    const message = 'some error while connected';
    const error = new Error(message);
    const buffer = Buffer.from('');

    beforeAll(() => {
      onTransmitResponseDataWith(server)(reader)(protocol)(resolve, reject)(
        error,
        buffer
      );
    });

    it('log error', () => {
      expect(logError).toBeCalledWith(`${reader.name}: ${error.message}`);
      expect(reader.disconnect).toBeCalled();
    });
  });

  describe('when result contains command warning', () => {
    const field = [1, 2];
    const errorFlags = [0x62, 0x00];
    const buffer = Buffer.from([...field, ...errorFlags]);

    it('warn and reject with the error message', () => {
      onTransmitResponseDataWith(server)(reader)(protocol)(resolve, reject)(
        null,
        buffer
      );
      expect(warn).toBeCalled();
      expect(reject).toBeCalled();
    });
  });

  describe('when result contains command error', () => {
    const field = [1, 2];
    const errorFlags = [0x65, 0x00];
    const buffer = Buffer.from([...field, ...errorFlags]);

    it('log error and reject with the error message', () => {
      onTransmitResponseDataWith(server)(reader)(protocol)(resolve, reject)(
        null,
        buffer
      );
      expect(logError).toBeCalled();
      expect(reject).toBeCalled();
    });
  });

  describe('when result contains command unknown error', () => {
    const field = [1, 2];
    const errorFlags = [9999, 9999];
    const buffer = Buffer.from([...field, ...errorFlags]);

    it('reject', () => {
      onTransmitResponseDataWith(server)(reader)(protocol)(resolve, reject)(
        null,
        buffer
      );
      expect(reject).toBeCalled();
    });
  });

  describe('when result is ok', () => {
    const field = [1, 2];
    const ok = [0x90, 0x00];
    const buffer = Buffer.from([...field, ...ok]);

    it('resolve field data', () => {
      onTransmitResponseDataWith(server)(reader)(protocol)(resolve, reject)(
        null,
        buffer
      );
      expect(resolve).toBeCalledWith(Buffer.from(field));
    });
  });

  describe('when there is more result', () => {
    const field = [1, 2];
    const expectedLength = 4;
    const more = [0x61, expectedLength];
    const buffer = Buffer.from([...field, ...more]);

    it('request more data', () => {
      onTransmitResponseDataWith(server)(reader)(protocol)(resolve, reject)(
        null,
        buffer
      );
      expect(reader.transmit).toBeCalledWith(
        Buffer.from([...StandardCommands.GetResponse, expectedLength]),
        expectedLength + 2,
        protocol,
        expect.any(Function)
      );
    });
  });
});

describe('onReaderConnectedWith', () => {
  const server = fastify({ logger: true });
  // @ts-expect-error
  const reader: CardReader = {
    name: 'reader',
    disconnect: vi.fn(),
    transmit: vi.fn(),
  };
  const logError = vi.spyOn(server.log, 'error').mockImplementation(() => {});
  server['adapters'] = {
    data: {
      set: vi.fn(),
    },
  };

  describe('when has error', () => {
    const message = 'some error while connected';
    const error = new Error(message);

    beforeAll(() => {
      onReaderConnectedWith(server)(reader)(error, 0);
    });

    it('log error', () => {
      expect(logError).toBeCalledWith(`${reader.name}: ${error.message}`);
    });
  });

  describe('when no error', () => {
    describe('and able to scan', () => {
      beforeAll(() => {
        vi.spyOn(UseCase, 'scanThaiIdCard').mockResolvedValue(
          {} as UseCase.ThaiIdCard
        );
        onReaderConnectedWith(server)(reader)(null, 1);
      });

      it('set data', () => {
        expect(UseCase.scanThaiIdCard).toBeCalled();
        expect(server['adapters'].data.set).toBeCalledWith({});
      });
    });

    describe('and failed to scan', () => {
      beforeAll(() => {
        vi.spyOn(UseCase, 'scanThaiIdCard').mockRejectedValue(
          new Error('some error')
        );
        onReaderConnectedWith(server)(reader)(null, 1);
      });

      it('set data', () => {
        expect(UseCase.scanThaiIdCard).toBeCalled();
        expect(server['adapters'].data.set).toBeCalledWith();
      });
    });
  });
});

describe('onReaderDisconnectedWith', () => {
  const server = fastify({ logger: true });
  // @ts-expect-error
  const reader: CardReader = { name: 'reader', on: vi.fn() };
  const logInfo = vi.spyOn(server.log, 'info').mockImplementation(() => {});
  const logError = vi.spyOn(server.log, 'error').mockImplementation(() => {});

  describe('when has error', () => {
    const message = 'some error while disconnected';
    const error = new Error(message);

    beforeAll(() => {
      onReaderDisconnectedWith(server)(reader)(error);
    });

    it('log error', () => {
      expect(logError).toBeCalledWith(error);
    });
  });

  describe('when no error', () => {
    beforeAll(() => {
      onReaderDisconnectedWith(server)(reader)();
    });

    it('log info', () => {
      expect(logInfo).toBeCalledWith(`${reader.name}: disconnected`);
    });
  });
});

describe('onReaderDetectedWith', () => {
  const server = fastify({ logger: true });
  // @ts-expect-error
  const reader: CardReader = { name: 'reader', on: vi.fn() };
  const info = vi.spyOn(server.log, 'info').mockImplementation(() => {});

  beforeAll(() => {
    onReaderDetectedWith(server)(reader);
  });

  it('log info', () => {
    expect(info).toBeCalledWith(`${reader.name}: detected`);
  });
});

describe('onReaderRemovedWith', () => {
  const server = fastify({ logger: true });
  // @ts-expect-error
  const reader: CardReader = { name: 'reader', on: vi.fn() };
  const info = vi.spyOn(server.log, 'info').mockImplementation(() => {});

  beforeAll(() => {
    onReaderRemovedWith(server)(reader)()();
  });

  it('log info', () => {
    expect(info).toBeCalledWith(`${reader.name}: removed`);
  });
});

describe('onReaderErrorWith', () => {
  const server = fastify({ logger: true });
  const message = 'test message';
  const error = new Error(message);
  const reader = { name: 'reader' };

  beforeAll(() => {
    vi.spyOn(server.log, 'error').mockImplementation(() => {});
    onReaderErrorWith(server)(reader as CardReader)(error);
  });

  it('log error', () => {
    expect(server.log.error).toBeCalledWith(`${reader.name}: ${error.message}`);
  });
});
