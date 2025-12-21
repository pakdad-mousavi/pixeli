export class MergeError {
  constructor(public type: 'validation' | 'image' | 'internal', public message: string) {}
}