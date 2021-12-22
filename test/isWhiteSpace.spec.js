import test from "ava";
import unicode_Space_Separator from "@unicode/unicode-14.0.0/General_Category/Space_Separator/code-points.js";

import { isWhiteSpace } from "../lib/index.js";

const charSet = new Set(unicode_Space_Separator);
charSet.add(0x0009); // CHARACTER TABULATION (TAB)
charSet.add(0x000B); // LINE TABULATION (VT)
charSet.add(0x000C); // FORM FEED (FF)
charSet.add(0xFEFF); // ZERO WIDTH NO-BREAK SPACE (ZWNBSP)

test("isWhiteSpace", t => {
  t.timeout(10);
  // check all possible code points, and then some
  for (let c = 0; c < 0x1100BB; ++c) {
    if (isWhiteSpace(c) === charSet.has(c)) {
      t.pass();
    } else {
      t.fail(`Failed code point U+${c.toString(16)}`);
      break;
    }
  }
  // str.codePointAt(pos) can return undefined;
  // check that we return false for such input
  t.false(isWhiteSpace(undefined));
  t.false(isWhiteSpace(Number.NaN));
});
