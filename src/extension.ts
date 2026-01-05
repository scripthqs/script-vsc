import { commands, ExtensionContext, window, StatusBarItem, StatusBarAlignment } from "vscode";
import * as book from "./libs/bkContext";
import { ScriptTxtProvider, autoSplitLines } from "./libs/panelProvider";
let statusBarContent: StatusBarItem;
let settingButton: StatusBarItem;
let books: book.Book;

// window.setStatusBarMessage
export function activate(context: ExtensionContext) {
  const scriptTxtProvider = new ScriptTxtProvider();
  window.registerTreeDataProvider("scriptTxtView", scriptTxtProvider);

  statusBarContent = window.createStatusBarItem(StatusBarAlignment.Right, 10);
  settingButton = window.createStatusBarItem(StatusBarAlignment.Right, 0);
  settingButton.text = "$(book)";
  settingButton.tooltip = "设置分页";
  settingButton.command = "extension.jumpToPage";
  settingButton.show();

  books = new book.Book(context);

  function updateContent(newText: string) {
    if (statusBarContent) {
      statusBarContent.text = newText;
      statusBarContent.command = "extension.changePageSize";
      statusBarContent.show();
    }
    scriptTxtProvider.setPanelContent(autoSplitLines(newText));
    // 60 82944/87587
  }

  let displayCode = commands.registerCommand("extension.displayCode", () => {
    updateContent("初始化");
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

  context.subscriptions.push(displayCode, getJumpingPage, getNextPage, getPreviousPage, jumpToPage, changePageSize);

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
