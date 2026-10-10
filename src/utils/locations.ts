export interface CountryInfo {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
  timezone: string;
  utcOffset: string;
  currency: string;
  states: {
    name: string;
    cities: string[];
  }[];
}

export const COUNTRIES: CountryInfo[] = [
  {
    code: 'NG',
    name: 'Nigeria',
    dialCode: '+234',
    flag: '🇳🇬',
    timezone: 'Africa/Lagos',
    utcOffset: 'UTC+1',
    currency: 'NGN (₦)',
    states: [
      { name: 'Lagos', cities: ['Lagos Island', 'Ikeja', 'Lekki', 'Yaba', 'Victoria Island'] },
      { name: 'Abuja (FCT)', cities: ['Garki', 'Maitama', 'Wuse', 'Asokoro'] },
      { name: 'Rivers', cities: ['Port Harcourt', 'Obio-Akpor', 'Bonny'] },
      { name: 'Oyo', cities: ['Ibadan', 'Ogbomoso', 'Oyo'] },
      { name: 'Enugu', cities: ['Enugu City', 'Nsukka', 'Udi'] },
      { name: 'Kano', cities: ['Kano City', 'Fagge', 'Dala'] },
      { name: 'Edo', cities: ['Benin City', 'Auchi', 'Ekpoma'] },
    ],
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    dialCode: '+44',
    flag: '🇬🇧',
    timezone: 'Europe/London',
    utcOffset: 'UTC+0 (BST UTC+1)',
    currency: 'GBP (£)',
    states: [
      { name: 'Greater London', cities: ['London', 'Camden', 'Westminster', 'Greenwich', 'Hackney'] },
      { name: 'Greater Manchester', cities: ['Manchester', 'Salford', 'Bolton'] },
      { name: 'West Midlands', cities: ['Birmingham', 'Coventry', 'Wolverhampton'] },
      { name: 'West Yorkshire', cities: ['Leeds', 'Bradford', 'Wakefield'] },
      { name: 'Scotland', cities: ['Edinburgh', 'Glasgow', 'Aberdeen'] },
      { name: 'Wales', cities: ['Cardiff', 'Swansea', 'Newport'] },
    ],
  },
  {
    code: 'US',
    name: 'United States',
    dialCode: '+1',
    flag: '🇺🇸',
    timezone: 'America/New_York',
    utcOffset: 'UTC-5 (EST) / UTC-8 (PST)',
    currency: 'USD ($)',
    states: [
      { name: 'California', cities: ['Los Angeles', 'San Francisco', 'San Diego', 'San Jose'] },
      { name: 'New York', cities: ['New York City', 'Brooklyn', 'Buffalo', 'Queens'] },
      { name: 'Texas', cities: ['Austin', 'Houston', 'Dallas', 'San Antonio'] },
      { name: 'Florida', cities: ['Miami', 'Orlando', 'Tampa', 'Jacksonville'] },
      { name: 'Washington', cities: ['Seattle', 'Bellevue', 'Tacoma'] },
      { name: 'Illinois', cities: ['Chicago', 'Naperville', 'Aurora'] },
      { name: 'Georgia', cities: ['Atlanta', 'Savannah', 'Augusta'] },
    ],
  },
  {
    code: 'CA',
    name: 'Canada',
    dialCode: '+1',
    flag: '🇨🇦',
    timezone: 'America/Toronto',
    utcOffset: 'UTC-5 (EST)',
    currency: 'CAD ($)',
    states: [
      { name: 'Ontario', cities: ['Toronto', 'Ottawa', 'Mississauga', 'Brampton'] },
      { name: 'British Columbia', cities: ['Vancouver', 'Victoria', 'Burnaby', 'Surrey'] },
      { name: 'Quebec', cities: ['Montreal', 'Quebec City', 'Laval'] },
      { name: 'Alberta', cities: ['Calgary', 'Edmonton', 'Banff'] },
    ],
  },
  {
    code: 'IN',
    name: 'India',
    dialCode: '+91',
    flag: '🇮🇳',
    timezone: 'Asia/Kolkata',
    utcOffset: 'UTC+5:30',
    currency: 'INR (₹)',
    states: [
      { name: 'Maharashtra', cities: ['Mumbai', 'Pune', 'Nagpur'] },
      { name: 'Delhi NCR', cities: ['New Delhi', 'Noida', 'Gurugram'] },
      { name: 'Karnataka', cities: ['Bengaluru', 'Mysuru', 'Mangaluru'] },
      { name: 'Telangana', cities: ['Hyderabad', 'Warangal'] },
      { name: 'Tamil Nadu', cities: ['Chennai', 'Coimbatore', 'Madurai'] },
    ],
  },
  {
    code: 'GH',
    name: 'Ghana',
    dialCode: '+233',
    flag: '🇬🇭',
    timezone: 'Africa/Accra',
    utcOffset: 'UTC+0',
    currency: 'GHS (₵)',
    states: [
      { name: 'Greater Accra', cities: ['Accra', 'Tema', 'Madina'] },
      { name: 'Ashanti', cities: ['Kumasi', 'Obuasi'] },
      { name: 'Central', cities: ['Cape Coast', 'Winneba'] },
    ],
  },
  {
    code: 'DE',
    name: 'Germany',
    dialCode: '+49',
    flag: '🇩🇪',
    timezone: 'Europe/Berlin',
    utcOffset: 'UTC+1 (CET)',
    currency: 'EUR (€)',
    states: [
      { name: 'Berlin', cities: ['Berlin City', 'Mitte', 'Kreuzberg'] },
      { name: 'Bavaria', cities: ['Munich', 'Nuremberg', 'Augsburg'] },
      { name: 'North Rhine-Westphalia', cities: ['Cologne', 'Dusseldorf', 'Dortmund'] },
      { name: 'Hesse', cities: ['Frankfurt', 'Wiesbaden', 'Kassel'] },
    ],
  },
  {
    code: 'AE',
    name: 'United Arab Emirates',
    dialCode: '+971',
    flag: '🇦🇪',
    timezone: 'Asia/Dubai',
    utcOffset: 'UTC+4',
    currency: 'AED (د.إ)',
    states: [
      { name: 'Dubai', cities: ['Downtown Dubai', 'Dubai Marina', 'Deira', 'Jumeirah'] },
      { name: 'Abu Dhabi', cities: ['Abu Dhabi City', 'Al Ain', 'Al Dhafra'] },
      { name: 'Sharjah', cities: ['Sharjah City', 'Khor Fakkan'] },
    ],
  },
  {
    code: 'KE',
    name: 'Kenya',
    dialCode: '+254',
    flag: '🇰🇪',
    timezone: 'Africa/Nairobi',
    utcOffset: 'UTC+3',
    currency: 'KES (KSh)',
    states: [
      { name: 'Nairobi', cities: ['Nairobi Central', 'Westlands', 'Kilimani', 'Karen'] },
      { name: 'Mombasa', cities: ['Mombasa Island', 'Nyali', 'Bamburi'] },
      { name: 'Kisumu', cities: ['Kisumu City', 'Kondele'] },
    ],
  },
  {
    code: 'BR',
    name: 'Brazil',
    dialCode: '+55',
    flag: '🇧🇷',
    timezone: 'America/Sao_Paulo',
    utcOffset: 'UTC-3',
    currency: 'BRL (R$)',
    states: [
      { name: 'São Paulo', cities: ['São Paulo', 'Campinas', 'Santos'] },
      { name: 'Rio de Janeiro', cities: ['Rio de Janeiro', 'Niterói'] },
      { name: 'Bahia', cities: ['Salvador', 'Feira de Santana'] },
    ],
  },
  {
    code: 'ZA',
    name: 'South Africa',
    dialCode: '+27',
    flag: '🇿🇦',
    timezone: 'Africa/Johannesburg',
    utcOffset: 'UTC+2',
    currency: 'ZAR (R)',
    states: [
      { name: 'Gauteng', cities: ['Johannesburg', 'Pretoria', 'Sandton'] },
      { name: 'Western Cape', cities: ['Cape Town', 'Stellenbosch'] },
      { name: 'KwaZulu-Natal', cities: ['Durban', 'Pietermaritzburg'] },
    ],
  },
  {
    code: 'FR',
    name: 'France',
    dialCode: '+33',
    flag: '🇫🇷',
    timezone: 'Europe/Paris',
    utcOffset: 'UTC+1 (CET)',
    currency: 'EUR (€)',
    states: [
      { name: 'Île-de-France', cities: ['Paris', 'Boulogne-Billancourt', 'Saint-Denis'] },
      { name: 'Auvergne-Rhône-Alpes', cities: ['Lyon', 'Grenoble', 'Saint-Étienne'] },
      { name: 'Provence-Alpes-Côte d\'Azur', cities: ['Marseille', 'Nice', 'Cannes'] },
    ],
  },
  {
    code: 'JP',
    name: 'Japan',
    dialCode: '+81',
    flag: '🇯🇵',
    timezone: 'Asia/Tokyo',
    utcOffset: 'UTC+9',
    currency: 'JPY (¥)',
    states: [
      { name: 'Tokyo', cities: ['Shibuya', 'Shinjuku', 'Minato', 'Ginza'] },
      { name: 'Osaka', cities: ['Osaka City', 'Sakai'] },
      { name: 'Kyoto', cities: ['Kyoto City', 'Uji'] },
    ],
  },
  {
    code: 'AU',
    name: 'Australia',
    dialCode: '+61',
    flag: '🇦🇺',
    timezone: 'Australia/Sydney',
    utcOffset: 'UTC+10 (AEST)',
    currency: 'AUD ($)',
    states: [
      { name: 'New South Wales', cities: ['Sydney', 'Newcastle', 'Wollongong'] },
      { name: 'Victoria', cities: ['Melbourne', 'Geelong', 'Ballarat'] },
      { name: 'Queensland', cities: ['Brisbane', 'Gold Coast', 'Cairns'] },
    ],
  },
  {
    code: 'IE',
    name: 'Ireland',
    dialCode: '+353',
    flag: '🇮🇪',
    timezone: 'Europe/Dublin',
    utcOffset: 'UTC+0 (IST UTC+1)',
    currency: 'EUR (€)',
    states: [
      { name: 'Leinster', cities: ['Dublin', 'Dún Laoghaire', 'Drogheda'] },
      { name: 'Munster', cities: ['Cork', 'Limerick', 'Galway'] },
    ],
  },
];

export function getCountryByCode(code: string): CountryInfo | undefined {
  return COUNTRIES.find((c) => c.code === code);
}

export function getCountryByName(name: string): CountryInfo | undefined {
  return COUNTRIES.find((c) => c.name.toLowerCase() === name.toLowerCase());
}
