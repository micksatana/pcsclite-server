export const ApduCommandErrorLevels = ['warning', 'error', 'security'] as const;
export type ApduCommandErrorLevel = (typeof ApduCommandErrorLevels)[number];

export class ApduCommandError extends Error {
  level: ApduCommandErrorLevel;

  constructor(message: string, level: ApduCommandErrorLevel) {
    super(message);
    this.name = 'ApduCommandError';
    this.level = level;
  }
}

export const parseApduCommandError = (sw1, sw2) => {
  switch (sw1) {
    case 0x06:
      return new ApduCommandError('Class not supported.', 'error');
    case 0x62:
      switch (sw2) {
        case undefined:
        case null:
          return new ApduCommandError(
            'State of non-volatile memory unchanged',
            'warning'
          );
        case 0x00:
          return new ApduCommandError(
            'No information given (NV-Ram not changed)',
            'warning'
          );
        case 0x01:
          return new ApduCommandError('NV-Ram not changed 1.', 'warning');
        case 0x81:
          return new ApduCommandError(
            'Part of returned data may be corrupted',
            'warning'
          );
        case 0x82:
          return new ApduCommandError(
            'End of file/record reached before reading Le bytes',
            'warning'
          );
        case 0x83:
          return new ApduCommandError('Selected file invalidated', 'warning');
        case 0x84:
          return new ApduCommandError(
            'Selected file is not valid. FCI not formated according to ISO',
            'warning'
          );
        case 0x85:
          return new ApduCommandError(
            'No input data available from a sensor on the card. No Purse Engine enslaved for R3bc',
            'warning'
          );
        case 0xa2:
          return new ApduCommandError('Wrong R-MAC', 'warning');
        case 0xa4:
          return new ApduCommandError(
            'Card locked (during reset())',
            'warning'
          );
        case 0xf1:
          return new ApduCommandError('Wrong C-MAC', 'warning');
        case 0xf3:
          return new ApduCommandError('Internal reset', 'warning');
        case 0xf5:
          return new ApduCommandError('Default agent locked', 'warning');
        case 0xf7:
          return new ApduCommandError('Cardholder locked', 'warning');
        case 0xf8:
          return new ApduCommandError('Basement is current agent', 'warning');
        case 0xf9:
          return new ApduCommandError('CALC Key Set not unblocked', 'warning');
        default:
          if (sw2 >= 0xc0 && sw2 <= 0xcf) {
            return new ApduCommandError(
              'Counter with value x (command dependent)',
              'warning'
            );
          } else {
            return new ApduCommandError('RFU', 'warning');
          }
      }
    case 0x63:
      switch (sw2) {
        case undefined:
        case null:
          return new ApduCommandError(
            'State of non-volatile memory changed',
            'warning'
          );
        case 0x00:
          return new ApduCommandError(
            'No information given (NV-Ram changed)',
            'warning'
          );
        case 0x81:
          return new ApduCommandError(
            'File filled up by the last write. Loading/updating is not allowed.',
            'warning'
          );
        case 0x82:
          return new ApduCommandError('Card key not supported.', 'warning');
        case 0x83:
          return new ApduCommandError('Reader key not supported.', 'warning');
        case 0x84:
          return new ApduCommandError(
            'Plaintext transmission not supported.',
            'warning'
          );
        case 0x85:
          return new ApduCommandError(
            'Secured transmission not supported.',
            'warning'
          );
        case 0x86:
          return new ApduCommandError(
            'Volatile memory is not available.',
            'warning'
          );
        case 0x87:
          return new ApduCommandError(
            'Non-volatile memory is not available.',
            'warning'
          );
        case 0x88:
          return new ApduCommandError('Key number not valid.', 'warning');
        case 0x89:
          return new ApduCommandError('Key length is not correct.', 'warning');
        case 0xc0:
          return new ApduCommandError('Verify fail, no try left.', 'warning');
        case 0xc1:
          return new ApduCommandError('Verify fail, 1 try left.', 'warning');
        case 0xc2:
          return new ApduCommandError('Verify fail, 2 tries left.', 'warning');
        case 0xc3:
          return new ApduCommandError('Verify fail, 3 tries left.', 'warning');
        default:
          if (sw2 >= 0xc4 && sw2 <= 0xcf) {
            return new ApduCommandError(
              'The counter has reached the value ‘x’ (0 = x = 15) (command dependent).',
              'warning'
            );
          } else {
            return new ApduCommandError('RFU', 'warning');
          }
      }
    case 0x64:
      switch (sw2) {
        case undefined:
        case null:
          return new ApduCommandError(
            'State of non-volatile memory unchanged',
            'error'
          );
        case 0x00:
          return new ApduCommandError(
            'No information given (NV-Ram not changed)',
            'error'
          );
        case 0x01:
          return new ApduCommandError(
            'Command timeout. Immediate response required by the card.',
            'error'
          );
        default:
          return new ApduCommandError('RFU', 'error');
      }
    case 0x65:
      switch (sw2) {
        case undefined:
        case null:
          return new ApduCommandError(
            'State of non-volatile memory changed',
            'error'
          );
        case 0x00:
          return new ApduCommandError('No information given', 'error');
        case 0x01:
          return new ApduCommandError(
            'Write error. Memory failure. There have been problems in writing or reading the EEPROM. Other hardware problems may also bring this error.',
            'error'
          );
        case 0x81:
          return new ApduCommandError('Memory failure', 'error');
        default:
          return new ApduCommandError('RFU', 'error');
      }
    case 0x66:
      switch (sw2) {
        case 0x00:
          return new ApduCommandError(
            'Error while receiving (timeout)',
            'security'
          );
        case 0x01:
          return new ApduCommandError(
            'Error while receiving (character parity error)',
            'security'
          );
        case 0x02:
          return new ApduCommandError('Wrong checksum', 'security');
        case 0x03:
          return new ApduCommandError(
            'The current DF file without FCI',
            'security'
          );
        case 0x04:
          return new ApduCommandError(
            'No SF or KF under the current DF',
            'security'
          );
        case 0x69:
          return new ApduCommandError(
            'Incorrect Encryption/Decryption Padding',
            'security'
          );
        default:
          return new ApduCommandError('Unknown 0x66 0xXX', 'security');
      }
    case 0x67:
      switch (sw2) {
        case 0x00:
          return new ApduCommandError('Wrong length', 'error');
        default:
          if (sw2 >= 0x01 && sw2 <= 0xff) {
            return new ApduCommandError(
              'Length incorrect (procedure)(ISO 7816-3)',
              'error'
            );
          } else {
            return new ApduCommandError('Unknown 0x67', 'error');
          }
      }
    case 0x68:
      switch (sw2) {
        case undefined:
        case null:
          return new ApduCommandError(
            'Functions in CLA not supported',
            'error'
          );
        case 0x00:
          return new ApduCommandError(
            'No information given (The request function is not supported by the card)',
            'error'
          );
        case 0x81:
          return new ApduCommandError('Logical channel not supported', 'error');
        case 0x82:
          return new ApduCommandError(
            'Secure messaging not supported',
            'error'
          );
        case 0x83:
          return new ApduCommandError(
            'Last command of the chain expected',
            'error'
          );
        case 0x84:
          return new ApduCommandError(
            'Command chaining not supported',
            'error'
          );
        default:
          if (sw2 >= 0xf1 && sw2 <= 0xff) {
            return new ApduCommandError('Unknown 0x68', 'error');
          } else {
            return new ApduCommandError('RFU', 'error');
          }
      }
    case 0x69:
      switch (sw2) {
        case undefined:
        case null:
          return new ApduCommandError('Command not allowed', 'error');
        case 0x00:
          return new ApduCommandError(
            'No information given (Command not allowed)',
            'error'
          );
        case 0x01:
          return new ApduCommandError(
            'Command not accepted (inactive state)',
            'error'
          );
        case 0x81:
          return new ApduCommandError(
            'Command incompatible with file structure',
            'error'
          );
        case 0x82:
          return new ApduCommandError(
            'Security condition not satisfied.',
            'error'
          );
        case 0x83:
          return new ApduCommandError('Authentication method blocked', 'error');
        case 0x84:
          return new ApduCommandError(
            'Referenced data reversibly blocked (invalidated)',
            'error'
          );
        case 0x85:
          return new ApduCommandError(
            'Conditions of use not satisfied.',
            'error'
          );
        case 0x86:
          return new ApduCommandError(
            'Command not allowed (no current EF)',
            'error'
          );
        case 0x87:
          return new ApduCommandError(
            'Expected secure messaging (SM) object missing',
            'error'
          );
        case 0x88:
          return new ApduCommandError(
            'Incorrect secure messaging (SM) data object',
            'error'
          );
        case 0x96:
          return new ApduCommandError('Data must be updated again', 'error');
        case 0xe1:
          return new ApduCommandError(
            'POL1 of the currently Enabled Profile prevents this action.',
            'error'
          );
        case 0xf0:
          return new ApduCommandError('Permission Denied', 'error');
        case 0xf1:
          return new ApduCommandError(
            'Permission Denied – Missing Privilege',
            'error'
          );
        default:
          if (sw2 >= 0xf2 && sw2 <= 0xff) {
            return new ApduCommandError('Unknown 0x69', 'error');
          } else {
            return new ApduCommandError('RFU', 'error');
          }
      }
    case 0x6a:
      switch (sw2) {
        case undefined:
        case null:
          return new ApduCommandError('Wrong parameter(s) P1-P2', 'error');
        case 0x00:
          return new ApduCommandError(
            'No information given (Bytes P1 and/or P2 are incorrect)',
            'error'
          );
        case 0x80:
          return new ApduCommandError(
            'The parameters in the data field are incorrect.',
            'error'
          );
        case 0x81:
          return new ApduCommandError('Function not supported', 'error');
        case 0x82:
          return new ApduCommandError('File not found', 'error');
        case 0x83:
          return new ApduCommandError('Record not found', 'error');
        case 0x84:
          return new ApduCommandError(
            'There is insufficient memory space in record or file',
            'error'
          );
        case 0x85:
          return new ApduCommandError(
            'Lc inconsistent with TLV structure',
            'error'
          );
        case 0x86:
          return new ApduCommandError('Incorrect P1 or P2 parameter.', 'error');
        case 0x87:
          return new ApduCommandError('Lc inconsistent with P1-P2', 'error');
        case 0x88:
          return new ApduCommandError('Referenced data not found', 'error');
        case 0x89:
          return new ApduCommandError('File already exists', 'error');
        case 0x8a:
          return new ApduCommandError('DF name already exists.', 'error');
        case 0xf0:
          return new ApduCommandError('Wrong parameter value', 'error');
        default:
          if (sw2 >= 0xf1 && sw2 <= 0xff) {
            return new ApduCommandError('Unknown 0x6a', 'error');
          } else {
            return new ApduCommandError('RFU', 'error');
          }
      }
    case 0x6b:
      switch (sw2) {
        case undefined:
        case null:
          return new ApduCommandError('Wrong parameter(s) P1-P2', 'error');
        default:
          return new ApduCommandError(
            'Reference incorrect (procedure byte), (ISO 7816-3)',
            'error'
          );
      }
    case 0x6c:
      switch (sw2) {
        case undefined:
        case null:
          return new ApduCommandError('Wrong length Le', 'error');
        case 0x00:
          return new ApduCommandError('Incorrect P3 length.', 'error');
        default:
          return new ApduCommandError(
            'Bad length value in Le; ‘xx’ is the correct exact Le',
            'error'
          );
      }
    case 0x6d:
      switch (sw2) {
        case undefined:
        case null:
          return new ApduCommandError('Unknown 0x6d', 'error');
        case 0x00:
          return new ApduCommandError(
            'Instruction code not supported or invalid',
            'error'
          );
        default:
          return new ApduCommandError(
            'Instruction code not programmed or invalid (procedure byte), (ISO 7816-3)',
            'error'
          );
      }
    case 0x6e:
      switch (sw2) {
        case undefined:
        case null:
          return new ApduCommandError('Unknown 0x6e', 'error');
        case 0x00:
          return new ApduCommandError('Class not supported', 'error');
        default:
          return new ApduCommandError(
            'Instruction class not supported (procedure byte), (ISO 7816-3)',
            'error'
          );
      }
    case 0x6f:
      switch (sw2) {
        case undefined:
        case null:
          return new ApduCommandError('Internal exception', 'error');
        case 0x00:
          return new ApduCommandError(
            'Command aborted – more exact diagnosis not possible (e.g., operating system error).',
            'error'
          );
        case 0xff:
          return new ApduCommandError('Card dead (overuse, …)', 'error');
        default:
          return new ApduCommandError(
            'No precise diagnosis (procedure byte), (ISO 7816-3)',
            'error'
          );
      }

    case 0x90:
      switch (sw2) {
        case 0x04:
          return new ApduCommandError(
            'PIN not succesfully verified, 3 or more PIN tries left',
            'warning'
          );
        case 0x80:
          return new ApduCommandError(
            'Unblock Try Counter has reached zero',
            'warning'
          );
      }
      break;
    case 0x92:
      switch (sw2) {
        case 0x10:
          return new ApduCommandError(
            'Insufficient memory. No more storage available.',
            'error'
          );
        case 0x40:
          return new ApduCommandError(
            'Writing to EEPROM not successful.',
            'error'
          );
      }
      break;
    case 0x93:
      switch (sw2) {
        case 0x03:
          return new ApduCommandError(
            'Application is permanently locked',
            'error'
          );
      }
      break;
    case 0x94:
      switch (sw2) {
        case 0x00:
          return new ApduCommandError('No EF selected.', 'error');
        case 0x02:
          return new ApduCommandError('Address range exceeded.', 'error');
        case 0x04:
          return new ApduCommandError(
            'FID not found, record not found or comparison pattern not found.',
            'error'
          );
        case 0x06:
          return new ApduCommandError('Required MAC unavailable', 'error');
        case 0x08:
          return new ApduCommandError(
            'Selected file type does not match command.',
            'error'
          );
      }
      break;
    case 0x98:
      switch (sw2) {
        case 0x02:
          return new ApduCommandError('No PIN defined.', 'error');
        case 0x04:
          return new ApduCommandError(
            'Access conditions not satisfied, authentication failed.',
            'error'
          );
        case 0x35:
          return new ApduCommandError(
            'ASK RANDOM or GIVE RANDOM not executed.',
            'error'
          );
        case 0x40:
          return new ApduCommandError(
            'PIN verification not successful.',
            'error'
          );
        case 0x50:
          return new ApduCommandError(
            'INCREASE or DECREASE could not be executed because a limit has been reached.',
            'error'
          );
        case 0x62:
          return new ApduCommandError(
            'Authentication Error, application specific (incorrect MAC)',
            'error'
          );
      }
      break;
    case 0x99:
      switch (sw2) {
        case 0x86:
          return new ApduCommandError('Missing privilege', 'error');
      }
      break;
    case 0x9d:
      switch (sw2) {
        case 0x05:
          return new ApduCommandError('Incorrect certificate type', 'error');
        case 0x07:
          return new ApduCommandError('Incorrect session data size', 'error');
        case 0x08:
          return new ApduCommandError(
            'Incorrect DIR file record size',
            'error'
          );
        case 0x09:
          return new ApduCommandError('Incorrect FCI record size', 'error');
        case 0x0a:
          return new ApduCommandError('Incorrect code size', 'error');
        case 0x10:
          return new ApduCommandError(
            'Insufficient memory to load application',
            'error'
          );
        case 0x11:
          return new ApduCommandError('Invalid AID', 'error');
        case 0x12:
          return new ApduCommandError('Duplicate AID', 'error');
        case 0x13:
          return new ApduCommandError('Application previously loaded', 'error');
        case 0x14:
          return new ApduCommandError('Application history list full', 'error');
        case 0x15:
          return new ApduCommandError('Application not open', 'error');
        case 0x17:
          return new ApduCommandError('Invalid offset', 'error');
        case 0x18:
          return new ApduCommandError('Application already loaded', 'error');
        case 0x19:
          return new ApduCommandError('Invalid certificate', 'error');
        case 0x1a:
          return new ApduCommandError('Invalid signature', 'error');
        case 0x1b:
          return new ApduCommandError('Invalid KTU', 'error');
        case 0x1d:
          return new ApduCommandError('MSM controls not set', 'error');
        case 0x1e:
          return new ApduCommandError(
            'Application signature does not exist',
            'error'
          );
        case 0x1f:
          return new ApduCommandError('KTU does not exist', 'error');
        case 0x20:
          return new ApduCommandError('Application not loaded', 'error');
        case 0x21:
          return new ApduCommandError(
            'Invalid Open command data length',
            'error'
          );
        case 0x30:
          return new ApduCommandError(
            'Check data parameter is incorrect (invalid start address)',
            'error'
          );
        case 0x31:
          return new ApduCommandError(
            'Check data parameter is incorrect (invalid length)',
            'error'
          );
        case 0x32:
          return new ApduCommandError(
            'Check data parameter is incorrect (illegal memory check area)',
            'error'
          );
        case 0x40:
          return new ApduCommandError(
            'Invalid MSM Controls ciphertext',
            'error'
          );
        case 0x41:
          return new ApduCommandError('MSM controls already set', 'error');
        case 0x42:
          return new ApduCommandError(
            'Set MSM Controls data length less than 2 bytes',
            'error'
          );
        case 0x43:
          return new ApduCommandError(
            'Invalid MSM Controls data length',
            'error'
          );
        case 0x44:
          return new ApduCommandError(
            'Excess MSM Controls ciphertext',
            'error'
          );
        case 0x45:
          return new ApduCommandError(
            'Verification of MSM Controls data failed',
            'error'
          );
        case 0x50:
          return new ApduCommandError(
            'Invalid MCD Issuer production ID',
            'error'
          );
        case 0x51:
          return new ApduCommandError('Invalid MCD Issuer ID', 'error');
        case 0x52:
          return new ApduCommandError(
            'Invalid set MSM controls data date',
            'error'
          );
        case 0x53:
          return new ApduCommandError('Invalid MCD number', 'error');
        case 0x54:
        case 0x55:
        case 0x56:
        case 0x57:
          return new ApduCommandError('Reserved field error', 'error');
        case 0x60:
          return new ApduCommandError('MAC verification failed', 'error');
        case 0x61:
          return new ApduCommandError(
            'Maximum number of unblocks reached',
            'error'
          );
        case 0x62:
          return new ApduCommandError('Card was not blocked', 'error');
        case 0x63:
          return new ApduCommandError(
            'Crypto functions not available',
            'error'
          );
        case 0x64:
          return new ApduCommandError('No application loaded', 'error');
      }
      break;
  }
};
