// helpers/handlebars.js
const Handlebars = require('handlebars');

// Đăng ký helper renderSectionItems
Handlebars.registerHelper('renderSectionItems', function (items, options) {
  let out = '';

  items.forEach(item => {
    if (item.type === 'text') {
      out += `<div class="report-subitem-view">`;
      out += `<h4>${Handlebars.escapeExpression(item.title)}</h4>`;
      const lines = item.content.split('\n').map(line => `${line.trim()}`).join('<br>');
      out += `<p>${lines}</p>`;
      if (item.children) {
        out += Handlebars.helpers.renderSectionItems(item.children, options);
      }
      out += `</div>`;
    } if (item.type === 'table') {
  out += `<div class="report-subtable-view">`;
  if (item.title) {
    out += `<h4>${Handlebars.escapeExpression(item.title)}</h4>`;
  }
  out += `<table border="1" cellspacing="0" cellpadding="4"><tbody>`;

  const rowsCount = item.cells.length;

  // Tính số cột thực tế lớn nhất dựa trên colSpan để set maxCols
  let maxCols = 0;
  for (const row of item.cells) {
    let colCount = 0;
    for (const cell of row) {
      if (cell) {
        colCount += cell.colSpan || 1;
      } else {
        colCount += 1;
      }
    }
    if (colCount > maxCols) maxCols = colCount;
  }

  for (let r = 0; r < rowsCount; r++) {
    const row = item.cells[r];
    out += `<tr>`;

    let colIndex = 0; // vị trí cột thực tế trên bảng

    for (let i = 0; i < row.length; i++) {
      const cell = row[i];

      if (cell === null) {
        // ô null do gộp (rowspan hoặc colspan), bỏ qua in, không tăng colIndex
        continue;
      }

      const rowspan = cell.rowSpan > 1 ? ` rowspan="${cell.rowSpan}"` : '';
      const colspan = cell.colSpan > 1 ? ` colspan="${cell.colSpan}"` : '';

      out += `<td${rowspan}${colspan}>${Handlebars.escapeExpression(cell.text)}</td>`;

      colIndex += cell.colSpan || 1;
    }

    out += `</tr>`;
  }

  out += `</tbody></table></div>`;
}



  });

  return new Handlebars.SafeString(out);
});
