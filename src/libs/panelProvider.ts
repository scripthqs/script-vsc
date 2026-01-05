import { TreeDataProvider, TreeItem, EventEmitter, Event, ProviderResult } from "vscode";

export class ScriptTxtProvider implements TreeDataProvider<TreeItem> {
  private _onDidChangeTreeData: EventEmitter<TreeItem | undefined | void> = new EventEmitter<TreeItem | undefined | void>();
  readonly onDidChangeTreeData: Event<TreeItem | undefined | void> = this._onDidChangeTreeData.event;

  private _panelContent = "初始化";

  getTreeItem(element: TreeItem): TreeItem {
    return element;
  }
  getChildren(element?: TreeItem): ProviderResult<TreeItem[]> {
    // 按行分割内容，每行一个 TreeItem
    return this._panelContent.split(/\r?\n/).map((line) => new TreeItem(line));
  }
  refresh(): void {
    this._onDidChangeTreeData.fire();
  }
  setPanelContent(content: string) {
    this._panelContent = content;
    this.refresh();
  }
  getPanelContent(): string {
    return this._panelContent;
  }
}

export function autoSplitLines(text: string, lineLength: number = 15): string {
  const lines = [];
  for (let i = 0; i < text.length; i += lineLength) {
    lines.push(text.substr(i, lineLength));
  }
  return lines.join("\n");
}
