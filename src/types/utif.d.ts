declare module "utif" {
  interface IFD {
    width: number;
    height: number;
    data?: Uint8Array;
    [key: string]: unknown;
  }
  export function decode(buffer: ArrayBuffer | Uint8Array): IFD[];
  export function decodeImage(buffer: ArrayBuffer | Uint8Array, ifd: IFD, ifds: IFD[]): void;
  export function toRGBA8(ifd: IFD): Uint8Array;
  export function encode(ifds: IFD[]): Uint8Array;
  export function encodeImage(rgba: Uint8Array, w: number, h: number, metadata?: unknown): Uint8Array;
}