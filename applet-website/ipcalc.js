
const VALID_CHARS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '/']
const form = document.getElementById('calculator-form');
const input = document.getElementById('calculator-input-box');
const submitButton = document.querySelector('.input .arrow');

var networkAddress = '';
var netmask = '';
var numOfIPs = '';
var minIP = '';
var maxIP = '';
var broadcastAddress = '';

/*************************************************************************
 * INPUT VALIDATION FOR CALCULATOR-INPUT 
 *************************************************************************/ 

/**
 * Check if a character is [0-9]/'.'
 **/
const checkIPFormat = (char) => {
    if (!VALID_CHARS.includes(char)) {
        return false;
    }
    return true;
}

/**
 * Check if clipboard data only contains [0-9]/'.'
 * If it doesn't, get rid of all non-[0-9]/'.'
 * @param {'paste'} event 
 */
const checkIPFormatPasted = (event) => {
    let clipboardData;
    let buffer, pastedData = "";

    // Stop data actually being pasted into element
    event.stopPropagation();
    event.preventDefault();

    // Get pasted data via clipboard API
    clipboardData = event.clipboardData || window.clipboardData;
    buffer = clipboardData.getData('Text');

    // Filter and paste only valid characters
    for (let i = 0; i < buffer.length; i++) {
        if (checkIPFormat(buffer.charAt(i))) {
            pastedData += buffer.charAt(i);
        }
    }
    input.value = pastedData;
}

/**
 * Check if a new character is [0-9]/'.'
 * @param {*} event 
 */
const validateInput = (event) => {
    let end = input.value.length;
    if (checkIPFormat(input.value[end-1])) {
        return true;
    } else {
        // Get rid of whatever junk was just typed
        input.value = input.value.slice(0, end - 1);
    }
    console.log(input.value);
}

/**
 * Submit form by validating input, then calculating results if ok.
 * @param {'submit'} event 
 */
const submitForm = (event) => {
    event.preventDefault();
    // Check that input contains 3 '.' and 1 '/'
    let [octets, subnet] = input.value.split('/');
    octets = octets.split('.');
    // Check that octets and subnet are within valid range
    // If all good, calculate.
    calculate(octets, subnet);
}


/*************************************************************************
 * OTHER FUNCTIONS
 *************************************************************************/ 
const calculate = (octets, subnet) => {
    console.table(octets);
}

/**
 * Allow user to copy the calculated results
 * @param {*} id 
 */
function copyResult(id) {
    let copyText = document.getElementById(id).innerHTML;

    /* Copy the text inside the text field */
    navigator.clipboard.writeText(copyText);
}


input.addEventListener('input', validateInput);
input.addEventListener('paste', checkIPFormatPasted);
form.addEventListener('submit', submitForm);
