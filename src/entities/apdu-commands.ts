import { Transmittable } from './transmittable';

export type ApduSpec = {
  aid: number[];
  [attr: string]: number[] | number[][];
};

export const StandardCommands = {
  Select: [0x00, 0xa4, 0x04, 0x00],
  GetResponse: [0x00, 0xc0, 0x00, 0x00],
} as const;

export const ApduCommands = (
  spec: ApduSpec
): Transmittable & Record<string, number[] | number[][]> => {
  return {
    ...spec,
    select: [...StandardCommands.Select, spec.aid.length, ...spec.aid],
  };
};
