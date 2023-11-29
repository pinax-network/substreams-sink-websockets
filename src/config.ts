import "dotenv/config";

import pkg from "../package.json" assert { type: "json" };
import { Command, Option } from "commander";

// default values
export const DEFAULT_PORT = 3000
export const DEFAULT_HOSTNAME = "0.0.0.0"
export const DEFAULT_VERBOSE = false
export const DEFAULT_SQLITE_FILENAME = "db.sqlite"
export const DEFAULT_RECENT_MESSAGES_LIMIT = 50

// parse command line options
const opts = new Command()
    .name(pkg.name)
    .description(pkg.description)
    .showHelpAfterError()
    .addOption(new Option("--public-key <string>", "(required) Ed25519 public key (comma-separated for multiple public keys)").env("PUBLIC_KEY"))
    .addOption(new Option("--port <int>", "Server listen on HTTP port").default(DEFAULT_PORT).env("PORT"))
    .addOption(new Option("--hostname <string>", "Server listen on HTTP hostname").default(DEFAULT_HOSTNAME).env("HOSTNAME"))
    .addOption(new Option("--sqlite-filename <string>", "SQLite database filename").default(DEFAULT_SQLITE_FILENAME).env("SQLITE_FILENAME"))
    .addOption(new Option("--verbose <boolean>", "Enable verbose logging").default(DEFAULT_VERBOSE).env("VERBOSE"))
    .addOption(new Option("--recent-messages-limit <int>", "Limit recent messages").default(DEFAULT_RECENT_MESSAGES_LIMIT).env("RECENT_MESSAGES_LIMIT"))
    .version(pkg.version)
    .parse(process.argv).opts();

// export options
export const PUBLIC_KEYS: string[] = opts.publicKey?.split(",");
export const PORT = Number(opts.port);
export const HOSTNAME: string = opts.hostname
export const SQLITE_FILENAME: string = opts.sqliteFilename;
export const VERBOSE: boolean = opts.verbose === "true" ? true : false;
export const RECENT_MESSAGES_LIMIT: number = Number(opts.recentMessagesLimit);

// validate required options
if (!PUBLIC_KEYS.length) throw new Error("PUBLIC_KEY is required");
for ( const publicKey of PUBLIC_KEYS ) {
    if (Buffer.from(publicKey, "hex").length !== 32) throw new Error("PUBLIC_KEY must be a 32 byte hex string");
}
if (!Number.isInteger(PORT)) throw new Error("PORT must be an integer");
