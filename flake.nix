{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs";
    utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, utils }:
    let out = system:
      let
        pkgs = import nixpkgs {
          inherit system;
          overlays = [ self.overlay ];
        };
        grammar = pkgs.tree-sitter-grammars.tree-sitter-ion;
      in
      {
        devShell = pkgs.mkShell {
          packages = with pkgs; [
            # extra dev tools
          ];
          inputsFrom = with pkgs; [ grammar ];
        };

        packages = {
          tree-sitter-grammars.tree-sitter-ion = grammar;
        };
        defaultPackage = grammar;
      };
    in
    with utils.lib;
    {
      overlay = final: prev: {
        tree-sitter-grammars = prev.tree-sitter-grammars // {
          tree-sitter-ion = final.callPackage ./ion-grammar.nix { };
        };
        vimPlugins = prev.vimPlugins // {
          nvim-treesitter-ion = final.callPackage ./nvim-plugin.nix { };
        };
      };
    } // eachSystem defaultSystems out;

}
