
const VALID_CHARS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '/'];
const INSUFFICIENT_OCTETS = -1;
const INVALID_SUBNET = -2;
const INVALID_OCTET = -3;
const form = document.getElementById('calculator-form');
const input = document.getElementById('calculator-input-box');
const submitButton = document.querySelector('.input .arrow');

const networkAddress = document.getElementById('network-address');
var netmask = document.getElementById('netmask');
var numOfIPs = document.getElementById('number-of-IPs');
var minIP = document.getElementById('min-IP');
var maxIP = document.getElementById('max-IP');
var broadcastAddress = document.getElementById('broadcast-address');

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
const checkInput = (event) => {
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
 * Check if an IP address is valid, return error code if not.
 * @returns int: 0 if successful
 */
const checkIPAddress = (octets, subnet) => {
    // Check that input contains 3 '.' and 1 '/'
    // Check that octets and subnet are within valid range
    if (octets.length != 4) return INSUFFICIENT_OCTETS;
    if (subnet.length == 0||
        subnet < 0 ||
        subnet > 32 ||
        Number.isNaN(Number(subnet))) { 
            return INVALID_SUBNET;
        }
    for (let octet of octets) {
        if (octet.length == 0 || 
            octet < 0 ||
            octet > 255 ||
            Number.isNaN(Number(octet))) {
            return INVALID_OCTET;
        }
    }

}
/**
 * Submit form by validating input, then calculating results if ok.
 * @param {'submit'} event 
 */
const submitForm = (event) => {
    event.preventDefault();
    let [octets, subnet] = input.value.split('/');
    octets = octets.split('.');
    switch(checkIPAddress(octets,subnet)) {
        case INSUFFICIENT_OCTETS:
            console.log("Insufficient octets");
            return;
        case INVALID_SUBNET:
            console.log("invalid subnet");
            return;
        case INVALID_OCTET:
            console.log("invalid octet");
            return;
        case 0:
            break;
    }
    returnCalculations(octets,subnet);
}


/*************************************************************************
 * OTHER FUNCTIONS
 *************************************************************************/ 
const returnCalculations = (octets, subnet) => {
    let netmaskArr = [255,255,255,255];
    let networkAddressArr = [];
    let numAddresses = 0xFFFFFFFF;
    let minArr = [0,0,0,0];
    let maxArr = [0,0,0,0];
    let broadcastArr = [0,0,0,0];

    /* Get the netmask, this will be used to calculate everything else. */
    let start = Math.floor(subnet/8); //index of octet to modify
    if (start != 4) {
    let numZeroes = 8 - (subnet % 8); //number of zeroes in that octet
    netmaskArr[start] = netmaskArr[start] >> numZeroes;
    netmaskArr[start] = netmaskArr[start] << numZeroes;
    // Following octets = 0
    if (start != 3) {
        for (let i = start+1; i < netmaskArr.length; i++) {
            netmaskArr[i] = 0;
        }
    }
    }
    /* Network address */
    for (let i in octets) {
        networkAddressArr[i] = netmaskArr[i] & octets[i];
    }
    /* Number of usable addresses */
    numAddresses = (numAddresses >>> subnet) - 1;
    if (subnet == 32) { numAddresses = 0;}
    /* Min address */
    minArr = [...networkAddressArr];
    /* Max address, broadcast address */
    for (let i in netmaskArr) {
        //We have to convert JS 32-bit into 16-bit...
        maxArr[i] = (~netmaskArr[i] << 24 >>> 24) | minArr[i];
        broadcastArr[i] = (~netmaskArr[i] << 24 >>> 24) | networkAddressArr[i];
    }
    if (subnet < 31) {
        minArr[3] += 1;
        maxArr[3] -= 1;
    }

    setResults(netmaskArr, networkAddressArr, numAddresses, minArr, maxArr, broadcastArr);
}

const setResults = (netmaskArr, networkAddressArr, numAddresses, minArr, maxArr, broadcastArr) => {
    netmask.innerHTML = netmaskArr.join('.');
    networkAddress.innerHTML = networkAddressArr.join('.');
    numOfIPs.innerHTML = numAddresses;
    minIP.innerHTML = minArr.join('.');
    maxIP.innerHTML = maxArr.join('.');
    broadcastAddress.innerHTML = broadcastArr.join('.');
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


input.addEventListener('input', checkInput);
input.addEventListener('paste', checkIPFormatPasted);
form.addEventListener('submit', submitForm);
