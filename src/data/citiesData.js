// MoveUp - Cities Dataset and Helpers (Turkey & Azerbaijan)

export const DEFAULT_CITIES = [
  // --- AZERBAYCAN ---
  {
    id: 'baku',
    name: 'Bakı',
    country: 'Azerbaycan',
    flag: '🇦🇿',
    total_points: 42500,
    aliases: ['baku', 'baki', 'bakı', 'baku city']
  },
  {
    id: 'ganja',
    name: 'Gəncə',
    country: 'Azerbaycan',
    flag: '🇦🇿',
    total_points: 28400,
    aliases: ['ganja', 'gence', 'gəncə', 'ganja city']
  },
  {
    id: 'sumgayit',
    name: 'Sumqayıt',
    country: 'Azerbaycan',
    flag: '🇦🇿',
    total_points: 24100,
    aliases: ['sumgayit', 'sumqayit', 'sumqayıt']
  },
  {
    id: 'mingachevir',
    name: 'Mingəçevir',
    country: 'Azerbaycan',
    flag: '🇦🇿',
    total_points: 15300,
    aliases: ['mingachevir', 'mingecevir', 'mingəçevir']
  },
  {
    id: 'nakhchivan',
    name: 'Naxçıvan',
    country: 'Azerbaycan',
    flag: '🇦🇿',
    total_points: 13900,
    aliases: ['nakhchivan', 'nahcivan', 'naxçıvan', 'nakhichevan']
  },
  {
    id: 'sheki',
    name: 'Şəki',
    country: 'Azerbaycan',
    flag: '🇦🇿',
    total_points: 12200,
    aliases: ['sheki', 'seki', 'şəki', 'shaki']
  },
  {
    id: 'lankaran',
    name: 'Lənkəran',
    country: 'Azerbaycan',
    flag: '🇦🇿',
    total_points: 11400,
    aliases: ['lankaran', 'lenkeran', 'lənkəran']
  },
  {
    id: 'shirvan',
    name: 'Şirvan',
    country: 'Azerbaycan',
    flag: '🇦🇿',
    total_points: 9800,
    aliases: ['shirvan', 'sirvan', 'şirvan']
  },
  {
    id: 'khirdalan',
    name: 'Xırdalan',
    country: 'Azerbaycan',
    flag: '🇦🇿',
    total_points: 9200,
    aliases: ['khirdalan', 'xirdalan', 'xırdalan']
  },
  {
    id: 'guba',
    name: 'Quba',
    country: 'Azerbaycan',
    flag: '🇦🇿',
    total_points: 8400,
    aliases: ['guba', 'quba']
  },
  {
    id: 'shamakhi',
    name: 'Şamaxı',
    country: 'Azerbaycan',
    flag: '🇦🇿',
    total_points: 7600,
    aliases: ['shamakhi', 'samaxi', 'şamaxı']
  },
  {
    id: 'gabala',
    name: 'Qəbələ',
    country: 'Azerbaycan',
    flag: '🇦🇿',
    total_points: 7100,
    aliases: ['gabala', 'qebele', 'qəbələ']
  },
  {
    id: 'zaqatala',
    name: 'Zaqatala',
    country: 'Azerbaycan',
    flag: '🇦🇿',
    total_points: 6500,
    aliases: ['zaqatala', 'zagatala']
  },
  {
    id: 'yevlakh',
    name: 'Yevlax',
    country: 'Azerbaycan',
    flag: '🇦🇿',
    total_points: 5900,
    aliases: ['yevlakh', 'yevlax']
  },

  // --- TÜRKİYE ---
  {
    id: 'istanbul',
    name: 'İstanbul',
    country: 'Türkiye',
    flag: '🇹🇷',
    total_points: 48900,
    aliases: ['istanbul', 'ıstanbul', 'istanbul province', 'stamboul']
  },
  {
    id: 'ankara',
    name: 'Ankara',
    country: 'Türkiye',
    flag: '🇹🇷',
    total_points: 41200,
    aliases: ['ankara', 'ankara province', 'angora']
  },
  {
    id: 'izmir',
    name: 'İzmir',
    country: 'Türkiye',
    flag: '🇹🇷',
    total_points: 35600,
    aliases: ['izmir', 'ızmir', 'smyrna']
  },
  {
    id: 'bursa',
    name: 'Bursa',
    country: 'Türkiye',
    flag: '🇹🇷',
    total_points: 29700,
    aliases: ['bursa', 'bursa province']
  },
  {
    id: 'antalya',
    name: 'Antalya',
    country: 'Türkiye',
    flag: '🇹🇷',
    total_points: 26800,
    aliases: ['antalya', 'antalya province']
  },
  {
    id: 'adana',
    name: 'Adana',
    country: 'Türkiye',
    flag: '🇹🇷',
    total_points: 22100,
    aliases: ['adana']
  },
  {
    id: 'konya',
    name: 'Konya',
    country: 'Türkiye',
    flag: '🇹🇷',
    total_points: 20500,
    aliases: ['konya']
  },
  {
    id: 'gaziantep',
    name: 'Gaziantep',
    country: 'Türkiye',
    flag: '🇹🇷',
    total_points: 19400,
    aliases: ['gaziantep', 'antep']
  },
  {
    id: 'kocaeli',
    name: 'Kocaeli',
    country: 'Türkiye',
    flag: '🇹🇷',
    total_points: 17200,
    aliases: ['kocaeli', 'izmit']
  },
  {
    id: 'mersin',
    name: 'Mersin',
    country: 'Türkiye',
    flag: '🇹🇷',
    total_points: 16100,
    aliases: ['mersin', 'icel', 'içel']
  },
  {
    id: 'diyarbakir',
    name: 'Diyarbakır',
    country: 'Türkiye',
    flag: '🇹🇷',
    total_points: 14900,
    aliases: ['diyarbakir', 'diyarbakır']
  },
  {
    id: 'kayseri',
    name: 'Kayseri',
    country: 'Türkiye',
    flag: '🇹🇷',
    total_points: 13900,
    aliases: ['kayseri']
  },
  {
    id: 'eskisehir',
    name: 'Eskişehir',
    country: 'Türkiye',
    flag: '🇹🇷',
    total_points: 13200,
    aliases: ['eskisehir', 'eskişehir']
  },
  {
    id: 'samsun',
    name: 'Samsun',
    country: 'Türkiye',
    flag: '🇹🇷',
    total_points: 12100,
    aliases: ['samsun']
  },
  {
    id: 'trabzon',
    name: 'Trabzon',
    country: 'Türkiye',
    flag: '🇹🇷',
    total_points: 11500,
    aliases: ['trabzon', 'trebizond']
  },
  {
    id: 'denizli',
    name: 'Denizli',
    country: 'Türkiye',
    flag: '🇹🇷',
    total_points: 10200,
    aliases: ['denizli']
  },
  {
    id: 'sanliurfa',
    name: 'Şanlıurfa',
    country: 'Türkiye',
    flag: '🇹🇷',
    total_points: 9600,
    aliases: ['sanliurfa', 'şanlıurfa', 'urfa']
  },
  {
    id: 'malatya',
    name: 'Malatya',
    country: 'Türkiye',
    flag: '🇹🇷',
    total_points: 8800,
    aliases: ['malatya']
  },
  {
    id: 'erzurum',
    name: 'Erzurum',
    country: 'Türkiye',
    flag: '🇹🇷',
    total_points: 8100,
    aliases: ['erzurum']
  },
  {
    id: 'canakkale',
    name: 'Çanakkale',
    country: 'Türkiye',
    flag: '🇹🇷',
    total_points: 7400,
    aliases: ['canakkale', 'çanakkale']
  }
];

// Normalize strings for fuzzy matching across Turkish & Azerbaijani characters
export const normalizeText = (text) => {
  if (!text) return '';
  return text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/ə/g, 'e')
    .replace(/ı/g, 'i')
    .replace(/i̇/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

// Match a city from geolocation name against our list
export const findMatchingCity = (query, cityList = DEFAULT_CITIES) => {
  if (!query) return null;
  const normalizedQuery = normalizeText(query);

  // 1. Direct or normalized name match
  let found = cityList.find(c => {
    const normName = normalizeText(c.name);
    return normName === normalizedQuery;
  });
  if (found) return found;

  // 2. Check aliases
  found = cityList.find(c => {
    if (!c.aliases || !Array.isArray(c.aliases)) return false;
    return c.aliases.some(alias => normalizeText(alias) === normalizedQuery);
  });
  if (found) return found;

  // 3. Substring match (e.g., "Baku City" contains "baku", or "Istanbul Province")
  found = cityList.find(c => {
    const normName = normalizeText(c.name);
    return normalizedQuery.includes(normName) || normName.includes(normalizedQuery);
  });
  if (found) return found;

  // 4. Substring in aliases
  found = cityList.find(c => {
    if (!c.aliases || !Array.isArray(c.aliases)) return false;
    return c.aliases.some(alias => {
      const normAlias = normalizeText(alias);
      return normalizedQuery.includes(normAlias) || normAlias.includes(normalizedQuery);
    });
  });

  return found || null;
};

// Group cities by country
export const groupCitiesByCountry = (cityList = DEFAULT_CITIES) => {
  const azerbaijan = [];
  const turkey = [];
  const others = [];

  cityList.forEach(city => {
    const country = city.country || '';
    if (country.toLowerCase().includes('azerbaycan') || country.toLowerCase().includes('azerbaijan') || city.flag === '🇦🇿') {
      azerbaijan.push(city);
    } else if (country.toLowerCase().includes('türk') || country.toLowerCase().includes('turkey') || city.flag === '🇹🇷') {
      turkey.push(city);
    } else {
      others.push(city);
    }
  });

  return { azerbaijan, turkey, others };
};

// Helper to get city name by id
export const getCityNameById = (id, cityList = DEFAULT_CITIES) => {
  if (!id) return '';
  const match = cityList.find(c => String(c.id) === String(id));
  return match ? match.name : '';
};
