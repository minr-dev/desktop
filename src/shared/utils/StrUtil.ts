/**
 * 文字列がnull、undefined、空、または空白のみで構成されているかどうかを判断します。
 * この実装はcommons-langのisBlankに近い動作をするように意図されています。
 *
 * @param {string | null | undefined} str - 検査する文字列
 * @return {boolean} 文字列が空白であればtrue, そうでなければfalse
 */
export const isBlank = (str: string | null | undefined): boolean => {
  return !str || /^\s*$/.test(str);
};
