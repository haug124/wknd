export default async function decorate(block) {
  let formURL = block.textContent.trim();

  // Convert the Excel URL to its JSON equivalent
  if (formURL.endsWith('.xlsx')) {
    formURL = formURL.replace('.xlsx', '.json');  // ✅ Convert to JSON
  }

  console.log('Loading form from:', formURL);

  try {
    // Fetch the JSON file instead of the XLSX
    const response = await fetch(formURL);

    if (!response.ok) {
      throw new Error(`Failed to load form: ${response.status} ${response.statusText}`);
    }

    // Read JSON data
    const sheet = await response.json();

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
