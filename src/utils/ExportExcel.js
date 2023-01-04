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
    sheet.properties.defaultColWidth = 24;
    sheet.views = [
      {
        state: 'frozen',
        ySplit: 1
      }
    ];
    // // DATA
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
    workbook.creator = 'OneAD_Ryan';
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
