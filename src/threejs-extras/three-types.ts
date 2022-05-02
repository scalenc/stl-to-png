export interface ThreeLight {
  readonly isLight: true;
}

export interface ThreeMaterial {
  readonly isMaterial: true;
}

export interface ThreeTexture {
  readonly isTexture: true;
}

export enum ThreeMapping {
  UV,
  CubeReflection,
  CubeRefraction,
  EquirectangularReflection,
  EquirectangularRefraction,
  CubeUVReflection,
}

export interface ThreeColor {
  readonly isColor: true;
  /**
   * Red channel value between 0 and 1. Default is 1.
   * @default 1
   */
  r: number;

  /**
   * Green channel value between 0 and 1. Default is 1.
   * @default 1
   */
  g: number;

  /**
   * Blue channel value between 0 and 1. Default is 1.
   * @default 1
   */
  b: number;
}

export type ThreeColorRepresentation = ThreeColor | string | number;
