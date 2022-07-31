import { Injectable } from '@nestjs/common';

@Injectable()
export class OutputService {
  write(msg: string) {
    console.log(msg);
  }
  writeJson(val: any) {
    if (process.stdout.isTTY) {
      console.log(val);
    } else {
      console.log(JSON.stringify(val));
    }
  }
}
