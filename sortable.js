function sortable(selectors, options) {

  let defaultOptions = {
    buttonClasses: ['sortable-button'],
    sortedClasses: ['sortable-sorted'],
    sortedAscendingClasses: ['sortable-sorted-ascending'],
    sortedDescendingClasses: ['sortable-sorted-descending']
  };

  options = {
    ...defaultOptions,
    ...options
  };

  const getDataType = function(tBody, cellIndex) {
    let dataType = 'default';
    let values = [];
    for (let row of tBody.rows) {
      for (let i = 0; i < row.cells.length; i++) {
        if (i == cellIndex) {
          values.push(row.cells[i].textContent);
        }
      }
    }
    if (values.every(isDate)) {
      dataType = 'date';
    }
    return dataType;
  };

  const isDate = function(value) {
    const isValidDate = (date) => date instanceof Date && !isNaN(date.getTime());
    if (value instanceof Date) {
      return isValidDate(value);
    }
    if (typeof value === "string") {
      const dateStringRegex = /^[0-9A-Za-z\s:\-\/,]+$/;
      if (!dateStringRegex.test(value)) return false;
      const date = new Date(value);
      return isValidDate(date);
    }
    if (typeof value === "number") {
      const date = new Date(value);
      return isValidDate(date);
    }
    return false;
  };

  const sortDefault = function(first, second) {
    return first.localeCompare(second, navigator.languages[0] || navigator.language, {numeric: true, ignorePunctuation: true});
  };

  const tables = document.querySelectorAll(selectors);

  tables.forEach(function (table) {

    if (table.tagName.toLowerCase() !== 'table') {
      return;
    }

    const tHead = table.tHead;

    const tBody = table.tBodies[0];

    const rows = Array.from(tBody.rows);

    tHead.querySelectorAll('th').forEach(function (th, cellIndex) {

      th.innerHTML = `<button type="button">${th.innerText}</button>`;
      let button = th.firstChild;
      button.classList.add(...options.buttonClasses);

      button.addEventListener('click', function () {

        const dataType = getDataType(tBody, cellIndex);

        let direction = 'ascending';
        if (th.hasAttribute('aria-sort') && th.getAttribute('aria-sort').toLowerCase() == 'ascending') {
          direction = 'descending';
        }

        for (let row of table.rows) {
          for (let i = 0; i < row.cells.length; i++) {
            let cell = row.cells[i];
            for (let option in options) {
              cell.classList.remove(...options[option]);
            }
            cell.removeAttribute('aria-sort');
            if (i == cellIndex) {
              cell.classList.add(...options.sortedClasses);
              if (direction == 'ascending') {
                cell.classList.add(...options.sortedAscendingClasses);
              } else {
                cell.classList.add(...options.sortedDescendingClasses);
              }
            }
          }
        }

        th.setAttribute('aria-sort', direction);

        rows.sort(function(a, b) {

          const aCell = a.cells[cellIndex];
          const bCell = b.cells[cellIndex];

          let aCellContent = aCell.textContent.toLowerCase().trim();
          let bCellContent = bCell.textContent.toLowerCase().trim();

          switch (dataType) {
            case 'date':
              aCellContent = new Date(aCellContent);
              bCellContent = new Date(bCellContent);
              return (direction == 'ascending') ? aCellContent - bCellContent : bCellContent - aCellContent;
              break;
            default:
              return (direction == 'ascending') ? sortDefault(aCellContent, bCellContent) : sortDefault(bCellContent, aCellContent)
          }

        });

        tBody.append(...rows);

      });

    });

  });

}
