import { Logging } from "../utils/logger";
import path from "path"

type WidgetProjectFiles = { [key: string]: string[] }

export class WidgetProjectFileCollection {
  private readonly _files: WidgetProjectFiles

  constructor() {
    this._files = {
      swift: [],
      entitlements: [],
      plist: [],
      xcassets: [],
      intentdefinition: [],
    };
  }

  static fromFiles(files: string[]) {
    const collection = new WidgetProjectFileCollection();
    collection.addFiles(files);

    return collection;
  }

  addFiles(files: string[]) {
    for (const file of files) {
      this.addFile(file);
    }
  }

  addFile(file: string) {
    const extension = path.extname(file).substring(1)

    if (file === "Module.swift") {
      return;
    }
    else if (this._files.hasOwnProperty(extension)) {
      Logging.logger.debug(`Adding file ${file}...`)
      Logging.logger.debug(`Extension: ${extension}`)

      this._files[extension].push(file)
    }
  }

  getFiltered() {
    return this._files
  }

  getBundled(includeProjectLevelFiles: boolean = false) {
    return Object.keys(this._files)
      .map(key => { return { files: this._files[key], key } })
      .reduce<string[]>((arr, { key, files }) => {
        if (!includeProjectLevelFiles && key === 'entitlements') {
          return arr;
        }

        return [...arr, ...files]
      }, []);
  }
}