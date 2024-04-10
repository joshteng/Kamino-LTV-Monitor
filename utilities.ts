export class TimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export async function timeOutPromise<T>(
  ms: number,
  reason?: string
): Promise<T> {
  return new Promise<T>((_, reject) => {
    setTimeout(() => {
      reject(new TimeoutError(reason ?? "timed out"));
    }, ms);
  });
}
