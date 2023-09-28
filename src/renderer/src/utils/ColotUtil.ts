import tinycolor from 'tinycolor2';

/**
 * 背景色から最適なテキストの色（白 or 黒）を決定する
 * @param backgroundColor - 背景色
 * @returns "black" または "white"
 */
export const getOptimalTextColor = (backgroundColor: string): string => {
  const color = tinycolor(backgroundColor);
  const rgb = color.toRgb();

  // 輝度を計算（sRGB空間での計算）
  const luminance = (0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b) / 255;

  return luminance >= 0.5 ? '#000000' : '#FFFFFF';
};
