// helpers/handlebars.js
const Handlebars = require('handlebars');

// Đăng ký helper renderSectionItems
Handlebars.registerHelper('renderSectionItems', function (items, options) {
  let out = '';

  items.forEach(item => {
    if (item.type === 'text') {
      out += `<div class="report-subitem-view">`;
      out += `<h4>${Handlebars.escapeExpression(item.title)}</h4>`;
      const lines = item.content.split('\n').map(line => `- ${line.trim()}`).join('<br>');
      out += `<p>${lines}</p>`;
      if (item.children) {
        out += Handlebars.helpers.renderSectionItems(item.children, options);
      }
      out += `</div>`;
    } else if (item.type === 'table') {
      out += `<div class="report-subtable-view">`;
      out += `<h4>${Handlebars.escapeExpression(item.title)}</h4>`;
      out += `<table><thead><tr>`;
      item.cells[0]?.forEach(cell => {
        out += `<th>${Handlebars.escapeExpression(cell)}</th>`;
      });
      out += `</tr></thead><tbody>`;
      item.cells.slice(1).forEach(row => {
        out += `<tr>`;
        row.forEach(cell => {
          out += `<td>${Handlebars.escapeExpression(cell)}</td>`;
        });
        out += `</tr>`;
      });
      out += `</tbody></table></div>`;
    }
  });

  return new Handlebars.SafeString(out);
});
