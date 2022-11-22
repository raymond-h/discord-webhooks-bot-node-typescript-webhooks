declare module 'nearest-string' {
  export interface NearestStringResult {
    key: number;
    value: string;
    distance: number;
    distances: number[];
  }

  export default function (
    xs: string[],
    x: string,
    caseInsensitive?: boolean = false
  ): NearestStringResult;
}
