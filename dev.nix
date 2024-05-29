{ pkgs, ... }: 
  let firebase-ext = pkgs.fetchurl {
    url =
      "https://firebasestorage.googleapis.com/v0/b/firemat-preview-drop/o/vsix%2Ffirebase-vscode-0.2.3.vsix?alt=media&token=177af1b2-6320-4156-ac2d-6167537df62a";
    hash = "sha256-TPpG869RzS/JMs2WHD0z2wmmwxWMSD8jtcj7+8aYqKM=";
    name = "firebase.vsix";
  };
  in {
    channel = "stable-23.11";
    packages = [
      (pkgs.postgresql_15.withPackages (p: [ p.pgvector ]))
      pkgs.nodejs_20
      pkgs.python3
      pkgs.nodePackages.pnpm
    ];
    
    env = {
      POSTGRESQL_CONN_STRING = "postgresql://user:mypassword@localhost:5432/dataconnect?sslmode=disable";
      FIRESQL_PORT = 9939;
    };
  
    idx.extensions = [
      "mtxr.sqltools-driver-pg"
      "mtxr.sqltools"
      "GraphQL.vscode-graphql-syntax"
      "${firebase-ext}"
    ];
  
    processes = {
      postgresRun = {
        command = "postgres -D local -k /tmp";
      };
    };

    idx = {
      workspace = {
        onCreate = {
          setup = "node download.mjs";
          postgres = ''
            PGHOST=/tmp psql --dbname=postgres -c "ALTER USER \"user\" PASSWORD 'mypassword';"
            PGHOST=/tmp psql --dbname=postgres -c "CREATE DATABASE dataconnect;"
            PGHOST=/tmp psql --dbname=dataconnect -c "CREATE EXTENSION vector;"
          '';
          npm-install = "pnpm i --prefix=./email-app";
        };
      };
      previews = {
        enable = true;
        previews = {
          web = {
            command = ["npm" "run" "dev" "--prefix" "./email-app" "--" "--port" "$PORT" "--hostname" "0.0.0.0"];
            manager = "web";
          };
        };
      };
    };
}
