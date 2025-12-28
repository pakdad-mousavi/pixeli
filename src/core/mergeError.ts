interface Context {
  type: 'validation' | 'image' | 'internal';
  cause?: any;
}

export class MergeError extends Error {
  public readonly context: Context;

  constructor(message: string, context: Context) {
    super(message);

    this.name = 'MergeError';
    this.context = context;

    // Fix prototype chain
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
