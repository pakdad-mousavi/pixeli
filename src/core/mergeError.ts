interface Context {
  type: 'validation' | 'image' | 'internal';
  cause?: string;
}

export class MergeError extends Error {
  constructor(public message: string, public context: Context) {
    super(message);
  }
}
