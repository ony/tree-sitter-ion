[
  (null)
  (bool)
] @variable.builtin

[
  (number)
  (infinity)
  (not_a_number)
  (timestamp)
  (blob)
  (clob)
] @number

(field key: (_) @property)
(_ annotation: _ @type)

((symbol) @constant.builtin
 (#match? @constant.builtin "^\\$"))

(symbol) @constant  ; order matters (should be after more specific ones)

(string) @string
(escape) @string.special

(type) @type

(comment) @comment
(operator) @operator

; Punctuations
(sexp "(" @punctuation.bracket (_) ")" @punctuation.bracket)
(list "[" @punctuation.bracket (_) "]" @punctuation.bracket)
(list "," @punctuation.delimiter)
(struct "{" @punctuation.bracket (_) "}" @punctuation.bracket)
(struct "," @punctuation.delimiter)
(field ":" @punctuation.special)
(blob "{{" @punctuation.bracket "}}" @punctuation.bracket)
(clob "{{" @punctuation.bracket "}}" @punctuation.bracket)

(ERROR) @error
