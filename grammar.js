module.exports = grammar({
  name: 'ion',

  rules: {
    document: $ => repeat($._value),

    _value: $ => choice(
      $.null,
      $.bool,
      $.number,
      // TODO: $.timestamp,
      $.string,
      $.symbol,
      // TODO: $.blob,
      // TODO: $.clob,
      $.struct,
      $.list,
      $.sexp,
      $.annotated,
    ),
    annotated: $ => seq($.annotations, $._value),
    annotations: $ => prec.left(repeat1(seq($.symbol, '::'))),

    null: $ => seq('null', optional(seq('.', choice($.type, 'null')))),
    bool: $ => choice('true', 'false'),

    number: $ => choice(
      $._int,
      $._real,
    ),
    _int: $ => choice(
      $._dec_integer,
      /0x[0-9A-Fa-f](_?[0-9A-Fa-f])*/,
      /0b[01](_?[01])*/,
    ),
    _real: $ => choice(
      $.infinity,
      $.not_a_number,
      seq($._dec_integer, $._dec_frac, optional($._dec_exp)),
      seq($._dec_integer, $._dec_exp),
    ),

    _dec_integer: $ => seq(optional('-'), $._dec_unsigned),
    _dec_unsigned: $ => token.immediate(/0|[1-9](_?[0-9])*/),
    _dec_frac: $ => token.immediate(/\.([0-9](_?[0-9])*)?/),
    _dec_exp: $ => token.immediate(/[eEdD][+-]?[0-9]+/),

    infinity: $ => /[+-]inf/,
    not_a_number: $ => 'nan',

    string: $ => choice(
      seq('"', repeat($._string_chunk), '"'),
      // TODO: join multi-line strings together?
      seq("'''", repeat($._string_long_chunk), "'''"),
    ),
    _string_chunk: $ => choice(
      token.immediate(/[^"\\\n]+/),
      $.escape,
    ),

    _string_long_chunk: $ => choice(
      token.immediate(/[^'\\]+/),
      $.escape,
    ),

    symbol: $ => choice(
      $.symbol_ref,
      seq("'", repeat($._symbol_chunk), "'"),
      $.identifier,
    ),
    symbol_ref: $ => /\$[1-9][0-9]+/,
    _symbol_chunk: $ => choice(
      token.immediate(/[^'\\\n]+/),
      $.escape,
    ),

    struct: $ => seq('{', sepBy($.field, ','), optional(','), '}'),
    field: $ => seq($._field_name, ':', $._value),
    _field_name: $ => choice(
      $.symbol,
      $.string,
    ),

    list: $ => seq('[', sepBy($._value, ','), optional(','), ']'),
    sexp: $ => seq('(', repeat($._sexp_element), ')'),
    _sexp_element: $ => choice(
      $._value,
      alias($._sexp_symbol, $.symbol),
    ),
    _sexp_symbol: $ => $.operator,

    escape: $ => choice(
      token.immediate(/\\[abtnfrv?0\'"/\\]/),
      seq(token.immediate('\\'), $._nl),
      $.hex_escape,
      $.unicode_escape,
    ),
    hex_escape: $ => token.immediate(/\\x[0-9A-Fa-f]{2}/),
    unicode_escape: $ => token.immediate(/\\(u|U000[0-9A-Fa-f]|U0010)[0-9A-Fa-f]{4}/),

    identifier: $ => /[$_a-zA-Z][$_a-zA-Z0-9]*/,
    operator: $ => /[!#%&*+./;<=>?@^`|~-]+/,

    type: $ => choice(
      'bool',
      'int',
      'float',
      'decimal',
      'timestamp',
      'symbol',
      'string',
      'clob',
      'blob',
      'list',
      'sexp',
      'struct',
    ),

    _space: $ => /\s+/,
    _nl: $ => token.immediate(/\r\n|\n|\n/),
    comment: $ => choice(
      seq('//', /[^\n\r]*/),
      seq('/*', /[^*]*(\*[^*/][^*]*)*/, '*/'),
    ),
  },

  extras: $ => [
    $._space,
    $.comment,
  ],
});

function sepBy1(a, sep) {
  return seq(a, repeat(seq(sep, a)));
}

function sepBy(a, sep) {
  return optional(sepBy1(a, sep));
}
