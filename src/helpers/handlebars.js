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

      const lines = item.content.split('\n').map(line => {
        const linkified = line.replace(
          /(https?:\/\/[^\s]+)/g,
          url => `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`
        );
        return linkified;
      }).join('<br>');

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

      const rowSpanTracker = [];

      for (let r = 0; r < item.cells.length; r++) {
        const row = item.cells[r];
        let hasSpan = false;

        out += `<tr`;

        // Kiểm tra nếu hàng này bị ảnh hưởng bởi gộp từ trên xuống
        for (let c = 0; c < rowSpanTracker.length; c++) {
          if (rowSpanTracker[c] && rowSpanTracker[c] > 0) {
            hasSpan = true;
            break;
          }
        }

        // Kiểm tra nếu hàng này có ô cần gộp (rowSpan > 1 hoặc colSpan > 1)
        for (let c = 0; c < row.length; c++) {
          const cell = row[c];
          if (cell && (cell.rowSpan > 1 || cell.colSpan > 1)) {
            hasSpan = true;
            break;
          }
        }

        if (r === 0 || hasSpan) {
          out += ` class="bold-row"`;
        }

        out += `>`;

        let colIndex = 0;

        for (let c = 0; c < row.length; c++) {
          // Skip cột đang bị chiếm bởi rowSpan từ trên
          while (rowSpanTracker[colIndex] > 0) {
            rowSpanTracker[colIndex]--;
            colIndex++;
          }

          const cell = row[c];
          if (!cell) continue;

          const rowspan = cell.rowSpan > 1 ? ` rowspan="${cell.rowSpan}"` : '';
          const colspan = cell.colSpan > 1 ? ` colspan="${cell.colSpan}"` : '';
          const cellHtml = Handlebars.escapeExpression(cell.text).replace(/\n/g, '<br>');

          out += `<td${rowspan}${colspan} style="white-space: pre-wrap;">${cellHtml}</td>`;

          // Ghi nhận rowSpan cho các hàng tiếp theo
          const spanCols = cell.colSpan || 1;
          const spanRows = cell.rowSpan || 1;
          for (let i = 0; i < spanCols; i++) {
            rowSpanTracker[colIndex + i] = spanRows - 1;
          }

          colIndex += spanCols;
        }

        out += `</tr>`;
      }

      out += `</tbody></table></div>`;
    }
  });

  return new Handlebars.SafeString(out);
});

