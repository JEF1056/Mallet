export function FindFirstNonContinouous(sortedArray: number[]) {
  for (let i = 0; i < sortedArray.length; i++) {
    if (sortedArray[i] !== i) {
      return i;
    }
  }
  return sortedArray.length;
}
