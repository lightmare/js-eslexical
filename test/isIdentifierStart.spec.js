import test from "ava";
import unicode_ID_Start from "@unicode/unicode-14.0.0/Binary_Property/ID_Start/code-points.js";

import { isIdentifierStart } from "../lib/index.js";

const charSet = new Set(unicode_ID_Start);
charSet.add(0x0024); // DOLLAR SIGN
charSet.add(0x005F); // LOW LINE

test("isIdentifierStart", t => {
  t.timeout(10);
  // check all possible code points, and then some
  for (let c = 0; c < 0x1100BB; ++c) {
    if (isIdentifierStart(c) === charSet.has(c)) {
      t.pass();
    } else {
      t.fail(`Failed code point U+${c.toString(16)}`);
      break;
    }
  }
  // str.codePointAt(pos) can return undefined;
  // check that we return false for such input
  t.false(isIdentifierStart(undefined));
  t.false(isIdentifierStart(Number.NaN));
});
