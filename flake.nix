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
      nixpkgs,
      flake-parts,
      systems,
      ...
    }:
    flake-parts.lib.mkFlake { inherit inputs; } {
      imports = [
        inputs.nixony.flakeModules.packagesOverlay
      ];

      packagesOverlay = final0: {
        tree-sitter-grammars.tree-sitter-ion = final0.callPackage ./ion-grammar.nix { };
        vimPlugins.nvim-treesitter-ion = final0.callPackage ./nvim-plugin.nix { };
      };

      systems = import systems;
      perSystem =
        {
          self',
          pkgs,
          ...
        }:
        {
          devShells.default = pkgs.mkShell {
            packages = with pkgs; [
              # extra dev tools
            ];
            inputsFrom = with pkgs; [
              self'.packages.default
            ];
          };

          packages.default = self'.packages.tree-sitter-ion;
        };
    };
}
