// helpers/handlebars.js
const Handlebars = require('handlebars');


Handlebars.registerHelper('nonBreakingName', function(name) {
  if (!name) return '';
  return new Handlebars.SafeString(name.replace(/ /g, '&nbsp;'));
});
// Đăng ký helper renderSectionItems
Handlebars.registerHelper('renderSectionItems', function (items, options) {
  let out = '';

  items.forEach(item => {
    // Mục chính (có title + children): type = subitem
    if (item.type === 'subitem') {
      out += `<div class="report-subitem-view">`;

      if (item.title) {
        out += `<h4 class="subitem-title">${Handlebars.escapeExpression(item.title)}</h4>`;
      }

      if (Array.isArray(item.children)) {
        out += Handlebars.helpers.renderSectionItems(item.children, options);
      }

      out += `</div>`;
    }

    // Nội dung con: đoạn văn
    if (item.type === 'text') {
      out += `<div class="report-subitem-extra-view">`;
      const lines = item.content.split('\n').map(line => `${line.trim()}`).join('<br>');
      out += `<p class="subitem-text">${lines}</p>`;
      out += `</div>`;
    }

    // Nội dung con: bảng
    if (item.type === 'table') {
      out += `<div class="report-subtable-view">`;

      if (item.title) {
        out += `<h4 class="table-title">${Handlebars.escapeExpression(item.title)}</h4>`;
      }

      out += `<table class="report-table" border="1" cellspacing="0" cellpadding="4"><tbody>`;

      for (let r = 0; r < item.cells.length; r++) {
        const row = item.cells[r];
        out += `<tr>`;
        for (let c = 0; c < row.length; c++) {
          const cell = row[c];
          if (!cell) continue;

          const rowspan = cell.rowSpan > 1 ? ` rowspan="${cell.rowSpan}"` : '';
          const colspan = cell.colSpan > 1 ? ` colspan="${cell.colSpan}"` : '';
          const cellHtml = Handlebars.escapeExpression(cell.text).replace(/\n/g, '<br>');
          out += `<td${rowspan}${colspan}>${cellHtml}</td>`;
        }
        out += `</tr>`;
      }


      out += `</tbody></table></div>`;
    }
  });

  return new Handlebars.SafeString(out);
});

