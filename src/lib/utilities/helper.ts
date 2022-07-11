"use strict";

/**/
export function debug(level: number, line: string, data: any = null): void {
  const debuglevel = 4;

  if (level <= debuglevel) {
    if (data) {
      console.log(line, data);
    } else {
      console.log(line);
    }
  }
}
