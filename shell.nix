let
  pkgs = import <main> {};
  nodejs = pkgs.nodejs_20;
	pnpm = pkgs.pnpm;
in
pkgs.mkShell {
  buildInputs = [ nodejs pnpm ];
}
