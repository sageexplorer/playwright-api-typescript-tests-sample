export const USER = {
  name: 'Sage QA',
  password: 'Str0ng!Passw0rd',
  birthDay: '10',
  birthMonth: 'May',
  birthYear: '1990',
  firstName: 'Sage',
  lastName: 'QA',
  company: 'Sage QA Consulting',
  address: '123 Test Street',
  address2: 'Suite 4',
  country: 'United States',
  state: 'California',
  city: 'Los Angeles',
  zipcode: '90001',
  mobile: '3105550142',
};

export type User = typeof USER & { email: string };

export const PAYMENT = {
  nameOnCard: 'Sage QA',
  cardNumber: '4111111111111111',
  cvc: '311',
  expiryMonth: '12',
  expiryYear: '2030',
};

export type Payment = typeof PAYMENT;
