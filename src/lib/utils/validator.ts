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
export const validateRequiredFields = (
  body: Record<string, any>, // `Record` to represent an object with string keys and any values
  requiredFields: string[]
): { isValid: boolean, missingFields: string[] } => {
  const missingFields = requiredFields.filter(
    (field) =>
      !Object.prototype.hasOwnProperty.call(body, field) ||
      body[field] === undefined ||
      body[field] === null ||
      body[field] === ""
  );

  return {
    isValid: missingFields.length === 0,
    missingFields,
  };
};
