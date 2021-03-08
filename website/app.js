/*  Global Variables */
const apiToken = '360dc8cf569bf8c9958ce402540fbb5a';
const baseUrl = 'http://api.openweathermap.org/data/2.5/weather';
const loader = document.querySelector('.loader');
const zipCodeInput = document.getElementById('input-zip');
const zipCodeError = document.getElementById('zip-error');

/* *************************************
-------- Auxiliary Functions ---------------
****************************************
*/

/* Code inspiration: formValidator from MDN
//https://developer.mozilla.org/en-US/docs/Learn/Forms/Form_validation
*/

function showError() {
  if (zipCodeInput.validity.valueMissing) {
    zipCodeError.textContent = 'Missing ZIP Code';
  } else if (zipCodeInput.validity.tooShort) {
    zipCodeError.textContent = `Zip Code  must contain at least ${zipCodeInput.minLength} digits; 
    you entered ${zipCodeInput.value.length}.`;
  } else if (zipCodeInput.validity.tooLong) {
    zipCodeError.textContent = `Zip Code  must contain at maximum ${zipCodeInput.maxLength} digits;
     you entered ${zipCodeInput.value.length}.`;
  } else if (zipCodeInput.validity.patternMismatch) {
    zipCodeError.textContent = 'Entered value needs to be a valid US Zip Code.';
  }
  // Set the styling appropriately
  zipCodeError.className = 'error active';
  zipCodeInput.className = (!zipCodeInput.className.includes('error'))
    ? `${zipCodeInput.className} error` : zipCodeInput.className;
}

async function getWeatherInfo(zipCode) {
  const url = `${baseUrl}?zip=${zipCode}&appId=${apiToken}&units=imperial`;
  const response = await fetch(url);
  const { status } = response;
  const newData = await response.json();
  if (status !== 200) {
    if (newData.message === 'city not found') {
      return Promise.reject('cityNotFound');
    }
    return Promise.reject('statusCodeError');
  }
  return newData;
}

async function sendDataToServer(path, result) {
  const feelings = document.getElementById('feelings').value;
  const d = new Date();
  const newDate = `${d.getMonth()}.${d.getDate()}.${d.getFullYear()}`;
  const data = {
    temperature: `${result.main.temp} °F in ${result.name} `,
    date: newDate,
    userResponse: feelings,
  };
  const response = await fetch(path, {
    method: 'POST',
    credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data), // body data type must match "Content-Type" header
  });
  if (response.status !== 200) {
    Promise.reject('statusCodeError');
  }
}

async function updateUI() {
  try {
    const request = await fetch('/getData');
    if (request.status !== 200) {
      Promise.reject('statusCodeError');
    }
    let data = await request.json();
    data = data[data.length - 1];
    if (data) {
      document.querySelector('#date').innerHTML = data.date;
      document.querySelector('#temp').innerHTML = data.temperature;
      document.querySelector('#content').innerHTML = data.userResponse;
    }
  } catch (e) {
    console.log(`error ${e}`);
  }
}

/* *************************************
-------- Event Listeners ---------------
****************************************
*/
document.querySelector('#generate').addEventListener('click', (event) => {
  if (!zipCodeInput.validity.valid) {
    // If it isn't, we display an appropriate error message
    showError();
    alert("Invalid ZIP Code, not able to send form!")
  } else {
    console.log("Generate button clicked");
    loader.className = `${loader.className} active`;
    const zipCode = zipCodeInput.value;
    getWeatherInfo(zipCode)
      .then((result) => sendDataToServer('/addData', result))
      .then((result) => updateUI())
      .catch((error) => {
        if (error === 'cityNotFound') {
          alert('Provide a valid zipCode, operation was not possible to complete!');
        } else if (error == "TypeError: Failed to fetch") {
          alert('Please check your internet connection!');
        } else {
          console.log(error);
        }
      })
      .finally(() => {
        setTimeout(() => loader.className = 'loader', 300);
      });
  }
});

zipCodeInput.addEventListener('input', (event) => {
  if (zipCodeInput.validity.valid) {
    // In case there is an error message visible, if the field
    // is valid, we remove the error message.
    zipCodeError.textContent = ''; // Reset the content of the message
    zipCodeError.className = 'error'; // Reset the visual state of the message
    zipCodeInput.className = zipCodeInput.className.replace(' error', '');
  } else {
    // If there is still an error, show the correct error
    showError();
  }
});
