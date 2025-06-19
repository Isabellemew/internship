export function validateContractData(data) {
  const errors = [];
  if (!data.number || data.number.trim() === '') {
    errors.push('Номер договора обязателен');
  }
  if (!data.clientName || data.clientName.trim() === '') {
    errors.push('Имя клиента обязательно');
  }
  if (!data.startDate) {
    errors.push('Дата начала обязательна');
  }
  if (!data.endDate) {
    errors.push('Дата окончания обязательна');
  }
  if (data.startDate && data.endDate && new Date(data.endDate) <= new Date(data.startDate)) {
    errors.push('Дата окончания должна быть позже даты начала');
  }
  if (!data.amount || data.amount <= 0) {
    errors.push('Сумма должна быть положительной');
  }
  return errors;
}

export function validateFinancialField(value) {
  return !isNaN(value) && parseFloat(value) > 0;
}

export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhone(phone) {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone);
} 