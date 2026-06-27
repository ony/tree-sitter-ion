{
  inputs = {
    utils.url = "github:numtide/flake-utils";

    nixony.url = "github:ony/nixony";
    nixony.inputs.nixpkgs.follows = "nixpkgs";
    nixony.inputs.flake-utils.follows = "utils";
  };

  outputs = { self, nixpkgs, utils, nixony }:
    let
      pkgDefs = nixony.lib.mkPkgDefs (final0: {
        tree-sitter-grammars.tree-sitter-ion = final0.callPackage ./ion-grammar.nix { };
        vimPlugins.nvim-treesitter-ion = final0.callPackage ./nvim-plugin.nix { };
      });

      out = system:
      let
        pkgs = import nixpkgs {
          inherit system;
          overlays = [ self.overlays.default ];
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

        packages = pkgDefs.toFlatPackages pkgs;
        defaultPackage = grammar;
        checks = pkgDefs.toFlatPackages pkgs;
      };
    in
    with utils.lib;
    {
      overlays.default = final: prev: pkgDefs.toOverlay final prev;
    } // eachSystem defaultSystems out;
}
