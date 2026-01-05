import { ExtensionContext, workspace, window } from "vscode";
import * as fs from "fs";

export class Book {
  curr_page_number: number = 1;
  page_size: number = 50;
  page = 0;
  start = 0;
  end = 0;
  filePath: string = "";
  extensionContext: ExtensionContext;

  constructor(extensionContext: ExtensionContext) {
    this.extensionContext = extensionContext;
    // 初始化 page_size
    const is_english = <boolean>workspace.getConfiguration().get("scriptTxt.isEnglish");
    let configPageSize = workspace.getConfiguration().get<number>("scriptTxt.pageSize") || 50;
    this.page_size = is_english ? configPageSize * 2 : configPageSize;

    const cachedPage = workspace.getConfiguration().get<number>("scriptTxt.currPageNumber");
    if (cachedPage && cachedPage > 0) {
      this.curr_page_number = cachedPage;
    }
  }

  // 读取文件内容
  readFile(): string {
    this.filePath = workspace.getConfiguration().get("scriptTxt.filePath") || "";
    if (!this.filePath) {
      window.showWarningMessage("Please fill in the path of the TXT format novel file");
      return "";
    }
    let data = fs.readFileSync(this.filePath, "utf-8");
    const line_break = <string>workspace.getConfiguration().get("scriptTxt.lineBreak") || "\n";
    return data.toString().replace(/\n/g, line_break).replace(/\r/g, " ").replace(/　　/g, " ").replace(/ /g, " ");
  }

  // 计算总页数
  getSize(text: string) {
    this.page = Math.ceil(text.length / this.page_size);
  }

  // 计算当前页的起止位置
  getStartEnd() {
    this.start = (this.curr_page_number - 1) * this.page_size;
    this.end = Math.min(this.curr_page_number * this.page_size, this.readFile().length);
  }

  // 更新当前页码到配置
  updatePage() {
    workspace.getConfiguration().update("scriptTxt.currPageNumber", this.curr_page_number, true);
  }

  // 封装分页主流程
  private getPageContent(type: "previous" | "next" | "curr" | number): { content: string; pageInfo: string } {
    // 只初始化 filePath，不再自动覆盖 page_size
    this.filePath = workspace.getConfiguration().get("scriptTxt.filePath") || "";
    const text = this.readFile();
    this.getSize(text);

    if (typeof type === "number") {
      // 跳转到指定页
      this.curr_page_number = Math.max(1, Math.min(this.page, type));
    } else {
      this.handlePageType(type);
    }
    this.getStartEnd();
    this.updatePage();

    const page_info = `${this.curr_page_number}/${this.page}`;
    return {
      content: text.substring(this.start, this.end),
      pageInfo: page_info,
    };
  }

  // 处理上一页、下一页、当前页逻辑
  private handlePageType(type: "previous" | "next" | "curr") {
    if (type === "previous") {
      this.curr_page_number = Math.max(1, this.curr_page_number - 1);
    } else if (type === "next") {
      this.curr_page_number = Math.min(this.page, this.curr_page_number + 1);
    } // "curr" 不变
  }

  // 对外方法
  getPreviousPage() {
    return this.getPageContent("previous");
  }

  getNextPage() {
    return this.getPageContent("next");
  }

  getJumpingPage() {
    return this.getPageContent("curr");
  }

  jumpToPage(pageNumber: number) {
    return this.getPageContent(pageNumber);
  }

  setPageSize(newPageSize: number) {
    // 1. 先记录当前全局字符位置（用旧 page_size）
    const globalPos = (this.curr_page_number - 1) * this.page_size;

    // 2. 设置新 page_size，并同步到配置
    this.page_size = newPageSize;
    workspace.getConfiguration().update("scriptTxt.pageSize", newPageSize, true);

    // 3. 重新读取文本和计算总页数
    const text = this.readFile();
    this.getSize(text);

    // 4. 用原字符位置反推新页码
    this.curr_page_number = Math.floor(globalPos / this.page_size) + 1;
    if (this.curr_page_number > this.page) {
      this.curr_page_number = this.page;
    }
    if (this.curr_page_number < 1) {
      this.curr_page_number = 1;
    }

    // 5. 更新配置和起止位置
    this.updatePage();
    this.getStartEnd();
  }

  // 获取完整内容
  getFullContent(): string {
    return this.readFile();
  }
}
