; Neovim version of highlights.
; Order matters and apparently later ones override previous ones in Neovim.
; For mapping of captures to highlighting see `:he nvim-treesitter-highlights` and:
;   https://github.com/nvim-treesitter/nvim-treesitter/blob/master/lua/nvim-treesitter/highlight.lua
;
; Beside that Noevim plugin doesn't follow semantic of "longest match", but requires exact match
;  https://github.com/nvim-treesitter/nvim-treesitter/issues/738

(null) @constant.builtin
(bool) @boolean
(symbol) @symbol  ; might be overridden further
(string) @string  ; might be overridden further
(escape) @string.escape
(comment) @comment
(operator) @operator
(type) @type.builtin

[
  (number)
  (infinity)

  ; rest are distantly resemble numbers
  (timestamp)
  (blob)
] @number

(not_a_number) @exception  ; worth to be highlighted, I guess

(clob) @string.special

(field key: (_) @field)
(annotations (symbol) @annotation)

((symbol) @constant.builtin
 (#match? @constant.builtin "^\\$"))

; Some basic identification of special markers like IVM and symbol tables
(document
  ((symbol) @keyword
   (#match? @keyword "^\\$ion_1_0$")))

(document
  (annotated
    (annotations
      ((symbol) @label
       (#match? @label "^\\$(ion_(shared_)?symbol_table|2|3|9)$")))
      (struct)))

; Punctuations
(sexp [ "(" ")" ] @punctuation.bracket)
(list [ "[" "]" ] @punctuation.bracket)
(list "," @punctuation.delimiter)
(struct [ "{" "}" ] @punctuation.bracket)
(struct "," @punctuation.delimiter)
(field ":" @punctuation.special)
(annotations "::" @punctuation.special)
(blob [ "{{" "}}" ] @punctuation.bracket)
(clob [ "{{" "}}" ] @punctuation.bracket)

(ERROR) @error

; ex:ft=scheme
