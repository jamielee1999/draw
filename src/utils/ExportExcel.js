import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

function save(buffer, filename) {
  saveAs(
    new Blob([buffer], {
      type: 'application/xlsx'
    }),
    filename
  );
}

export function useExcelJS(sheetName, bookType = 'xlsx') {
  function createSheet(workbook, data) {
    const wbName = sheetName || 'SheetJS';
    const sheet = workbook.addWorksheet(wbName);
    sheet.columns = [
      { header: '編號', key: 'key', width: 10 },
      { header: '獎品名稱', key: 'name', width: 50 },
      { header: '中獎人', key: 'winning_partner', width: 30, outlineLevel: 1 }
    ];

    sheet.properties.defaultColWidth = 30;
    sheet.properties.defaultRowHeight = 30;
    sheet.views = [
      {
        state: 'frozen',
        ySplit: 1
      }
    ];
    const rowArr = data.map(prizesData =>
      Object.keys(prizesData)
        .map(key => prizesData[key])
        .flat()
    );

    sheet.addRows(rowArr);
  }

  function getWorkbook(data) {
    const workbook = new ExcelJS.Workbook();
    const now = new Date();
    workbook.creator = 'OneAD_JamieLee';
    workbook.created = now;
    workbook.modified = now;
    createSheet(workbook, data);

    return workbook;
  }

  function exportXlsx(data, filename) {
    getWorkbook(data)
      .xlsx.writeBuffer()
      .then(res => {
        save(res, `${filename}.${bookType}`);
      });
  }

  return {
    exportXlsx
  };
}
