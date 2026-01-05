import { commands, ExtensionContext, window, StatusBarItem, StatusBarAlignment, OutputChannel } from "vscode";
import * as book from "./libs/bkContext";
let statusBarContent: StatusBarItem;
let settingButton: StatusBarItem;
let pageButton: StatusBarItem;
let books: book.Book;
let outputChannel: OutputChannel;

// window.setStatusBarMessage
export function activate(context: ExtensionContext) {
  outputChannel = window.createOutputChannel("script-txt");

  statusBarContent = window.createStatusBarItem(StatusBarAlignment.Right, 10);
  settingButton = window.createStatusBarItem(StatusBarAlignment.Right, 0);
  settingButton.text = "$(book)";
  settingButton.tooltip = "分页数";
  settingButton.command = "extension.changePageSize";
  settingButton.show();
  pageButton = window.createStatusBarItem(StatusBarAlignment.Right, 5);
  pageButton.text = "";
  pageButton.tooltip = "跳转到";
  pageButton.command = "extension.jumpToPage";

  books = new book.Book(context);

  function updateContent({ content, pageInfo }: { content: string; pageInfo: string }) {
    // 去除多余空白
    const noSpaceText = content.replace(/[\s\r\n]+/g, "");
    if (statusBarContent) {
      statusBarContent.text = noSpaceText;
      statusBarContent.show();
      pageButton.text = pageInfo;
      pageButton.show();
    }
    if (outputChannel) {
      outputChannel.clear();
      outputChannel.append(noSpaceText);
    }
  }

  let displayInit = commands.registerCommand("extension.displayInit", () => {
    updateContent({ content: "初始化", pageInfo: "" });
    outputChannel.clear();
    outputChannel.hide();
  });

  let showOutputPanel = commands.registerCommand("extension.showOutputPanel", () => {
    outputChannel.show();
  });

  // 跳转页面
  let getJumpingPage = commands.registerCommand("extension.getJumpingPage", () => {
    updateContent(books.getJumpingPage());
  });

  // 下一页
  let getNextPage = commands.registerCommand("extension.getNextPage", () => {
    updateContent(books.getNextPage());
  });

  // 上一页
  let getPreviousPage = commands.registerCommand("extension.getPreviousPage", () => {
    updateContent(books.getPreviousPage());
  });

  // 跳转到指定页
  const jumpToPage = commands.registerCommand("extension.jumpToPage", async () => {
    const defaultPage = books.curr_page_number ? books.curr_page_number.toString() : "";
    const input = await window.showInputBox({ prompt: "请输入", value: defaultPage });
    const pageNumber = Number(input);
    if (!isNaN(pageNumber)) {
      updateContent(books.jumpToPage(pageNumber));
    } else {
      // window.showErrorMessage("无效的数字！");
    }
  });

  // 修改每页显示大小
  const changePageSize = commands.registerCommand("extension.changePageSize", async () => {
    const defaultSize = books.page_size ? books.page_size.toString() : "50";
    const input = await window.showInputBox({ prompt: "请输入字符数", value: defaultSize });
    const sizeNumber = Number(input);
    if (!isNaN(sizeNumber) && sizeNumber > 0) {
      books.setPageSize(sizeNumber);

      updateContent(books.getJumpingPage());
    } else {
      // window.showErrorMessage("无效的数字！");
    }
  });

  context.subscriptions.push(displayInit, getJumpingPage, getNextPage, getPreviousPage, jumpToPage, changePageSize, showOutputPanel);

  // 悬停显示内容
  // const hoverDisposable = languages.registerHoverProvider(["typescript", "javascript", "vue"], {
  //   async provideHover(document, position, token) {
  //     const range = document.getWordRangeAtPosition(position);
  //     const word = document.getText(range);
  //     console.log("hover word:", word);
  //     if (word === "hqsTxt") {
  //       let books = new book.Book(context);
  //       const content = books.getJumpingPage();
  //       // 插入命令链接
  //       const markdown = new MarkdownString(
  //         `${content}\n\n` + `[previous](command:extension.getPreviousPage) | [next](command:extension.getNextPage)\n\n`
  //       );
  //       markdown.isTrusted = true; // 允许命令链接
  //       return new Hover(markdown, range);
  //     }
  //   },
  // });
}

export function deactivate() {}
