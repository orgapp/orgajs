/** @type {new (code: string, ...args: Array<unknown>) => Function} **/
const AsyncFunction = Object.getPrototypeOf(run).constructor

/**
 * Asynchronously run code.
 */
export async function run(file: { toString(): string }, options: unknown) {
  return new AsyncFunction(String(file))(options)
}

/**
 * Synchronously run code.
 */
export function runSync(file: { toString(): string }, options: unknown) {
  return new Function(String(file))(options)
}
