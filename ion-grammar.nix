{ stdenv
, nodejs
, tree-sitter
}:
stdenv.mkDerivation rec {
  pname = "ion-grammar";
  version = "0.1.0";
  src = ./.;

  nativeBuildInputs = [ nodejs ];
  buildInputs = [ tree-sitter ];

  dontUnpack = true;

  CFLAGS = [ "-O2" ];
  preBuild = ''
    ln -s "$src/grammar.js" ./
    ln -s "$src/test" ./
    ${tree-sitter}/bin/tree-sitter generate --no-bindings
    HOME="$PWD/fake-home" ${tree-sitter}/bin/tree-sitter test
  '';

  buildPhase = ''
    runHook preBuild
    $CC -Isrc -c src/parser.c -o parser.o $CFLAGS
    $CXX -shared -o parser *.o
    runHook postBuild
  '';

  installPhase = ''
    runHook preInstall
    mkdir $out
    mv parser $out/
    cp -a "$src/package.json" "$src/queries" $out/
    runHook postInstall
  '';
}
