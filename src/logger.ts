import { Logger, type ILogObj } from "tslog";
import { name } from "../package.json" assert { type: "json" };
import { VERBOSE } from "./config.js";

class SinkLogger extends Logger<ILogObj> {
  constructor(verbose: boolean) {
    super();
    if ( verbose ) this.enable();
    else this.disable();
    this.settings.name = name;
  }

  public enable(type: "pretty" | "json" = "pretty") {
    this.settings.type = type;
    this.settings.minLevel = 0;
  }

  public disable() {
    this.settings.type = "hidden";
    this.settings.minLevel = 5;
  }
}

export const logger = new SinkLogger(VERBOSE);