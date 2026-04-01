import { google, sheets_v4 } from "googleapis";

import { parseSheetRows } from "./sheets-parse.js";
import type { LeadRow } from "./types.js";

function googleApiErrorMessage(err: unknown): string {
  if (err && typeof err === "object" && "response" in err) {
    const body = (err as { response?: { data?: { error?: { message?: string; status?: string } } } })
      .response?.data?.error;
    if (body?.message) {
      return body.status ? `${body.status}: ${body.message}` : body.message;
    }
  }
  if (err instanceof Error) return err.message;
  return String(err);
}

/** drive.readonly — часто нужен, чтобы сервисный аккаунт «видел» файл, расшаренный ему по email */
const SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/drive.readonly",
];

function sheetCell(value: string | number | null): string | number {
  if (value === null || value === "") return "";
  const s = String(value);
  if (/^[=+\-@]/.test(s)) return `'${s}`;
  return s;
}

function leadToRow(lead: LeadRow): (string | number)[] {
  return [
    lead.id,
    sheetCell(lead.name) as string | number,
    sheetCell(lead.email) as string | number,
    sheetCell(lead.contact_type) as string | number,
    sheetCell(lead.contact) as string | number,
    sheetCell(lead.message) as string | number,
    sheetCell(lead.status) as string | number,
    sheetCell(lead.created_at) as string | number,
    sheetCell(lead.updated_at) as string | number,
  ];
}

/** Шапка для менеджера (новый лист). Колонки по-прежнему A–I, парсер по индексам. */
export const MANAGER_HEADERS = [
  "ID",
  "Имя",
  "Email",
  "Канал",
  "Контакт",
  "Комментарий",
  "Статус",
  "Создано",
  "Обновлено",
];

export type SheetsConfig = {
  spreadsheetId: string;
  sheetName: string;
};

export function createSheetsClient() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim();
  const rawKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.trim();
  if (!email || !rawKey) {
    throw new Error(
      "Missing GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY"
    );
  }
  const privateKey = rawKey.replace(/\\n/g, "\n");
  const auth = new google.auth.JWT({
    email,
    key: privateKey,
    scopes: SCOPES,
  });
  return google.sheets({ version: "v4", auth });
}

export class SheetsMirror {
  private sheets: sheets_v4.Sheets;
  private config: SheetsConfig;
  private tabA1: string;

  constructor(sheets: sheets_v4.Sheets, config: SheetsConfig) {
    this.sheets = sheets;
    this.config = config;
    const escaped = config.sheetName.includes("'")
      ? `'${config.sheetName.replace(/'/g, "''")}'`
      : config.sheetName;
    this.tabA1 = `${escaped}!`;
  }

  async ensureHeaderRow(): Promise<void> {
    const range = `${this.tabA1}A1:I1`;
    const res = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.config.spreadsheetId,
      range,
    });
    const first = res.data.values?.[0]?.[0];
    const firstNorm = String(first ?? "")
      .trim()
      .toLowerCase();
    if (firstNorm === "id") return;

    await this.sheets.spreadsheets.values.update({
      spreadsheetId: this.config.spreadsheetId,
      range,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [MANAGER_HEADERS] },
    });
  }

  /**
   * Удобный лист: шапка, ширины, заморозка строки, список в «Статус»,
   * перенос в комментарии, цвета по статусу. Безопасно вызывать при каждом старте
   * (старые правила условного форматирования снимаются и задаются заново).
   */
  async applyManagerFormatting(): Promise<void> {
    const sheetId = await this.resolveSheetId();
    const gr = await this.sheets.spreadsheets.get({
      spreadsheetId: this.config.spreadsheetId,
      fields: "sheets(properties(sheetId,title),conditionalFormats)",
    });
    const sh = gr.data.sheets?.find((s) => s.properties?.title === this.config.sheetName);
    const sid = sh?.properties?.sheetId;
    if (sid === undefined || sid === null) {
      throw new Error(`Sheet not found: ${this.config.sheetName}`);
    }

    const requests: sheets_v4.Schema$Request[] = [];
    const nRules = sh?.conditionalFormats?.length ?? 0;
    for (let i = nRules - 1; i >= 0; i--) {
      requests.push({ deleteConditionalFormatRule: { sheetId: sid, index: i } });
    }

    const lastRow = 10000;
    const colWidths = [56, 168, 220, 112, 180, 300, 140, 168, 168];

    requests.push({
      updateSheetProperties: {
        properties: { sheetId: sid, gridProperties: { frozenRowCount: 1 } },
        fields: "gridProperties.frozenRowCount",
      },
    });

    requests.push({
      repeatCell: {
        range: {
          sheetId: sid,
          startRowIndex: 0,
          endRowIndex: 1,
          startColumnIndex: 0,
          endColumnIndex: 9,
        },
        cell: {
          userEnteredFormat: {
            textFormat: { bold: true, foregroundColor: { red: 0.15, green: 0.15, blue: 0.2 } },
            backgroundColor: { red: 0.88, green: 0.91, blue: 0.98 },
            horizontalAlignment: "CENTER",
            verticalAlignment: "MIDDLE",
            wrapStrategy: "WRAP",
          },
        },
        fields:
          "userEnteredFormat(textFormat,backgroundColor,horizontalAlignment,verticalAlignment,wrapStrategy)",
      },
    });

    for (let c = 0; c < colWidths.length; c++) {
      requests.push({
        updateDimensionProperties: {
          range: { sheetId: sid, dimension: "COLUMNS", startIndex: c, endIndex: c + 1 },
          properties: { pixelSize: colWidths[c] },
          fields: "pixelSize",
        },
      });
    }

    requests.push({
      repeatCell: {
        range: {
          sheetId: sid,
          startRowIndex: 1,
          endRowIndex: lastRow,
          startColumnIndex: 5,
          endColumnIndex: 6,
        },
        cell: {
          userEnteredFormat: {
            wrapStrategy: "WRAP",
            verticalAlignment: "TOP",
          },
        },
        fields: "userEnteredFormat(wrapStrategy,verticalAlignment)",
      },
    });

    requests.push({
      setDataValidation: {
        range: {
          sheetId: sid,
          startRowIndex: 1,
          endRowIndex: lastRow,
          startColumnIndex: 6,
          endColumnIndex: 7,
        },
        rule: {
          condition: {
            type: "ONE_OF_LIST",
            values: [
              { userEnteredValue: "new" },
              { userEnteredValue: "in_progress" },
              { userEnteredValue: "success" },
              { userEnteredValue: "rejected" },
            ],
          },
          strict: false,
          showCustomUi: true,
        },
      },
    });

    /** Снять выпадающий список с колонки «Канал» (если задавался раньше). */
    requests.push({
      setDataValidation: {
        range: {
          sheetId: sid,
          startRowIndex: 1,
          endRowIndex: lastRow,
          startColumnIndex: 3,
          endColumnIndex: 4,
        },
      },
    });

    const statusBg = [
      { formula: '=G2="new"', rgb: { red: 0.86, green: 0.95, blue: 0.88 } },
      { formula: '=G2="in_progress"', rgb: { red: 1, green: 0.94, blue: 0.8 } },
      { formula: '=G2="success"', rgb: { red: 0.82, green: 0.92, blue: 1 } },
      { formula: '=G2="rejected"', rgb: { red: 0.96, green: 0.86, blue: 0.86 } },
    ];
    statusBg.forEach(({ formula, rgb }, idx) => {
      requests.push({
        addConditionalFormatRule: {
          rule: {
            ranges: [
              {
                sheetId: sid,
                startRowIndex: 1,
                endRowIndex: lastRow,
                startColumnIndex: 0,
                endColumnIndex: 9,
              },
            ],
            booleanRule: {
              condition: {
                type: "CUSTOM_FORMULA",
                values: [{ userEnteredValue: formula }],
              },
              format: { backgroundColor: rgb },
            },
          },
          index: idx,
        },
      });
    });

    requests.push({
      updateCells: {
        range: {
          sheetId: sid,
          startRowIndex: 0,
          endRowIndex: 1,
          startColumnIndex: 6,
          endColumnIndex: 7,
        },
        rows: [
          {
            values: [
              {
                note:
                  "Статус (выбери из списка): new = новая; in_progress = в работе; success = клиент согласился; rejected = отказ.",
              },
            ],
          },
        ],
        fields: "note",
      },
    });

    await this.sheets.spreadsheets.batchUpdate({
      spreadsheetId: this.config.spreadsheetId,
      requestBody: { requests },
    });
  }

  /** 1-based row index in the sheet, or null if not found */
  async findRowByLeadId(leadId: number): Promise<number | null> {
    const range = `${this.tabA1}A:A`;
    const res = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.config.spreadsheetId,
      range,
    });
    const cols = res.data.values || [];
    for (let i = 0; i < cols.length; i++) {
      const cell = cols[i]?.[0];
      if (cell === undefined || cell === "") continue;
      const num = Number(cell);
      if (num === leadId) return i + 1;
    }
    return null;
  }

  async appendLead(lead: LeadRow): Promise<void> {
    await this.ensureHeaderRow();
    const range = `${this.tabA1}A:I`;
    await this.sheets.spreadsheets.values.append({
      spreadsheetId: this.config.spreadsheetId,
      range,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values: [leadToRow(lead) as string[]] },
    });
  }

  async updateLeadRow(lead: LeadRow): Promise<void> {
    await this.ensureHeaderRow();
    const row = await this.findRowByLeadId(lead.id);
    if (row === null) {
      await this.appendLead(lead);
      return;
    }
    const range = `${this.tabA1}A${row}:I${row}`;
    await this.sheets.spreadsheets.values.update({
      spreadsheetId: this.config.spreadsheetId,
      range,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [leadToRow(lead) as string[]] },
    });
  }

  async deleteLeadRow(leadId: number): Promise<void> {
    await this.ensureHeaderRow();
    const rowIndex1Based = await this.findRowByLeadId(leadId);
    if (rowIndex1Based === null) return;
    if (rowIndex1Based === 1) return;

    const sheetId = await this.resolveSheetId();
    await this.sheets.spreadsheets.batchUpdate({
      spreadsheetId: this.config.spreadsheetId,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId,
                dimension: "ROWS",
                startIndex: rowIndex1Based - 1,
                endIndex: rowIndex1Based,
              },
            },
          },
        ],
      },
    });
  }

  /** Все заявки с листа (A2:I) — правки менеджера в таблице сразу здесь. */
  async loadAllLeadsParsed(): Promise<LeadRow[]> {
    await this.ensureHeaderRow();
    const res = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.config.spreadsheetId,
      range: `${this.tabA1}A2:I10000`,
    });
    return parseSheetRows((res.data.values as string[][]) || []);
  }

  async getLeadByIdParsed(leadId: number): Promise<LeadRow | null> {
    const all = await this.loadAllLeadsParsed();
    return all.find((l) => l.id === leadId) ?? null;
  }

  async fullReplaceFromLeads(leads: LeadRow[]): Promise<void> {
    await this.ensureHeaderRow();
    const rows = leads.map((l) => leadToRow(l) as string[]);
    const range = `${this.tabA1}A2:I`;
    await this.sheets.spreadsheets.values.clear({
      spreadsheetId: this.config.spreadsheetId,
      range: `${this.tabA1}A2:I`,
    });
    if (rows.length === 0) return;
    await this.sheets.spreadsheets.values.update({
      spreadsheetId: this.config.spreadsheetId,
      range,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: rows },
    });
  }

  /** Проверка доступа: открой в браузере http://127.0.0.1:PORT/health/sheets */
  async diagnose(): Promise<{
    ok: boolean;
    spreadsheetId: string;
    expectedTab: string;
    tabTitles?: string[];
    tabExists?: boolean;
    readRangeOk?: boolean;
    error?: string;
  }> {
    const base = {
      spreadsheetId: this.config.spreadsheetId,
      expectedTab: this.config.sheetName,
    };
    try {
      const meta = await this.sheets.spreadsheets.get({
        spreadsheetId: this.config.spreadsheetId,
        fields: "properties.title,sheets.properties.title",
      });
      const tabTitles =
        meta.data.sheets
          ?.map((s) => s.properties?.title)
          .filter((t): t is string => Boolean(t)) ?? [];
      const tabExists = tabTitles.includes(this.config.sheetName);
      if (!tabExists) {
        return {
          ok: false,
          ...base,
          tabTitles,
          tabExists: false,
          error: `Лист "${this.config.sheetName}" не найден. Есть вкладки: ${tabTitles.map((t) => JSON.stringify(t)).join(", ") || "(пусто)"}. Задай GOOGLE_SHEETS_TAB точно как имя вкладки (регистр важен).`,
        };
      }
      await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.config.spreadsheetId,
        range: `${this.tabA1}A1:I1`,
      });
      return {
        ok: true,
        ...base,
        tabTitles,
        tabExists: true,
        readRangeOk: true,
      };
    } catch (e) {
      return {
        ok: false,
        ...base,
        error: googleApiErrorMessage(e),
      };
    }
  }

  private async resolveSheetId(): Promise<number> {
    const meta = await this.sheets.spreadsheets.get({
      spreadsheetId: this.config.spreadsheetId,
    });
    const title = this.config.sheetName;
    const sheet = meta.data.sheets?.find((s) => s.properties?.title === title);
    if (!sheet?.properties?.sheetId && sheet?.properties?.sheetId !== 0) {
      throw new Error(`Sheet tab not found: ${title}`);
    }
    return sheet.properties!.sheetId!;
  }
}
