import { commands, ExtensionContext, window, StatusBarItem, StatusBarAlignment, OutputChannel } from "vscode";
import * as book from "./TxtBook";

export class ScriptTxtExtension {
  private statusBarContent: StatusBarItem;
  private settingButton: StatusBarItem;
  private pageButton: StatusBarItem;
  private books: book.Book;
  private outputChannel: OutputChannel;
  private context: ExtensionContext;

  constructor(context: ExtensionContext) {
    this.context = context;
    this.outputChannel = window.createOutputChannel("script-txt");

    this.statusBarContent = window.createStatusBarItem(StatusBarAlignment.Right, 10);

    this.settingButton = window.createStatusBarItem(StatusBarAlignment.Right, 0);
    this.settingButton.text = "$(book)";
    this.settingButton.tooltip = "分页数";
    this.settingButton.command = "extension.changePageSize";
    this.settingButton.show();

    this.pageButton = window.createStatusBarItem(StatusBarAlignment.Right, 5);
    this.pageButton.text = "";
    this.pageButton.tooltip = "跳转到";
    this.pageButton.command = "extension.jumpToPage";

    this.books = new book.Book(context);

    this.registerCommands();
  }

  private updateContent({ content, pageInfo }: { content: string; pageInfo: string }) {
    const noSpaceText = content.replace(/[\s\r\n]+/g, "");
    if (this.statusBarContent) {
      this.statusBarContent.text = noSpaceText;
      this.statusBarContent.show();
      this.pageButton.text = pageInfo;
      this.pageButton.show();
    }
    if (this.outputChannel) {
      this.outputChannel.clear();
      this.outputChannel.append(noSpaceText);
    }
  }

  private registerCommands() {
    const displayInit = commands.registerCommand("extension.displayInit", () => {
      this.updateContent({ content: "初始化", pageInfo: "" });
      this.outputChannel.clear();
      this.outputChannel.hide();
    });

    const showOutputPanel = commands.registerCommand("extension.showOutputPanel", () => {
      this.outputChannel.show();
    });

    const getJumpingPage = commands.registerCommand("extension.getJumpingPage", () => {
      this.updateContent(this.books.getJumpingPage());
    });

    const getNextPage = commands.registerCommand("extension.getNextPage", () => {
      this.updateContent(this.books.getNextPage());
    });

    const getPreviousPage = commands.registerCommand("extension.getPreviousPage", () => {
      this.updateContent(this.books.getPreviousPage());
    });

    const jumpToPage = commands.registerCommand("extension.jumpToPage", async () => {
      const defaultPage = this.books.curr_page_number ? this.books.curr_page_number.toString() : "";
      const input = await window.showInputBox({ prompt: "请输入", value: defaultPage });
      const pageNumber = Number(input);
      if (!isNaN(pageNumber)) {
        this.updateContent(this.books.jumpToPage(pageNumber));
      }
    });

    const changePageSize = commands.registerCommand("extension.changePageSize", async () => {
      const defaultSize = this.books.page_size ? this.books.page_size.toString() : "50";
      const input = await window.showInputBox({ prompt: "请输入字符数", value: defaultSize });
      const sizeNumber = Number(input);
      if (!isNaN(sizeNumber) && sizeNumber > 0) {
        this.books.setPageSize(sizeNumber);
        this.updateContent(this.books.getJumpingPage());
      }
    });

    this.context.subscriptions.push(displayInit, getJumpingPage, getNextPage, getPreviousPage, jumpToPage, changePageSize, showOutputPanel);
  }
}
