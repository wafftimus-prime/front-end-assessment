import moment from "moment";
import { Pipe, PipeTransform } from '@angular/core';

/**
 * Checks if the first letter of a given name is a vowel.
 *
 * @function checkForVowel
 * @param {string} name - The name to check.
 * @returns {boolean} Returns true if the first letter is a vowel, false otherwise.
 *
 * @description
 * This function takes a name as input and determines whether its first letter
 * is a vowel. It considers 'a', 'e', 'i', 'o', and 'u' as vowels, regardless
 * of case sensitivity.
 *
 * @example
 * checkForVowel("Alice"); // returns true
 * checkForVowel("Bob");   // returns false
 * checkForVowel("Eve");   // returns true
 *
 * @throws {TypeError} Throws an error if the input is not a string.
 */
export function checkForVowel(name: string) {
  // Array of vowels to check against
  const VOWELS = ["a", "e", "i", "o", "u"];

  // Convert the first letter of the name to lowercase
  const first_letter = name[0].toLocaleLowerCase()

  // Check if the first letter is included in the VOWELS array
  return VOWELS.includes(first_letter)
}

/**
 * Sorts an array of objects based on a specified attribute, type, and direction.
 * @param {Array} array - The array to be sorted.
 * @param {string} attribute - The attribute to sort by.
 * @param {string} type - The data type of the attribute ('boolean', 'string', 'number', or 'date').
 * @param {string} direction - The sort direction ('asc' for ascending or 'desc' for descending).
 * @returns {Array} The sorted array.
 */
export function sortArray(array: any[], attribute: string, type: 'boolean' | 'string' | 'number' | 'date', direction: 'asc' | 'desc') {
  // Validate inputs
  if (!Array.isArray(array)) throw new Error('First argument must be an array');
  if (typeof attribute !== 'string') throw new Error('Attribute must be a string');
  if (!['boolean', 'string', 'number', 'date'].includes(type)) throw new Error('Invalid type');
  if (!['asc', 'desc'].includes(direction)) throw new Error('Direction must be "asc" or "desc"');

  // Create a copy of the array to avoid modifying the original
  const sortedArray = [...array];

  sortedArray.sort((a, b) => {
    let valueA = a[attribute];
    let valueB = b[attribute];

    // Handle different types
    switch (type) {
      case 'boolean':
        // Convert to number for easy comparison
        valueA = valueA ? 1 : 0;
        valueB = valueB ? 1 : 0;
        break;
      case 'string':
        // Convert to lowercase for case-insensitive sorting
        valueA = valueA.toLowerCase();
        valueB = valueB.toLowerCase();
        break;
      case 'number':
        // Ensure values are numbers
        valueA = Number(valueA);
        valueB = Number(valueB);
        break;
      case 'date':
        // Convert to Date objects
        valueA = new Date(valueA);
        valueB = new Date(valueB);
        break;
    }

    // Compare values
    if (valueA < valueB) return direction === 'asc' ? -1 : 1;
    if (valueA > valueB) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  return sortedArray;
}

/**
 * To check whether the object is null or undefined.
 * @param {Object} value - To check the object is null or undefined
 * @return {boolean}
 * @private
 */
export function isNullOrUndefined(value: Object): boolean {
  return value === undefined || value === null;
}

export function ignoreClick(event: Event) {
  event.cancelBubble = true;
  event.stopPropagation();
}



@Pipe({
  name: 'removeUnderScore',
  standalone: true // This makes the pipe standalone
})
export class RemoveUnderScorePipe implements PipeTransform {
  transform(value: any, ...args: any[]): any {
    try {
      return value.replace(/_|-/g, ' ');
    } catch (e) {
      return value;
    }
  }
}
