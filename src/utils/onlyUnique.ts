export function onlyUnique(value: any, index: any, self: string | any[]) {
  return self.indexOf(value) === index;
}