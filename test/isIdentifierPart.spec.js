import test from "ava";
import unicode_ID_Continue from "@unicode/unicode-14.0.0/Binary_Property/ID_Continue/code-points.js";

import { isIdentifierPart } from "../lib/index.js";

const charSet = new Set(unicode_ID_Continue);
charSet.add(0x0024); // DOLLAR SIGN
charSet.add(0x005F); // LOW LINE
charSet.add(0x200C); // ZERO WIDTH NON-JOINER (ZWNJ)
charSet.add(0x200D); // ZERO WIDTH JOINER (ZWJ)

test("isIdentifierPart", t => {
  t.timeout(10);
  // check all possible code points, and then some
  for (let c = 0; c < 0x1100BB; ++c) {
    if (isIdentifierPart(c) === charSet.has(c)) {
      t.pass();
    } else {
      t.fail(`Failed code point U+${c.toString(16)}`);
      break;
    }
  }
  // str.codePointAt(pos) can return undefined;
  // check that we return false for such input
  t.false(isIdentifierPart(undefined));
  t.false(isIdentifierPart(Number.NaN));
});
