import type { FastifyInstance } from 'fastify';
import PCSCLite from 'pcsclite';

const initializePcsc = (server: FastifyInstance) => {
  const pcsclite = PCSCLite();

  pcsclite.on('reader', function (reader) {
    server.log.info(`${reader.name}: detected`);

    reader.on('error', function (err) {
      server.log.error(`${reader.name}: ${err.message}`);
    });

    reader.on('status', function (status) {
      const changes = this.state ^ status.state;
      server.log.info(`${reader.name}: ${status.state}`);
      if (changes) {
        if (
          changes & this.SCARD_STATE_EMPTY &&
          status.state & this.SCARD_STATE_EMPTY
        ) {
          server.log.info(`${reader.name}: card removed`);
          reader.disconnect(reader.SCARD_LEAVE_CARD, function (err) {
            if (err) {
              server.log.error(err);
            } else {
              server.log.info(`${reader.name}: disconnected`);
            }
          });
        } else if (
          changes & this.SCARD_STATE_PRESENT &&
          status.state & this.SCARD_STATE_PRESENT
        ) {
          server.log.info(`${reader.name}: card inserted`);
          reader.connect(
            { share_mode: this.SCARD_SHARE_SHARED },
            function (err, protocol) {
              if (err) {
                server.log.error(err);
              } else {
                server.log.info(`${reader.name} protocol: ${protocol}`);
                reader.transmit(
                  Buffer.from([0x00, 0xb0, 0x00, 0x00, 0x20]),
                  40,
                  protocol,
                  function (err, data) {
                    if (err) {
                      server.log.error(err);
                    } else {
                      server.log.info(`${reader.name}: ${data}`);
                      reader.close();
                      pcsclite.close();
                    }
                  }
                );
              }
            }
          );
        }
      }
    });

    reader.on('end', function () {
      server.log.info(`${reader.name}: removed`);
    });
  });
};

export { initializePcsc };
