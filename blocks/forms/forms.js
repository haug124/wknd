export default async function decorate(block) {
  const formURL = block.textContent.trim();
  if (!formURL.endsWith('.xlsx')) {
    console.error('Invalid form URL:', formURL);
    return;
  }

  console.log('Loading form from:', formURL);

  const response = await fetch(formURL);
  if (!response.ok) {
    console.error('Error loading form:', response.statusText);
    block.innerHTML = `<p>Form could not be loaded. Please try again later.</p>`;
    return;
  }

  const data = await response.arrayBuffer();
  const workbook = XLSX.read(new Uint8Array(data), { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

  // Create form element
  const form = document.createElement('form');
  form.classList.add('registration-form');

  sheet.forEach((row) => {
    Object.keys(row).forEach((fieldName) => {
      const fieldWrapper = document.createElement('div');
      fieldWrapper.classList.add('form-field');

      const label = document.createElement('label');
      label.textContent = fieldName;
      fieldWrapper.appendChild(label);

      let input;
      if (row[fieldName].startsWith('[text]')) {
        input = document.createElement('input');
        input.type = 'text';
      } else if (row[fieldName].startsWith('[email]')) {
        input = document.createElement('input');
        input.type = 'email';
      } else if (row[fieldName].startsWith('[dropdown]')) {
        input = document.createElement('select');
        const options = row[fieldName].replace('[dropdown: ', '').replace(']', '').split(',');
        options.forEach((option) => {
          const optionElement = document.createElement('option');
          optionElement.textContent = option.trim();
          input.appendChild(optionElement);
        });
      }

      if (input) {
        input.name = fieldName;
        fieldWrapper.appendChild(input);
      }

      form.appendChild(fieldWrapper);
    });
  });

  // Add submit button
  const submitButton = document.createElement('button');
  submitButton.type = 'submit';
  submitButton.textContent = 'Join Waiting List';
  form.appendChild(submitButton);

  block.innerHTML = '';
  block.appendChild(form);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    alert('Form submitted! (Data handling needs to be set up)');
  });
}
