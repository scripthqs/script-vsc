import { ExtensionContext } from "vscode";
import { ScriptTxtExtension } from "./libs/ScriptTxtExtension";

export function activate(context: ExtensionContext) {
  new ScriptTxtExtension(context);
}

export function deactivate() {}
