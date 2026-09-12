export class HonoResponse<T> {
  public success: boolean;
  public message: string;
  public payload: T;

  constructor(info: { success: boolean; message: string; payload: T }) {
    this.success = info.success;
    this.message = info.message;
    this.payload = info.payload;
  }
}
