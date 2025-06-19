import '@testing-library/jest-dom';

export function validatePhone(phone) {
  // Пример: +7XXXXXXXXXX или +7700XXXXXXX
  const phoneRegex = /^\+7\d{10}$/;
  return phoneRegex.test(phone);
}