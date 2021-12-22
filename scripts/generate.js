import unicode_ID_Start from "@unicode/unicode-14.0.0/Binary_Property/ID_Start/ranges.js"
import unicode_ID_Continue from "@unicode/unicode-14.0.0/Binary_Property/ID_Continue/ranges.js"

const UnicodeRange = unicode_ID_Start[0].constructor
const inclusiveRange = (first, last) => new UnicodeRange(first, last + 1)
const compareRanges = (a, b) => a.begin - b.begin

const startRanges = [
  inclusiveRange(0x0024, 0x0024), // DOLLAR SIGN
  inclusiveRange(0x005F, 0x005F), // LOW LINE
  ...unicode_ID_Start,
].sort(compareRanges)

const partRanges = [
  inclusiveRange(0x0024, 0x0024), // DOLLAR SIGN
  inclusiveRange(0x200C, 0x200D), // ZWNJ .. ZWJ
  ...unicode_ID_Continue,
].sort(compareRanges)

const charCode = s => s[0].charCodeAt(0)
const nextCode = s => s[0].charCodeAt(0) + 1
const min = (a, b) => a < b ? a : b

const FLAG_NONE = 0
const FLAG_PART = 1
const FLAG_START = 2
const NUM_FLAGGED_CHARS = 0x30000 // must be a multiple of 16


function joinIndented(...args) {
  return String.raw(...args).replace(/\n\s+/g, " ")
}


// Convert an array of sorted, disjoint UnicodeRange objects
// into flat array of boundary points.
// Included code point intervals begin at even positions.
// Excluded code point intervals begin at odd positions.
function flattenIntervals(ranges, start = 0, end = ranges.length) {
  const result = []
  for (let i = start; i < end; ++i) {
    const { begin, end } = ranges[i]
    result.push(begin, end)
  }
  return result
}


// Construct a binary search expression from an array of sorted
// interval boundary points. The first point is considered to be
// the lower bound of search domain, and so will not be checked.
function* emitComparisonTree(indent, param, points) {
  const stack = []

  const comp = index => index & 1
    ? `${ param } < ${ points[index] }`
    : `${ points[index] } <= ${ param }`

  const comp_eq = index => index & 1
    ? `${ param } !== ${ points[index] }`
    : `${ param } === ${ points[index] }`

  const comp_op = index => index & 1
    ? `${ param } < ${ points[index] } || `
    : `${ points[index] } <= ${ param } && `

  for (let lo = 1, hi = points.length; ; ) {
    let mid = (lo + hi) >> 1
    if (hi - lo >= 3) {
      stack.push(indent += 2, mid + 1, hi)
      yield `${ param } < ${ points[mid] }\n`
      yield "? ".padStart(indent)
      hi = mid
      continue
    }
    if (lo < mid && points[lo - 1] === points[mid] - 2) {
      yield comp_op(mid)
      mid = (++lo + hi) >> 1
    }
    switch (hi - lo) {
      case 2:
        if (points[lo] + 1 === points[lo + 1]) {
          yield comp_eq(lo)
        } else {
          yield comp_op(lo) + comp(mid)
        }
        break
      case 1:
        yield comp(lo)
        break
      default:
        yield `${ !!(lo & 1) }`
    }
    yield "\n"
    if (!stack.length) {
      break
    }
    hi = stack.pop()
    lo = stack.pop()
    indent = stack.pop()
    yield ": ".padStart(indent)
  }
}


function* emitIdentifierFlags() {
  const steps = []

  for (let next = 0, si = 0, pi = 0; pi < partRanges.length; ) {
    const part = partRanges[pi]
    if (part.end <= next) {
      ++pi
      continue
    }
    const start = startRanges[si] || {}
    if (start.end <= next) {
      ++si
      continue
    }
    const first = min(start.begin, part.begin)
    if (first >= NUM_FLAGGED_CHARS) {
      break
    }
    if (next < first) {
      steps.push((first - next - 1) << 2 | FLAG_NONE)
      next = first
    }
    const prev = next
    if (prev !== start.begin) {
      next = min(start.begin, part.end)
      steps.push((next - prev - 1) << 2 | FLAG_PART)
    } else {
      next = min(start.end, part.end)
      steps.push((next - prev - 1) << 2 | FLAG_PART | FLAG_START)
    }
  }

  yield `
/** @type {(bits: Uint32Array, runs: number[]) => void} */
const _initBitField = (bits, runs) => {
  for (let next = 0, i = 0; i < runs.length; ++i) {
    let cur = next++, flg = runs[i]
    next += flg >> 2
    if (!(flg &= 3)) {
      continue
    }
    flg *= 0x55555555
    if (cur & 15) {
      let f = flg << (cur << 1 & 30)
      cur |= 15
      if (++cur >= next) {
        bits[cur - 1 >> 4] |= f & f >>> (cur - next << 1)
        continue
      }
      bits[cur - 1 >> 4] |= f
    }
    if (cur < (next & ~15)) {
      bits.fill(flg, cur >> 4, next >> 4)
    }
    if (next & 15) {
      bits[next >> 4] = flg >>> (32 - (next << 1 & 30))
    }
  }
}

const _flags = new Uint32Array(${ NUM_FLAGGED_CHARS / 16 })

_initBitField(_flags, [
  ${ steps }
])
`
}


// https://tc39.es/ecma262/multipage/ecmascript-language-lexical-grammar.html
// #sec-line-terminators

function* emitLineTerminatorCheck(name) {
  yield joinIndented`
/** @type {(codePoint: number) => boolean} */
export const is${ name } = c =>
  c === ${ 0x000A /*LF*/ } ||
  c === ${ 0x000D /*CR*/ } ||
  c === ${ 0x2028 /*LS*/ } ||
  c === ${ 0x2029 /*PS*/ }
`
}


// https://tc39.es/ecma262/multipage/ecmascript-language-lexical-grammar.html
// #sec-literals-numeric-literals

function* emitDigitCheck(name, base) {
  yield joinIndented`
/** @type {(codePoint: number) => boolean} */
export const is${ name } = c =>
  ${ charCode`0` } <= c && c < ${ charCode`0` + base }
`
}

function* emitHexDigitCheck(name) {
  yield joinIndented`
/** @type {(codePoint: number) => boolean} */
export const is${ name } = c =>
  c < ${ charCode`A` }
    ? ${ charCode`0` } <= c && c < ${ nextCode`9` }
    : c < ${ charCode`a` }
      ? c < ${ nextCode`F` }
      : c < ${ nextCode`f` }
`
}


// https://tc39.es/ecma262/multipage/ecmascript-language-lexical-grammar.html
// #sec-white-space

function* emitWhiteSpaceCheck(name) {
  yield `
/** @type {(codePoint: number) => boolean} */
export const is${ name } = c => c < ${ 0xA0 }
  ? c < ${ 0x0D }
    ? c === ${ 0x09 /*TAB*/ } || ${ 0x0B /*VT..FF*/ } <= c
    : c === ${ 0x20 /*SPACE*/ }
  : c < ${ 0x200B }
    ? c === ${ 0xA0 /*NO-BREAK SPACE*/ } ||
      c === ${ 0x1680 /*OGHAM SPACE MARK*/ } ||
      ${ 0x2000 /*EN QUAD..HAIR_SPACE*/ } <= c
    : c === ${ 0x202F /*NARROW NO-BREAK SPACE*/ } ||
      c === ${ 0x205F /*MEDIUM MATHEMATICAL SPACE*/ } ||
      c === ${ 0x3000 /*IDEOGRAPHIC SPACE*/ } ||
      c === ${ 0xFEFF /*ZERO WIDTH NO-BREAK SPACE*/ }
`.replace(/\|\|\n\s+/g, "|| ")
}


// https://tc39.es/ecma262/multipage/ecmascript-language-lexical-grammar.html
// #sec-names-and-keywords

function* emitIdentifierStartCheck(name) {
  yield `
/** @type {(codePoint: number) => boolean} */
export const is${ name } = c => c < ${ NUM_FLAGGED_CHARS }
  ? !!(_flags[c >> 4] & ${ FLAG_START } << (c << 1 & 30))
  : `
  const highOffset = startRanges.findIndex(r => r.begin >= NUM_FLAGGED_CHARS)
  const highPoints = flattenIntervals(startRanges, highOffset)
  yield* emitComparisonTree(4, "c", highPoints)
}

function* emitIdentifierPartCheck(name) {
  yield `
/** @type {(codePoint: number) => boolean} */
export const is${ name } = c => c < ${ NUM_FLAGGED_CHARS }
  ? !!(_flags[c >> 4] & ${ FLAG_PART } << (c << 1 & 30))
  : `
  const highOffset = partRanges.findIndex(r => r.begin >= NUM_FLAGGED_CHARS)
  const highPoints = flattenIntervals(partRanges, highOffset)
  yield* emitComparisonTree(4, "c", highPoints)
}


function* generateChunks() {
  yield `\
// auto-generated
`
  yield* emitLineTerminatorCheck("LineTerminator")
  yield* emitWhiteSpaceCheck("WhiteSpace")
  yield* emitDigitCheck("BinaryDigit", 2)
  yield* emitDigitCheck("OctalDigit", 8)
  yield* emitDigitCheck("DecimalDigit", 10)
  yield* emitHexDigitCheck("HexDigit")
  yield* emitIdentifierStartCheck("IdentifierStart")
  yield* emitIdentifierPartCheck("IdentifierPart")
  yield* emitIdentifierFlags()
}


for (let chunk of generateChunks()) {
  process.stdout.write(chunk)
}
