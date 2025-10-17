const ones = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
const teens = ["ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
const tens = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

function convertHundreds(num: number): string {
  let result = "";
  
  if (num >= 100) {
    result += ones[Math.floor(num / 100)] + " hundred ";
    num %= 100;
  }
  
  if (num >= 20) {
    result += tens[Math.floor(num / 10)] + " ";
    num %= 10;
  } else if (num >= 10) {
    result += teens[num - 10] + " ";
    return result;
  }
  
  if (num > 0) {
    result += ones[num] + " ";
  }
  
  return result;
}

export function numberToWords(amount: number): string {
  if (amount === 0) return "Zero";
  
  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);
  
  let result = "";
  
  if (rupees >= 10000000) {
    const crores = Math.floor(rupees / 10000000);
    result += convertHundreds(crores) + "crore ";
    rupees % 10000000;
  }
  
  const remainingRupees = rupees % 10000000;
  
  if (remainingRupees >= 100000) {
    const lakhs = Math.floor(remainingRupees / 100000);
    result += convertHundreds(lakhs) + "lakh ";
  }
  
  const remaining = remainingRupees % 100000;
  
  if (remaining >= 1000) {
    const thousands = Math.floor(remaining / 1000);
    result += convertHundreds(thousands) + "thousand ";
  }
  
  const lastHundreds = remaining % 1000;
  if (lastHundreds > 0) {
    result += convertHundreds(lastHundreds);
  }
  
  result = result.trim();
  
  if (result) {
    result = result.charAt(0).toUpperCase() + result.slice(1) + " rupees";
  }
  
  if (paise > 0) {
    if (result) result += " and ";
    result += convertHundreds(paise).trim() + " paise";
  }
  
  return result + " only.";
}