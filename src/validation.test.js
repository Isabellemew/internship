import { validateContractData, validateEmail, validatePhone } from './validation';

describe('validateContractData', () => {
  it('should return error if number is missing', () => {
    const errors = validateContractData({ clientName: 'Клиент', startDate: '2024-01-01', endDate: '2024-01-02', amount: 100 });
    expect(errors).toContain('Номер договора обязателен');
  });

  it('should return error if amount is not positive', () => {
    const errors = validateContractData({ number: '1', clientName: 'Клиент', startDate: '2024-01-01', endDate: '2024-01-02', amount: 0 });
    expect(errors).toContain('Сумма должна быть положительной');
  });
});

describe('validateEmail', () => {
  it('should validate correct email', () => {
    expect(validateEmail('test@example.com')).toBe(true);
  });
  it('should invalidate incorrect email', () => {
    expect(validateEmail('test@.com')).toBe(false);
  });
});

describe('validatePhone', () => {
  it('should validate correct phone', () => {
    expect(validatePhone('+77001234567')).toBe(true);
  });
  it('should invalidate incorrect phone', () => {
    expect(validatePhone('12345')).toBe(false);
  });
}); 