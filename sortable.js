function sortable(selectors, options = {}) {

  const defaultOptions = {
    buttonClasses: ['sortable-button'],
    sortedClasses: ['sortable-sorted'],
    sortedAscendingClasses: ['sortable-sorted-ascending'],
    sortedDescendingClasses: ['sortable-sorted-descending']
  };

  options = { ...defaultOptions, ...options };

  const isDate = (value) => {
    const isValidDate = (date) => date instanceof Date && !isNaN(date.getTime());
    if (value instanceof Date) return isValidDate(value);
    if (typeof value === 'string') {
      if (!/^[0-9A-Za-z\s:\-\/,]+$/.test(value)) return false;
      return isValidDate(new Date(value));
    }
    if (typeof value === 'number') return isValidDate(new Date(value));
    return false;
  };

  const isNumber = (value) => !isNaN(value);

  const getDataType = (tBody, cellIndex) => {
    const values = Array.from(tBody.rows, row => row.cells[cellIndex]?.textContent || '');
    if (values.every(isDate)) return 'date';
    if (values.every(isNumber)) return 'number';
    return 'string';
  };

  const sortString = (a, b) =>
    a.localeCompare(b, navigator.languages?.[0] || navigator.language, {
      numeric: true,
      ignorePunctuation: true
    });

  document.querySelectorAll(selectors).forEach((table) => {

    if (table.tagName.toLowerCase() !== 'table') return;

    const tHead = table.tHead;
    const tBody = table.tBodies[0];

    if (!tHead || !tBody) return;

    tHead.querySelectorAll('th').forEach((th, cellIndex) => {

      th.innerHTML = `<button type="button">${th.textContent.trim()}</button>`;
      const button = th.firstChild;
      button.classList.add(...options.buttonClasses);

      button.addEventListener('click', () => {

        const dataType = getDataType(tBody, cellIndex);

        const direction =
          th.getAttribute('aria-sort')?.toLowerCase() === 'ascending'
            ? 'descending'
            : 'ascending';

        table.querySelectorAll('th').forEach((header) => header.removeAttribute('aria-sort'));
        table.querySelectorAll('td, th').forEach((cell) => {
          Object.values(options).forEach((classes) => cell.classList.remove(...classes));
        });

        th.setAttribute('aria-sort', direction);

        const rowData = Array.from(tBody.rows).map((row) => {
          const cellText = row.cells[cellIndex]?.textContent.trim() ?? '';
          switch (dataType) {
            case 'date':
              return { row, value: new Date(cellText).getTime() };
            case 'number':
              return { row, value: Number(cellText) };
            default:
              return { row, value: cellText.toLowerCase() };
          }
        });

        rowData.sort((a, b) => {
          if (a.value === b.value) return 0;
          if (dataType === 'string') {
            return direction === 'ascending'
              ? sortString(a.value, b.value)
              : sortString(b.value, a.value);
          }
          return direction === 'ascending'
            ? a.value - b.value
            : b.value - a.value;
        });

        tBody.append(...rowData.map(item => item.row));

        Array.from(table.rows).forEach((row) => {
          const cell = row.cells[cellIndex];
          if (!cell) return;
          cell.classList.add(...options.sortedClasses);
          cell.classList.add(
            ...(direction === 'ascending'
              ? options.sortedAscendingClasses
              : options.sortedDescendingClasses)
          );
        });

      });

    });

  });

}
