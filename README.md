# ES lexical

Utility library for ECMAScript parsers.

`eslexical` provides an alternative implementation of [esutils.code](
https://www.npmjs.com/package/esutils#code
) functions.
The main difference is that `esutils` convert non-ASCII argument code points
to strings (testing those with regular expressions), whereas `eslexical` works
exclusively with numbers (combining binary search and bit field lookup).

Character data generated from [@unicode/unicode-14.0.0](
https://www.npmjs.com/package/@unicode/unicode-14.0.0#readme
)

## Functions


### `isWhiteSpace`

```ts
isWhiteSpace: (codePoint: number) => boolean
```

Return `true` if the `codePoint` is a [White Space](
https://tc39.es/ecma262/multipage/ecmascript-language-lexical-grammar.html#sec-white-space
), `false` otherwise.

* any code point from the Unicode category `Space_Separator`
* `U+0009` — CHARACTER TABULATION
* `U+000B` — LINE TABULATION
* `U+000C` — FORM FEED
* `U+0020` — SPACE
* `U+00A0` — NO-BREAK SPACE
* `U+FEFF` — ZERO WIDTH NO-BREAK SPACE


### `isLineTerminator`

```ts
isLineTerminator: (codePoint: number) => boolean
```

Return `true` if the `codePoint` is a [Line Terminator](
https://tc39.es/ecma262/multipage/ecmascript-language-lexical-grammar.html#sec-line-terminators
), `false` otherwise.

* `U+000A` — LINE FEED
* `U+000D` — CARRIAGE RETURN
* `U+2028` — LINE SEPARATOR
* `U+2029` — PARAGRAPH SEPARATOR


### `isIdentifierStart`

```ts
isIdentifierStart: (codePoint: number) => boolean
```

Return `true` if the `codePoint` can start an [Identifier Name](
https://tc39.es/ecma262/multipage/ecmascript-language-lexical-grammar.html#sec-names-and-keywords
), `false` otherwise.

* any code point with the Unicode property `ID_Start`
* `U+0024` — DOLLAR SIGN
* `U+005F` — LOW LINE


### `isIdentifierPart`

```ts
isIdentifierPart: (codePoint: number) => boolean
```

Return `true` if the `codePoint` can appear in [Identifier Name](
https://tc39.es/ecma262/multipage/ecmascript-language-lexical-grammar.html#sec-names-and-keywords
), `false` otherwise.

* any code point with the Unicode property `ID_Continue`
* `U+0024` — DOLLAR SIGN
* `U+200C` — ZERO WIDTH NON-JOINER
* `U+200D` — ZERO WIDTH JOINER


### `isDecimalDigit`

```ts
isDecimalDigit: (codePoint: number) => boolean
```

Return `true` if the `codePoint` is a [Decimal Digit](
https://tc39.es/ecma262/multipage/ecmascript-language-lexical-grammar.html#prod-DecimalDigit
), `false` otherwise.

* any of `0` `1` `2` `3` `4` `5` `6` `7` `8` `9`


### `isBinaryDigit`

```ts
isBinaryDigit: (codePoint: number) => boolean
```

Return `true` if the `codePoint` is a [Binary Digit](
https://tc39.es/ecma262/multipage/ecmascript-language-lexical-grammar.html#prod-BinaryDigit
), `false` otherwise.

* any of `0` `1`


### `isOctalDigit`

```ts
isOctalDigit: (codePoint: number) => boolean
```

Return `true` if the `codePoint` is an [Octal Digit](
https://tc39.es/ecma262/multipage/ecmascript-language-lexical-grammar.html#prod-OctalDigit
), `false` otherwise.

* any of `0` `1` `2` `3` `4` `5` `6` `7`


### `isHexDigit`

```ts
isHexDigit: (codePoint: number) => boolean
```

Return `true` if the `codePoint` is a [Hexadecimal Digit](
https://tc39.es/ecma262/multipage/ecmascript-language-lexical-grammar.html#prod-HexDigit
), `false` otherwise.

* any of `0` `1` `2` `3` `4` `5` `6` `7` `8` `9` `A` `B` `C` `D` `E` `F` `a` `b` `c` `d` `e` `f`


## Related

* [esutils](https://github.com/estools/esutils#readme)
  — utility box for ECMAScript language tools
* [node-unicode-data](https://github.com/node-unicode/node-unicode-data#readme)
  — JavaScript-compatible Unicode data generator
