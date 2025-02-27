import { LocaleString } from './locale-string';

export interface ThaiIdAttributes {
  citizenId: string;
  photo: ArrayBuffer;
  prefix: LocaleString;
  firstName: LocaleString;
  middleName: LocaleString;
  lastName: LocaleString;
  dateOfBirth: string;
  sex: string;
  issuer: string;
  issueDate: string;
  expireDate: string;
  houseNo: string;
  villageNo: string;
  lane: string;
  road: string;
  subDistrict: string;
  district: string;
  province: string;
}
