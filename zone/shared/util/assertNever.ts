export function assertNever(val: never): never {
  throw new Error(
    `Assert never failed! Value: ${JSON.stringify(val, undefined, 2)}`
  );
}
