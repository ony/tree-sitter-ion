{
  inputs = {
    nixony.url = "github:ony/nixony";
    nixony.inputs = {
      nixpkgs.follows = "nixpkgs";
      flake-parts.follows = "flake-parts";
      systems.follows = "systems";
    };
  };

  outputs =
    inputs@{
      self,
      nixpkgs,
      flake-parts,
      systems,
      ...
    }:
    let
      pkgDefs = inputs.nixony.lib.mkPkgDefs (final0: {
        tree-sitter-grammars.tree-sitter-ion = final0.callPackage ./ion-grammar.nix { };
        vimPlugins.nvim-treesitter-ion = final0.callPackage ./nvim-plugin.nix { };
      });
    in
    flake-parts.lib.mkFlake { inherit inputs; } {
      flake.overlays.default = pkgDefs.toOverlay;

      systems = import systems;
      perSystem =
        {
          self',
          system,
          pkgs,
          ...
        }:
        {
          # https://flake.parts/overlays.html?highlight=overlay#consuming-an-overlay
          _module.args.pkgs = import inputs.nixpkgs {
            inherit system;
            overlays = [ self.overlays.default ];
            config = { };
          };

          devShells.default = pkgs.mkShell {
            packages = with pkgs; [
              # extra dev tools
            ];
            inputsFrom = with pkgs; [
              self'.packages.default
            ];
          };

          packages = pkgDefs.toFlatPackages pkgs // {
            default = pkgs.tree-sitter-grammars.tree-sitter-ion;
          };
          checks = self'.packages;
        };
    };
}
