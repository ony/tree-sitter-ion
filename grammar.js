module.exports = grammar({
  name: 'ion',

  rules: {
    document: $ => repeat($._value),

    _value: $ => choice(
      $.null,
      $.bool,
      $.number,
      $.timestamp,
      $.string,
      $.symbol,
      $.blob,
      $.clob,
      $.struct,
      $.list,
      $.sexp,
      $.annotated,
    ),

    annotated: $ => seq(
      field('annotation', seq($.symbol, '::')),
      field('value', $._value),
    ),

    null: $ => seq('null', optional(seq('.', choice($.type, 'null')))),
    bool: $ => choice('true', 'false'),

    number: $ => {
      const _dec_unsigned = token.immediate(/0|[1-9](_?[0-9])*/);
      const _dec_frac = token.immediate(/\.([0-9](_?[0-9])*)?/);
      const _dec_exp = token.immediate(/[eEdD][+-]?[0-9]+/);
      const _dec_integer = seq(optional('-'), _dec_unsigned);

      const _int = choice(
        token(_dec_integer),
        /0x[0-9A-Fa-f](_?[0-9A-Fa-f])*/,
        /0b[01](_?[01])*/,
      );

      const _real = choice(
        $.infinity,
        $.not_a_number,
        token(seq(_dec_integer, _dec_frac, optional(_dec_exp))),
        token(seq(_dec_integer, _dec_exp)),
      );

      return choice(
        _int,
        _real,
      );
    },

    infinity: $ => /[+-]inf/,
    not_a_number: $ => 'nan',

    timestamp: $ => {
      // rule out obviously wrong representations
      const year = /0{3}[1-9]|0{2}[1-9][0-9]|0[1-9][0-9]{2}|[1-9][0-9]{3}/;
      const month = /0[1-9]|1[0-2]/;
      const day = /0[1-9]|[12][0-9]|3[01]/;
      const date = seq(year, '-', month, '-', day);
      const hour = /[01][0-9]|2[0-3]/;
      const min = /[0-5][0-9]/;
      const second = /[0-5][0-9](\.[0-9]+)?|60/;  // allow leap second?
      const offset = choice('Z', seq(/[+-]/, hour, ':', min));
      const time = seq(hour, ':', min, optional(seq(':', second)), offset);

      return token(choice(
        seq(date, optional(seq('T', optional(time)))),
        seq(year, optional(seq('-', month)), 'T'),
      ))
    },

    string: $ => choice(
      $._string_short,
      $._string_long,
    ),
    _string_short: $ => seq('"', repeat($._string_chunk), '"'),
    _string_chunk: $ => choice(
      token.immediate(prec(1, /[^"\\\n]+/)),
      $.escape,
    ),

    // TODO: join multi-line strings together?
    _string_long: $ => seq("'''", repeat($._string_long_chunk), "'''"),

    _string_long_chunk: $ => choice(
      token.immediate(prec(1, /[^'\\]+/)),
      $.escape,
    ),

    symbol: $ => choice(
      $.symbol_ref,
      seq("'", repeat($._symbol_chunk), "'"),
      $.identifier,
    ),
    symbol_ref: $ => /\$[1-9][0-9]*/,
    _symbol_chunk: $ => choice(
      token.immediate(prec(1, /[^'\\\n]+/)),
      $.escape,
    ),

    // TODO: forbid comments
    // TODO: ensure padding/bits alignment
    blob: $ => seq('{{', repeat1(/[A-Za-z0-9+/]+={0,3}/), '}}'),

    // TODO: forbid comments
    // TODO: limit to 7-bit strings (including own escape)
    clob: $ => seq('{{', $._clob_content, '}}'),
    _clob_content: $ => choice(
      $._string_short,
      repeat1($._string_long),
    ),

    struct: $ => seq('{', sepOptEndBy($.field, ','), '}'),
    field: $ => seq(field('key', $._field_name), ':', field('value', $._value)),
    _field_name: $ => choice(
      $.symbol,
      $.string,
    ),

    list: $ => seq('[', sepOptEndBy($._value, ','), ']'),
    sexp: $ => seq('(', repeat($._sexp_element), ')'),
    _sexp_element: $ => choice(
      $._value,
      alias($._sexp_symbol, $.symbol),
    ),
    _sexp_symbol: $ => $.operator,

    escape: $ => choice(
      token.immediate(/\\[abtnfrv?0\'"/\\]/),
      token.immediate(/\\(\r\n|\n)/),
      $.hex_escape,
      $.unicode_escape,
    ),
    hex_escape: $ => token.immediate(/\\x[0-9A-Fa-f]{2}/),
    unicode_escape: $ => token.immediate(/\\(u|U000[0-9A-Fa-f]|U0010)[0-9A-Fa-f]{4}/),

    identifier: $ => /[$_a-zA-Z][$_a-zA-Z0-9]*/,

    // TODO: should restrict comment starts? (e.g. (3 // 4) and (/* 6 2 3))
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
    comment: $ => token(choice(
      /\/\/[^\n\r]*/,
      seq('/*', /([^*]|\*+[^*/])*\*+\//),
    )),
  },

  extras: $ => [
    $._space,
    $.comment,
  ],

  supertypes: $ => [
    $._value,
  ],

  inline: $ => [
    $._string_short,
    $._string_long,
    $._string_chunk,
    $._string_long_chunk,
  ],
});

function sepBy1(a, sep) {
  return seq(a, repeat(seq(sep, a)));
}

function sepBy(a, sep) {
  return optional(sepBy1(a, sep));
}

function sepEndBy(a, sep) {
  return repeat(seq(a, sep));
}

function sepOptEndBy(a, sep) {
  return optional(seq(sepBy1(a, sep), optional(sep)));
}
