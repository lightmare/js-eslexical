import test from "ava";

import { isHexDigit } from "../lib/index.js";

const charSet = new Set(
  Array.from("0123456789ABCDEFabcdef", c => c.codePointAt(0))
);

test("isHexDigit", t => {
  t.timeout(10);
  // check all possible code points, and then some
  for (let c = 0; c < 0x1100BB; ++c) {
    if (isHexDigit(c) === charSet.has(c)) {
      t.pass();
    } else {
      t.fail(`Failed code point U+${c.toString(16)}`);
      break;
    }
  }
  // str.codePointAt(pos) can return undefined;
  // check that we return false for such input
  t.false(isHexDigit(undefined));
  t.false(isHexDigit(Number.NaN));
});
