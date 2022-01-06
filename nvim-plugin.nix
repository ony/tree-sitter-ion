{ pkgs }:
pkgs.vimUtils.buildVimPlugin {
  name = "nvim-treesitter-ion";
  src = ./nvim-treesitter-ion;
}
