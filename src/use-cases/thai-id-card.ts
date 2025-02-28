import crypto from 'crypto';

import {
  ApduCommands,
  ApduSpec,
  Identifiable,
  LocaleString,
} from '../entities';

export interface ThaiIdAttributes {
  citizenId: string;
  prefix: LocaleString;
  firstName: LocaleString;
  middleName: LocaleString;
  lastName: LocaleString;
  dateOfBirth: string;
  sex: string;
  issuer: string;
  dateOfIssue: string;
  dateOfExpiry: string;
  houseNo: string;
  villageNo: string;
  lane: string;
  road: string;
  subdistrict: string;
  district: string;
  province: string;
  /**
   * Base64 encoded photo
   */
  photo: string;
}

export type ThaiIdCard = Identifiable<ThaiIdAttributes>;

export const ThaiIdCardApduSpec: ApduSpec = {
  aid: [0xa0, 0x00, 0x00, 0x00, 0x54, 0x48, 0x00, 0x01],
  citizenId: [0x80, 0xb0, 0x00, 0x04, 0x02, 0x00, 0x0d],
  fullNameTh: [0x80, 0xb0, 0x00, 0x11, 0x02, 0x00, 0x64],
  fullNameEn: [0x80, 0xb0, 0x00, 0x75, 0x02, 0x00, 0x64],
  dateOfBirth: [0x80, 0xb0, 0x00, 0xd9, 0x02, 0x00, 0x08],
  sex: [0x80, 0xb0, 0x00, 0xe1, 0x02, 0x00, 0x01],
  issuer: [0x80, 0xb0, 0x00, 0xf6, 0x02, 0x00, 0x64],
  dateOfIssue: [0x80, 0xb0, 0x01, 0x67, 0x02, 0x00, 0x08],
  dateOfExpiry: [0x80, 0xb0, 0x01, 0x6f, 0x02, 0x00, 0x08],
  address: [0x80, 0xb0, 0x15, 0x79, 0x02, 0x00, 0x64],
  photos: [
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
  ],
};

export const ThaiIdCardApduCommands = ApduCommands(ThaiIdCardApduSpec);

const cleanUpFieldBuffer = (buffer: Buffer) => {
  const uncleanedIndex = buffer.indexOf('  ');

  return buffer.subarray(0, uncleanedIndex);
};

/**
 *
 * @param thaiDate date read from Thai ID Card in yyyymmdd format
 */
const standardizeThaiDate = (thaiDate: string) => {
  const yyyy = +thaiDate.substring(0, 4) - 543;
  const mm = thaiDate.substring(4, 6).padStart(2, '0');
  const dd = thaiDate.substring(6, 8).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export const scanThaiIdCard = async (
  transmit: (
    data: number[],
    resultLength?: number
  ) => Promise<Buffer<ArrayBufferLike>>,
  decode: (buffer: Buffer, encoding: string) => string
) => {
  const selectBuffer = (await transmit(
    ThaiIdCardApduCommands.select
  )) as Buffer<ArrayBufferLike>;

  // If it's Thai ID Card
  if (selectBuffer.toString().includes('TH')) {
    let buffer = await transmit(ThaiIdCardApduCommands.citizenId as number[]);
    const citizenId = buffer.toString().trim();

    buffer = await transmit(ThaiIdCardApduCommands.fullNameTh as number[]);
    const fullNameTh = decode(cleanUpFieldBuffer(buffer), 'tis620')
      .toString()
      .trim();
    const [prefixTh, firstNameTh, middleNameTh, lastNameTh] =
      fullNameTh.split('#');
    const prefix: LocaleString = {
      th: prefixTh,
    };
    const firstName: LocaleString = {
      th: firstNameTh,
    };
    const middleName: LocaleString = {
      th: middleNameTh,
    };
    const lastName: LocaleString = {
      th: lastNameTh,
    };

    buffer = await transmit(ThaiIdCardApduCommands.fullNameEn as number[]);
    const fullNameEn = cleanUpFieldBuffer(buffer).toString().trim();
    const [prefixEn, firstNameEn, middleNameEn, lastNameEn] =
      fullNameEn.split('#');
    prefix.en = prefixEn;
    firstName.en = firstNameEn;
    middleName.en = middleNameEn;
    lastName.en = lastNameEn;

    buffer = await transmit(ThaiIdCardApduCommands.dateOfBirth as number[]);
    const dateOfBirth = standardizeThaiDate(buffer.toString().trim());

    buffer = await transmit(ThaiIdCardApduCommands.sex as number[]);
    const sex = buffer.toString().trim();

    buffer = await transmit(ThaiIdCardApduCommands.issuer as number[]);
    const issuer = decode(cleanUpFieldBuffer(buffer), 'tis620')
      .toString()
      .trim();

    buffer = await transmit(ThaiIdCardApduCommands.dateOfIssue as number[]);
    const dateOfIssue = standardizeThaiDate(buffer.toString().trim());

    buffer = await transmit(ThaiIdCardApduCommands.dateOfExpiry as number[]);
    const dateOfExpiry = standardizeThaiDate(buffer.toString().trim());

    buffer = await transmit(ThaiIdCardApduCommands.address as number[]);
    const [houseNo, villageNo, lane, road, , subdistrict, district, province] =
      decode(cleanUpFieldBuffer(buffer), 'tis620').toString().trim().split('#');
    let photoBuffer = Buffer.from([]);

    for (let i = 0; i < ThaiIdCardApduCommands.photos.length; i++) {
      const photoApdu = ThaiIdCardApduCommands.photos[i];

      buffer = await transmit(photoApdu as number[]);
      const tmp = new Uint8Array(photoBuffer.byteLength + buffer.byteLength);
      tmp.set(new Uint8Array(photoBuffer), 0);
      tmp.set(new Uint8Array(buffer), photoBuffer.byteLength);

      photoBuffer = Buffer.concat([photoBuffer, buffer]);
    }

    const photo = photoBuffer.toString('base64');

    const card: ThaiIdCard = {
      uid: crypto.createHash('md5').update(citizenId).digest('hex').toString(),
      citizenId,
      prefix,
      firstName,
      middleName,
      lastName,
      dateOfBirth,
      sex,
      issuer,
      dateOfIssue,
      dateOfExpiry,
      houseNo,
      villageNo,
      lane,
      road,
      subdistrict,
      district,
      province,
      photo,
    };

    return card;
  }
};
