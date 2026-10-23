declare module "pngjs" {
  import type { Buffer } from "node:buffer";
  export class PNG {
    constructor(opts?: { width?: number; height?: number });
    width: number;
    height: number;
    data: Buffer;
    static sync: {
      read(buffer: Buffer): { width: number; height: number; data: Buffer };
      write(png: PNG, opts?: { colorType?: number }): Buffer;
    };
  }
}
