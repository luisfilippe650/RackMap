export function defaultColumnCode(index: number) {
  const firstCharCode = 'A'.charCodeAt(0);
  const first = Math.floor(index / 26);
  const second = index % 26;

  return `${String.fromCharCode(firstCharCode + first)}${String.fromCharCode(firstCharCode + second)}`;
}

export function defaultRowCode(index: number, rowCount: number) {
  return String(rowCount - index);
}
