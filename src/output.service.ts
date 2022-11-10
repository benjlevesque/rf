import { Injectable } from '@nestjs/common';
import { hideBin } from 'yargs/helpers';
import Parser from 'yargs-parser';

@Injectable()
export class OutputService {
  private readonly forceJson: boolean;
  constructor() {
    const args = Parser(hideBin(process.argv));
    this.forceJson = args.json || args.format === 'json';
  }
  write(msg: string) {
    console.log(msg);
  }
  writeJson(val: any) {
    if (process.stdout.isTTY && !this.forceJson) {
      console.log(val);
    } else {
      console.log(JSON.stringify(val));
    }
  }
}
