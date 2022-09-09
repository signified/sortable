function sortable(selectors, options) {

  let defaultOptions = {
    buttonClasses: ['sortable-button'],
    sortClasses: ['sortable-sort'],
    sortStringClasses: ['sortable-sort-string'],
    sortNumberClasses: ['sortable-sort-number'],
    sortDateClasses: ['sortable-sort-date'],
    sortAscendingClasses: ['sortable-sort-ascending'],
    sortDescendingClasses: ['sortable-sort-descending']
  };

  options = {
    ...defaultOptions,
    ...options
  };

  const isDate = function(value) {
    const date = new Date(value);
    return (date !== "Invalid Date") && !isNaN(date);
  }

  const isNumber = function(value) {
    return !isNaN(value);
  }

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

        let direction = 'ascending';
        if (th.hasAttribute('aria-sort') && th.getAttribute('aria-sort').toLowerCase() == 'ascending') {
          direction = 'descending';
        }

        for (let row of table.rows) {
          for (i = 0; i < row.cells.length; i++) {
            let cell = row.cells[i];
            for (let option in options) {
              cell.classList.remove(...options[option]);
            }
            cell.removeAttribute('aria-sort');
            if (i == cellIndex) {
              cell.classList.add(...options.sortClasses);
              if (direction == 'ascending') {
                cell.classList.add(...options.sortAscendingClasses);
              } else {
                cell.classList.add(...options.sortDescendingClasses);
              }
            }
          }
        }

        th.setAttribute('aria-sort', direction);

        rows.sort(function(a, b) {

          const aCell = a.cells[cellIndex];
          const bCell = b.cells[cellIndex];
          let aCellContent = aCell.textContent;
          let bCellContent = bCell.textContent;

          if (isNumber(aCellContent) && isNumber(bCellContent)) {
            th.classList.add(...options.sortNumberClasses);
            aCell.classList.add(...options.sortNumberClasses);
            bCell.classList.add(...options.sortNumberClasses);
            aCellContent = new Number(aCellContent);
            bCellContent = new Number(bCellContent);
            if (direction == 'ascending') {
              return aCellContent - bCellContent;
            } else {
              return bCellContent - aCellContent;
            }
          }

          if (isDate(aCellContent) && isDate(bCellContent)) {
            th.classList.add(...options.sortDateClasses);
            aCell.classList.add(...options.sortDateClasses);
            bCell.classList.add(...options.sortDateClasses);
            aCellContent = new Date(aCellContent);
            bCellContent = new Date(bCellContent);
            if (direction == 'ascending') {
              return aCellContent - bCellContent;
            } else {
              return bCellContent - aCellContent;
            }
          }

          th.classList.add(...options.sortStringClasses);
          aCell.classList.add(...options.sortStringClasses);
          bCell.classList.add(...options.sortStringClasses);
          if (direction == 'ascending') {
            return (aCellContent > bCellContent) ? 1 : -1;
          } else {
            return (aCellContent > bCellContent) ? -1 : 0;
          }

        });

        tBody.append(...rows);

      });

    });

  });

}
