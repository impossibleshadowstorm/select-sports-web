export const isValidIndianPhoneNumber = (phone: string): boolean => {
  const regex = /^[6-9]\d{9}$/; // Indian phone numbers start with 6-9 and have 10 digits
  return regex.test(phone);
};

export const isValidEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email validation regex
  return regex.test(email);
};

/**
 * Validates that all required fields are present in the request body.
 * @param body - The request body to validate.
 * @param requiredFields - List of required field names.
 * @returns Returns an object with `isValid` and `missingFields` keys.
 */
// export const validateRequiredFields = (
//   body: Record<string, any>, // `Record` to represent an object with string keys and any values
//   requiredFields: string[]
// ): { isValid: boolean, missingFields: string[] } => {
//   const missingFields = requiredFields.filter(
//     (field) =>
//       !Object.prototype.hasOwnProperty.call(body, field) ||
//       body[field] === undefined ||
//       body[field] === null ||
//       body[field] === ""
//   );

//   return {
//     isValid: missingFields.length === 0,
//     missingFields,
//   };
// };

/**
 * Validates required fields in an object, including nested objects.
 *
 * @param body - The object to validate.
 * @param requiredFields - An array of field paths (e.g., ["name", "address.street"]).
 * @returns An object with `isValid` (boolean) and `missingFields` (array of strings).
 */
export const validateRequiredFields = (
  body: Record<string, any>,
  requiredFields: string[]
): { isValid: boolean; missingFields: string[] } => {
  const missingFields: string[] = [];

  requiredFields.forEach((field) => {
    const parts = field.split('.'); // Split nested paths (e.g., "address.street")
    let value = body;

    // Traverse the nested object
    for (const part of parts) {
      if (value && Object.prototype.hasOwnProperty.call(value, part)) {
        value = value[part];
      } else {
        missingFields.push(field);
        break;
      }
    }

    // Check if the final value is empty
    if (
      value === undefined ||
      value === null ||
      value === '' ||
      (Array.isArray(value) && value.length === 0)
    ) {
      missingFields.push(field);
    }
  });

  return {
    isValid: missingFields.length === 0,
    missingFields
  };
};
