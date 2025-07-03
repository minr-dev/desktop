/**
 * 2つの時間帯が重なる時間を計算します。
 *
 * @returns {number} 2つの時間帯で重なった時間(ms)
 */
export const calculateOverlapTime = (
  start1: Date | null | undefined,
  end1: Date | null | undefined,
  start2: Date | null | undefined,
  end2: Date | null | undefined
): number => {
  if (!start1 || !end1 || !start2 || !end2) {
    return 0;
  }
  const start = start1 > start2 ? start1 : start2;
  const end = end1 < end2 ? end1 : end2;
  const diffMs = end.getTime() - start.getTime();
  return diffMs >= 0 ? diffMs : 0;
};
