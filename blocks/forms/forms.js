export default async function decorate(block) {
  const formURL = block.textContent.trim();

  // Ensure the form URL is correct
  if (!formURL.endsWith('booking.xlsx')) {  // ✅ Ensure we're using booking.xlsx
    console.error('Invalid form URL:', formURL);
    block.innerHTML = `<p>Error: Invalid form URL. Please check the file name.</p>`;
    return;
  }

  console.log('Attempting to load form from:', formURL);

  try {
    // Fetch the Excel file
    const response = await fetch(formURL);
    
    if (!response.ok) {
      throw new Error(`Failed to load form: ${response.status} ${response.statusText}`);
    }

    // Read the Excel file data
    const data = await response.arrayBuffer();
    const workbook = XLSX.read(new Uint8Array(data), { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    if (!sheet.length) {
      throw new Error('Form file is empty or not properly formatted.');
    }

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

    // Add a simple submission event (can be replaced with API handling)
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      alert('Form submitted! (Data handling needs to be set up)');
    });

  } catch (error) {
    console.error('Error processing form:', error);
    block.innerHTML = `<p>Error loading form: ${error.message}</p>`;
  }
}
