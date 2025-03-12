import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import {
  cleanUpFieldBuffer,
  scanThaiIdCard,
  standardizeThaiDate,
  ThaiIdCardApduCommands,
  ThaiIdCardApduSpec,
} from './thai-id-card';
import { ApduCommands } from '../entities';

describe('ThaiIdCardApduSpec', () => {
  it('contains correct bytes spec', () => {
    expect(ThaiIdCardApduSpec.aid).toEqual([
      0xa0, 0x00, 0x00, 0x00, 0x54, 0x48, 0x00, 0x01,
    ]);
    expect(ThaiIdCardApduSpec.citizenId).toEqual([
      0x80, 0xb0, 0x00, 0x04, 0x02, 0x00, 0x0d,
    ]);
    expect(ThaiIdCardApduSpec.fullNameTh).toEqual([
      0x80, 0xb0, 0x00, 0x11, 0x02, 0x00, 0x64,
    ]);
    expect(ThaiIdCardApduSpec.fullNameEn).toEqual([
      0x80, 0xb0, 0x00, 0x75, 0x02, 0x00, 0x64,
    ]);
    expect(ThaiIdCardApduSpec.dateOfBirth).toEqual([
      0x80, 0xb0, 0x00, 0xd9, 0x02, 0x00, 0x08,
    ]);
    expect(ThaiIdCardApduSpec.sex).toEqual([
      0x80, 0xb0, 0x00, 0xe1, 0x02, 0x00, 0x01,
    ]);
    expect(ThaiIdCardApduSpec.issuer).toEqual([
      0x80, 0xb0, 0x00, 0xf6, 0x02, 0x00, 0x64,
    ]);
    expect(ThaiIdCardApduSpec.dateOfIssue).toEqual([
      0x80, 0xb0, 0x01, 0x67, 0x02, 0x00, 0x08,
    ]);
    expect(ThaiIdCardApduSpec.dateOfExpiry).toEqual([
      0x80, 0xb0, 0x01, 0x6f, 0x02, 0x00, 0x08,
    ]);
    expect(ThaiIdCardApduSpec.address).toEqual([
      0x80, 0xb0, 0x15, 0x79, 0x02, 0x00, 0x64,
    ]);
    expect(ThaiIdCardApduSpec.photos).toEqual([
      [0x80, 0xb0, 0x01, 0x7b, 0x02, 0x00, 0xff],
      [0x80, 0xb0, 0x02, 0x7a, 0x02, 0x00, 0xff],
      [0x80, 0xb0, 0x03, 0x79, 0x02, 0x00, 0xff],
      [0x80, 0xb0, 0x04, 0x78, 0x02, 0x00, 0xff],
      [0x80, 0xb0, 0x05, 0x77, 0x02, 0x00, 0xff],
      [0x80, 0xb0, 0x06, 0x76, 0x02, 0x00, 0xff],
      [0x80, 0xb0, 0x07, 0x75, 0x02, 0x00, 0xff],
      [0x80, 0xb0, 0x08, 0x74, 0x02, 0x00, 0xff],
      [0x80, 0xb0, 0x09, 0x73, 0x02, 0x00, 0xff],
      [0x80, 0xb0, 0x0a, 0x72, 0x02, 0x00, 0xff],
      [0x80, 0xb0, 0x0b, 0x71, 0x02, 0x00, 0xff],
      [0x80, 0xb0, 0x0c, 0x70, 0x02, 0x00, 0xff],
      [0x80, 0xb0, 0x0d, 0x6f, 0x02, 0x00, 0xff],
      [0x80, 0xb0, 0x0e, 0x6e, 0x02, 0x00, 0xff],
      [0x80, 0xb0, 0x0f, 0x6d, 0x02, 0x00, 0xff],
      [0x80, 0xb0, 0x10, 0x6c, 0x02, 0x00, 0xff],
      [0x80, 0xb0, 0x11, 0x6b, 0x02, 0x00, 0xff],
      [0x80, 0xb0, 0x12, 0x6a, 0x02, 0x00, 0xff],
      [0x80, 0xb0, 0x13, 0x69, 0x02, 0x00, 0xff],
      [0x80, 0xb0, 0x14, 0x68, 0x02, 0x00, 0xff],
    ]);
  });
});

describe('ApduCommands', () => {
  it('has select function return correct command', () => {
    expect(ApduCommands(ThaiIdCardApduSpec)).toEqual(ThaiIdCardApduCommands);

    expect(ThaiIdCardApduCommands.select).toEqual([
      // select command
      0x00, 0xa4, 0x04, 0x00,
      // aid length
      8,
      // aid
      0xa0, 0x00, 0x00, 0x00, 0x54, 0x48, 0x00, 0x01,
    ]);
  });
});

describe('cleanUpFieldBuffer', () => {
  it('clear dirty spaces', () => {
    expect(cleanUpFieldBuffer(Buffer.from('cleaned  dirty'))).toEqual(
      Buffer.from('cleaned')
    );
  });
});

describe('standardizeThaiDate', () => {
  it('format correctly', () => {
    expect(standardizeThaiDate('25681231')).toEqual('2025-12-31');
    expect(standardizeThaiDate('25680101')).toEqual('2025-01-01');
  });
});

describe('scanThaiIdCard', () => {
  const citizenId = '1234567890123';
  const dirtyFullNameTh = 'นาย#สธนะ##จารุวิจิตรรัตนา    abcd';
  const cleanedFullNameTh = 'นาย#สธนะ##จารุวิจิตรรัตนา';
  const dirtyFullNameEn = 'Mr.#Satana##Charuwichitratana    1234';
  const cleanedFullNameEn = 'Mr.#Satana##Charuwichitratana';
  const bDateOfBirth = '24750101';
  const gDateOfBirth = '1932-01-01';
  const bDateOfIssue = '24750202';
  const gDateOfIssue = '1932-02-02';
  const bDateOfExpiry = '24750303';
  const gDateOfExpiry = '1932-03-03';
  const dirtyAddress = 'ก#ข#ค#ง#จ#ฉ#ช    ฟหกด ่าสว';
  const cleanedAddress = 'ก#ข#ค#ง#จ#ฉ#ช';
  const sex = '1';
  const issuer = 'เจ้าหน้าที่';
  const transmit = vi.fn();
  const decode = vi.fn();

  describe('when select response returns with TH', () => {
    beforeAll(() => {
      transmit.mockResolvedValueOnce(Buffer.from(' TH '));
      transmit.mockResolvedValueOnce(Buffer.from(citizenId));
      transmit.mockResolvedValueOnce(Buffer.from(dirtyFullNameTh));
      transmit.mockResolvedValueOnce(Buffer.from(dirtyFullNameEn));
      transmit.mockResolvedValueOnce(Buffer.from(bDateOfBirth));
      transmit.mockResolvedValueOnce(Buffer.from(sex));
      transmit.mockResolvedValueOnce(Buffer.from(issuer));
      transmit.mockResolvedValueOnce(Buffer.from(bDateOfIssue));
      transmit.mockResolvedValueOnce(Buffer.from(bDateOfExpiry));
      transmit.mockResolvedValueOnce(Buffer.from(dirtyAddress));
      for (let i = 0; i < ThaiIdCardApduCommands.photos.length; i++) {
        transmit.mockResolvedValueOnce(Buffer.from(''));
      }
      decode.mockReturnValueOnce(cleanedFullNameTh);
      decode.mockReturnValueOnce(issuer);
      decode.mockReturnValueOnce(cleanedAddress);
    });

    it('read Thai ID Card', async () => {
      const card = await scanThaiIdCard(transmit, decode);
      expect(transmit).toHaveBeenNthCalledWith(
        1,
        ThaiIdCardApduCommands.select
      );
      expect(transmit).toHaveBeenNthCalledWith(
        2,
        ThaiIdCardApduCommands.citizenId
      );
      expect(decode).toHaveBeenNthCalledWith(
        1,
        Buffer.from(cleanedFullNameTh),
        'tis620'
      );
      expect(transmit).toHaveBeenNthCalledWith(
        3,
        ThaiIdCardApduCommands.fullNameTh
      );
      expect(transmit).toHaveBeenNthCalledWith(
        4,
        ThaiIdCardApduCommands.fullNameEn
      );
      expect(decode).toHaveBeenNthCalledWith(2, Buffer.from(issuer), 'tis620');
      expect(decode).toHaveBeenNthCalledWith(
        3,
        Buffer.from(cleanedAddress),
        'tis620'
      );

      expect(card?.citizenId).toEqual(citizenId);
      expect(card?.prefix.th).toEqual(cleanedFullNameTh.split('#')[0]);
      expect(card?.prefix.en).toEqual(cleanedFullNameEn.split('#')[0]);
      expect(card?.firstName.th).toEqual(cleanedFullNameTh.split('#')[1]);
      expect(card?.firstName.en).toEqual(cleanedFullNameEn.split('#')[1]);
      expect(card?.lastName.th).toEqual(cleanedFullNameTh.split('#')[3]);
      expect(card?.lastName.en).toEqual(cleanedFullNameEn.split('#')[3]);
      expect(card?.dateOfBirth).toEqual(gDateOfBirth);
      expect(card?.dateOfIssue).toEqual(gDateOfIssue);
      expect(card?.dateOfExpiry).toEqual(gDateOfExpiry);
      expect(card?.sex).toEqual(sex);
      expect(card?.issuer).toEqual(issuer);
    });

    afterAll(() => {
      vi.restoreAllMocks();
    });
  });
});
