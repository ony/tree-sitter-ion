local parser_config = require "nvim-treesitter.parsers".get_parser_configs()
if not parser_config.ion then
  -- yes, we need this even when we already have grammar
  parser_config.ion = {}
end
