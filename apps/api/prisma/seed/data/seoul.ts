import { PlaceCategory as C, TrailDifficulty as D } from '../../../src/generated/prisma/enums';
import { alwaysOpen, closedOn, everyDay, splitShift } from '../helpers';
import type { CitySeed } from '../types';

// Prices, hours and spend are estimates for planning purposes — review before relying on them.

export const seoul: CitySeed = {
  slug: 'seoul',
  nameKo: '서울',
  latitude: 37.5665,
  longitude: 126.978,
  population: 9_400_000,
  isFeatured: true,
  sortOrder: 1,
  text: {
    en: {
      name: 'Seoul',
      description:
        "South Korea's capital blends Joseon-dynasty palaces, traditional markets and ultramodern neighborhoods. It is where most trips begin, and its public transport is excellent.",
      bestTimeToVisit:
        'Spring (April–May) and autumn (September–November), with mild weather, cherry blossoms and colorful foliage.',
    },
    'pt-BR': {
      name: 'Seul',
      description:
        'Capital da Coreia do Sul, Seul mistura palácios da dinastia Joseon, mercados tradicionais e bairros ultramodernos. É a porta de entrada da maioria das viagens e tem transporte público excelente.',
      bestTimeToVisit:
        'Primavera (abril–maio) e outono (setembro–novembro), com clima ameno, cerejeiras e folhagem colorida.',
    },
  },
  districts: [
    {
      slug: 'hongdae',
      nameKo: '홍대',
      latitude: 37.5563,
      longitude: 126.9236,
      text: {
        en: {
          name: 'Hongdae',
          description:
            'University area around Hongik University, known for nightlife, street performers, indie shops and cafés.',
        },
        'pt-BR': {
          name: 'Hongdae',
          description:
            'Região universitária em torno da Universidade Hongik, conhecida pela vida noturna, artistas de rua, lojas independentes e cafés.',
        },
      },
    },
    {
      slug: 'gangnam',
      nameKo: '강남',
      latitude: 37.4979,
      longitude: 127.0276,
      text: {
        en: {
          name: 'Gangnam',
          description:
            'Business and luxury district south of the Han River, with wide avenues, malls, beauty clinics and upscale restaurants.',
        },
        'pt-BR': {
          name: 'Gangnam',
          description:
            'Distrito financeiro e de luxo ao sul do rio Han, com grandes avenidas, shoppings, clínicas de estética e restaurantes sofisticados.',
        },
      },
    },
    {
      slug: 'myeongdong',
      nameKo: '명동',
      latitude: 37.5636,
      longitude: 126.985,
      text: {
        en: {
          name: 'Myeongdong',
          description:
            'Downtown shopping hub famous for cosmetics stores, evening street food and well-located hotels.',
        },
        'pt-BR': {
          name: 'Myeongdong',
          description:
            'Principal área de compras do centro, famosa pelas lojas de cosméticos, comida de rua à noite e hotéis bem localizados.',
        },
      },
    },
    {
      slug: 'itaewon',
      nameKo: '이태원',
      latitude: 37.5345,
      longitude: 126.9946,
      text: {
        en: {
          name: 'Itaewon',
          description:
            'Multicultural neighborhood with food from around the world, bars, clubs and the nearby Gyeongnidan-gil.',
        },
        'pt-BR': {
          name: 'Itaewon',
          description:
            'Bairro multicultural com culinária do mundo todo, bares, casas noturnas e a vizinha Gyeongnidan-gil.',
        },
      },
    },
    {
      slug: 'insadong',
      nameKo: '인사동',
      latitude: 37.574,
      longitude: 126.985,
      text: {
        en: {
          name: 'Insadong',
          description:
            'Traditional street with galleries, craft shops and tea houses, within walking distance of the palaces and Bukchon.',
        },
        'pt-BR': {
          name: 'Insadong',
          description:
            'Rua tradicional com galerias, lojas de artesanato, casas de chá e acesso a pé aos palácios e ao vilarejo Bukchon.',
        },
      },
    },
  ],
  costEstimates: {
    BUDGET: {
      lodgingPerRoomPerNightKRW: 70_000,
      foodPerPersonPerDayKRW: 35_000,
      transportPerPersonPerDayKRW: 8_000,
      activitiesPerPersonPerDayKRW: 15_000,
    },
    MID: {
      lodgingPerRoomPerNightKRW: 180_000,
      foodPerPersonPerDayKRW: 70_000,
      transportPerPersonPerDayKRW: 15_000,
      activitiesPerPersonPerDayKRW: 40_000,
    },
    LUXURY: {
      lodgingPerRoomPerNightKRW: 450_000,
      foodPerPersonPerDayKRW: 150_000,
      transportPerPersonPerDayKRW: 50_000,
      activitiesPerPersonPerDayKRW: 100_000,
    },
  },
  places: [
    // ----- Restaurants -----
    {
      slug: 'gwangjang-market',
      category: C.RESTAURANT,
      nameKo: '광장시장',
      address: '88 Changgyeonggung-ro, Jongno-gu, Seoul',
      latitude: 37.57,
      longitude: 126.9996,
      priceLevel: 1,
      averageSpendKRW: 15_000,
      openingHours: everyDay('09:00', '23:00'),
      tags: ['street-food', 'market', 'traditional'],
      text: {
        en: {
          name: 'Gwangjang Market',
          description:
            "One of Seoul's oldest markets (1905). Its food stalls serve bindaetteok (mung bean pancakes), mayak gimbap and yukhoe.",
          hoursNote: 'Individual stalls may keep their own hours.',
        },
        'pt-BR': {
          name: 'Mercado Gwangjang',
          description:
            'Um dos mercados mais antigos de Seul (1905). As bancas de comida servem bindaetteok (panqueca de feijão), mayak gimbap e yukhoe.',
          hoursNote: 'Bancas individuais podem ter horários próprios.',
        },
      },
    },
    {
      slug: 'myeongdong-kyoja',
      category: C.RESTAURANT,
      nameKo: '명동교자',
      district: 'myeongdong',
      address: '29 Myeongdong 10-gil, Jung-gu, Seoul',
      latitude: 37.5625,
      longitude: 126.9856,
      priceLevel: 1,
      averageSpendKRW: 12_000,
      openingHours: everyDay('10:30', '21:00'),
      tags: ['noodles', 'classic', 'no-reservation'],
      text: {
        en: {
          name: 'Myeongdong Kyoja',
          description:
            'Opened in 1966 and famous for kalguksu (knife-cut noodle soup) and mandu. Lines move fast and tables are shared.',
        },
        'pt-BR': {
          name: 'Myeongdong Kyoja',
          description:
            'Casa fundada em 1966, famosa pelo kalguksu (sopa de macarrão cortado à faca) e pelos mandu. Fila rápida e mesas compartilhadas.',
        },
      },
    },
    {
      slug: 'tosokchon-samgyetang',
      category: C.RESTAURANT,
      nameKo: '토속촌 삼계탕',
      address: '5 Jahamun-ro 5-gil, Jongno-gu, Seoul',
      latitude: 37.5778,
      longitude: 126.9714,
      priceLevel: 2,
      averageSpendKRW: 22_000,
      openingHours: everyDay('10:00', '22:00'),
      tags: ['traditional', 'soup', 'classic'],
      text: {
        en: {
          name: 'Tosokchon Samgyetang',
          description:
            'Traditional restaurant near Gyeongbokgung Palace, known for samgyetang: a whole young chicken simmered with ginseng and rice.',
        },
        'pt-BR': {
          name: 'Tosokchon Samgyetang',
          description:
            'Restaurante tradicional perto do Palácio Gyeongbokgung, conhecido pelo samgyetang, frango inteiro cozido com ginseng e arroz.',
        },
      },
    },
    {
      slug: 'hadongkwan',
      category: C.RESTAURANT,
      nameKo: '하동관',
      district: 'myeongdong',
      address: 'Myeongdong, Jung-gu, Seoul',
      latitude: 37.5634,
      longitude: 126.9848,
      priceLevel: 2,
      averageSpendKRW: 18_000,
      openingHours: everyDay('07:00', '16:00'),
      tags: ['traditional', 'soup', 'breakfast'],
      text: {
        en: {
          name: 'Hadongkwan',
          description:
            "Serving gomtang (clear beef bone soup) since 1939, it is one of the city's oldest restaurants.",
          hoursNote: 'Closes when the day’s broth runs out.',
        },
        'pt-BR': {
          name: 'Hadongkwan',
          description:
            'Especialista em gomtang (caldo claro de carne bovina) desde 1939, uma das casas mais antigas da cidade.',
          hoursNote: 'Fecha quando o caldo do dia acaba.',
        },
      },
    },
    {
      slug: 'noryangjin-fish-market',
      category: C.RESTAURANT,
      nameKo: '노량진수산시장',
      address: '674 Nodeul-ro, Dongjak-gu, Seoul',
      latitude: 37.5133,
      longitude: 126.9405,
      priceLevel: 3,
      averageSpendKRW: 50_000,
      openingHours: everyDay('01:00', '22:00'),
      tags: ['seafood', 'market', 'experience'],
      text: {
        en: {
          name: 'Noryangjin Fish Market',
          description:
            'Huge wholesale seafood market. Pick your fish at the stalls and the upstairs restaurants cook it on the spot.',
          hoursNote: 'The auction takes place before dawn.',
        },
        'pt-BR': {
          name: 'Mercado de Peixes de Noryangjin',
          description:
            'Grande mercado atacadista de frutos do mar. Escolha o peixe nas bancas e os restaurantes do andar de cima preparam na hora.',
          hoursNote: 'O leilão acontece de madrugada.',
        },
      },
    },
    {
      slug: 'jungsik',
      category: C.RESTAURANT,
      nameKo: '정식당',
      district: 'gangnam',
      address: '11 Seolleung-ro 158-gil, Gangnam-gu, Seoul',
      latitude: 37.5254,
      longitude: 127.0405,
      priceLevel: 4,
      averageSpendKRW: 300_000,
      openingHours: splitShift(['12:00', '15:00'], ['17:30', '22:00']),
      tags: ['fine-dining', 'michelin', 'reservation-required'],
      text: {
        en: {
          name: 'Jungsik',
          description:
            'Michelin-starred restaurant that reinterprets Korean cuisine as a tasting menu. Book well in advance.',
        },
        'pt-BR': {
          name: 'Jungsik',
          description:
            'Restaurante com estrelas Michelin que reinterpreta a culinária coreana em menu degustação. Reserva antecipada é essencial.',
        },
      },
    },

    // ----- Nightlife -----
    {
      slug: 'hongdae-walking-street',
      category: C.NIGHTLIFE,
      nameKo: '홍대 걷고싶은거리',
      district: 'hongdae',
      address: 'Eoulmadang-ro, Mapo-gu, Seoul',
      latitude: 37.5563,
      longitude: 126.9236,
      priceLevel: 2,
      averageSpendKRW: 40_000,
      openingHours: alwaysOpen(),
      tags: ['clubs', 'live-music', 'young-crowd'],
      text: {
        en: {
          name: 'Hongdae Walking Street',
          description:
            "The heart of Hongdae's nightlife: street performances, bars, karaoke rooms and clubs that stay open until morning on weekends.",
          hoursNote: 'Bars and clubs mostly open in the evening.',
        },
        'pt-BR': {
          name: 'Rua Hongdae (Walking Street)',
          description:
            'Coração da noite de Hongdae: apresentações de rua, bares, karaokês e clubes que funcionam até de manhã nos fins de semana.',
          hoursNote: 'Bares e clubes abrem principalmente à noite.',
        },
      },
    },
    {
      slug: 'itaewon-bar-street',
      category: C.NIGHTLIFE,
      nameKo: '이태원 거리',
      district: 'itaewon',
      address: 'Itaewon-ro, Yongsan-gu, Seoul',
      latitude: 37.5345,
      longitude: 126.9946,
      priceLevel: 2,
      averageSpendKRW: 45_000,
      openingHours: alwaysOpen(),
      tags: ['bars', 'international', 'clubs'],
      text: {
        en: {
          name: 'Itaewon Bar Street',
          description:
            'A cluster of bars, pubs and clubs in Itaewon with an international crowd and food from many countries.',
          hoursNote: 'Busiest from Thursday to Saturday.',
        },
        'pt-BR': {
          name: 'Rua dos bares de Itaewon',
          description:
            'Concentração de bares, pubs e casas noturnas em Itaewon, com público internacional e cozinha de vários países.',
          hoursNote: 'Movimento maior de quinta a sábado.',
        },
      },
    },
    {
      slug: 'gyeongnidan-gil',
      category: C.NIGHTLIFE,
      nameKo: '경리단길',
      district: 'itaewon',
      address: 'Hoenamu-ro, Yongsan-gu, Seoul',
      latitude: 37.539,
      longitude: 126.989,
      priceLevel: 2,
      averageSpendKRW: 35_000,
      openingHours: alwaysOpen(),
      tags: ['bars', 'craft-beer', 'rooftop'],
      text: {
        en: {
          name: 'Gyeongnidan-gil',
          description:
            'A hillside street near Itaewon with craft beer bars, rooftops and small restaurants, calmer than the main strip.',
        },
        'pt-BR': {
          name: 'Gyeongnidan-gil',
          description:
            'Ladeira próxima a Itaewon com bares de cerveja artesanal, rooftops e restaurantes pequenos, mais tranquila que a rua principal.',
        },
      },
    },
    {
      slug: 'euljiro-nogari-alley',
      category: C.NIGHTLIFE,
      nameKo: '을지로 노가리골목',
      address: 'Euljiro 13-gil, Jung-gu, Seoul',
      latitude: 37.5663,
      longitude: 126.9915,
      priceLevel: 1,
      averageSpendKRW: 20_000,
      openingHours: everyDay('16:00', '24:00'),
      tags: ['beer', 'local', 'budget'],
      text: {
        en: {
          name: 'Euljiro Nogari Alley',
          description:
            'An alley full of plastic sidewalk tables where locals drink draft beer with nogari (dried pollock). A snapshot of working-class Seoul.',
        },
        'pt-BR': {
          name: 'Beco Nogari de Euljiro',
          description:
            'Beco cheio de mesas de plástico na calçada onde moradores tomam chope com nogari (peixe seco). Um retrato da Seul operária.',
        },
      },
    },
    {
      slug: 'gangnam-station',
      category: C.NIGHTLIFE,
      nameKo: '강남역',
      district: 'gangnam',
      address: 'Gangnam-daero, Gangnam-gu, Seoul',
      latitude: 37.4979,
      longitude: 127.0276,
      priceLevel: 3,
      averageSpendKRW: 60_000,
      openingHours: alwaysOpen(),
      tags: ['clubs', 'karaoke', 'bars'],
      text: {
        en: {
          name: 'Gangnam Station',
          description:
            'The area around Gangnam Station, packed with bars, late-night restaurants, karaoke rooms and clubs.',
        },
        'pt-BR': {
          name: 'Estação Gangnam',
          description:
            'Área em volta da estação Gangnam com bares, restaurantes abertos até tarde, karaokês e casas noturnas.',
        },
      },
    },

    // ----- Hiking -----
    {
      slug: 'bukhansan-baegundae-peak',
      category: C.HIKING,
      nameKo: '북한산 백운대',
      address: 'Bukhansan National Park, Gangbuk-gu, Seoul',
      latitude: 37.6588,
      longitude: 126.9779,
      priceLevel: 1,
      averageSpendKRW: 0,
      openingHours: alwaysOpen(),
      website: 'https://www.knps.or.kr',
      tags: ['national-park', 'views', 'challenging'],
      trail: { difficulty: D.HARD, distanceKm: 8.4, durationMinutes: 270, elevationGainM: 700 },
      text: {
        en: {
          name: 'Bukhansan — Baegundae Peak',
          description:
            "Seoul's highest peak (836 m), inside Bukhansan National Park. The final stretch has support cables and a view over the whole city.",
          hoursNote: 'Trails may close during heavy rain or high wildfire risk.',
        },
        'pt-BR': {
          name: 'Bukhansan — Pico Baegundae',
          description:
            'Pico mais alto de Seul (836 m), dentro do Parque Nacional Bukhansan. Trecho final com cabos de apoio e vista de toda a cidade.',
          hoursNote: 'Trilhas podem fechar em dias de chuva forte ou risco de incêndio.',
        },
      },
    },
    {
      slug: 'inwangsan',
      category: C.HIKING,
      nameKo: '인왕산',
      address: 'Jongno-gu, Seoul',
      latitude: 37.5853,
      longitude: 126.9578,
      priceLevel: 1,
      averageSpendKRW: 0,
      openingHours: alwaysOpen(),
      tags: ['city-wall', 'views', 'sunset'],
      trail: { difficulty: D.MODERATE, distanceKm: 4, durationMinutes: 120, elevationGainM: 300 },
      text: {
        en: {
          name: 'Inwangsan',
          description:
            'Rocky mountain next to the historic center, along the old city wall, with a great view of Gyeongbokgung Palace.',
        },
        'pt-BR': {
          name: 'Inwangsan',
          description:
            'Montanha rochosa ao lado do centro histórico, ao longo da muralha da cidade. Ótima vista do Palácio Gyeongbokgung.',
        },
      },
    },
    {
      slug: 'namsan-trail',
      category: C.HIKING,
      nameKo: '남산 둘레길',
      district: 'myeongdong',
      address: 'Namsan, Jung-gu, Seoul',
      latitude: 37.5512,
      longitude: 126.9882,
      priceLevel: 1,
      averageSpendKRW: 0,
      openingHours: alwaysOpen(),
      tags: ['easy', 'views', 'family'],
      trail: { difficulty: D.EASY, distanceKm: 3.5, durationMinutes: 90, elevationGainM: 200 },
      text: {
        en: {
          name: 'Namsan Trail',
          description:
            'A gentle climb on stairs and tree-lined paths up to N Seoul Tower, right in the middle of the city.',
        },
        'pt-BR': {
          name: 'Trilha do Namsan',
          description:
            'Subida tranquila por escadas e caminhos arborizados até a N Seoul Tower, no meio da cidade.',
        },
      },
    },
    {
      slug: 'achasan',
      category: C.HIKING,
      nameKo: '아차산',
      address: 'Gwangjin-gu, Seoul',
      latitude: 37.5524,
      longitude: 127.1022,
      priceLevel: 1,
      averageSpendKRW: 0,
      openingHours: alwaysOpen(),
      tags: ['easy', 'sunrise', 'han-river'],
      trail: { difficulty: D.EASY, distanceKm: 3, durationMinutes: 90, elevationGainM: 250 },
      text: {
        en: {
          name: 'Achasan',
          description:
            'A short trail in eastern Seoul, popular for watching the sunrise over the Han River.',
        },
        'pt-BR': {
          name: 'Achasan',
          description:
            'Trilha curta no leste de Seul, popular para ver o nascer do sol sobre o rio Han.',
        },
      },
    },
    {
      slug: 'gwanaksan',
      category: C.HIKING,
      nameKo: '관악산',
      address: 'Gwanak-gu, Seoul',
      latitude: 37.4446,
      longitude: 126.964,
      priceLevel: 1,
      averageSpendKRW: 0,
      openingHours: alwaysOpen(),
      tags: ['rocky', 'temple', 'views'],
      trail: { difficulty: D.MODERATE, distanceKm: 7, durationMinutes: 240, elevationGainM: 550 },
      text: {
        en: {
          name: 'Gwanaksan',
          description:
            'Mountain in the south of the city with rocky ridges and the small Yeonjuam hermitage near the 632 m summit.',
        },
        'pt-BR': {
          name: 'Gwanaksan',
          description:
            'Montanha no sul da cidade com cristas de pedra e o pequeno templo Yeonjuam perto do cume (632 m).',
        },
      },
    },

    // ----- Attractions -----
    {
      slug: 'n-seoul-tower',
      category: C.ATTRACTION,
      nameKo: 'N서울타워',
      address: '105 Namsangongwon-gil, Yongsan-gu, Seoul',
      latitude: 37.5512,
      longitude: 126.9882,
      priceLevel: 2,
      averageSpendKRW: 26_000,
      openingHours: everyDay('10:00', '23:00'),
      tags: ['views', 'romantic', 'night'],
      text: {
        en: {
          name: 'N Seoul Tower',
          description:
            'Tower on top of Namsan with a 360° observatory, famous for its love locks and the night view of the city.',
        },
        'pt-BR': {
          name: 'N Seoul Tower',
          description:
            'Torre no topo do Namsan com observatório 360°. Famosa pelos cadeados do amor e pela vista noturna da cidade.',
        },
      },
    },
    {
      slug: 'lotte-world-tower-seoul-sky',
      category: C.ATTRACTION,
      nameKo: '롯데월드타워 서울스카이',
      address: '300 Olympic-ro, Songpa-gu, Seoul',
      latitude: 37.5126,
      longitude: 127.1025,
      priceLevel: 3,
      averageSpendKRW: 31_000,
      openingHours: everyDay('10:30', '22:00'),
      tags: ['views', 'skyscraper', 'rainy-day'],
      text: {
        en: {
          name: 'Lotte World Tower — Seoul Sky',
          description:
            "Observatory in Korea's tallest building (555 m), with a glass floor and views over the Han River.",
        },
        'pt-BR': {
          name: 'Lotte World Tower — Seoul Sky',
          description:
            'Observatório no prédio mais alto da Coreia (555 m), com piso de vidro e vista do rio Han.',
        },
      },
    },
    {
      slug: 'lotte-world',
      category: C.ATTRACTION,
      nameKo: '롯데월드',
      address: '240 Olympic-ro, Songpa-gu, Seoul',
      latitude: 37.5111,
      longitude: 127.098,
      priceLevel: 3,
      averageSpendKRW: 62_000,
      openingHours: everyDay('10:00', '21:00'),
      tags: ['family', 'theme-park', 'rainy-day'],
      text: {
        en: {
          name: 'Lotte World',
          description:
            "Theme park with one of the world's largest indoor areas, plus the outdoor Magic Island on Seokchon Lake.",
        },
        'pt-BR': {
          name: 'Lotte World',
          description:
            'Parque temático com uma das maiores áreas cobertas do mundo, além da área externa Magic Island no lago Seokchon.',
        },
      },
    },
    {
      slug: 'dongdaemun-design-plaza',
      category: C.ATTRACTION,
      nameKo: '동대문디자인플라자',
      address: '281 Eulji-ro, Jung-gu, Seoul',
      latitude: 37.5665,
      longitude: 127.0092,
      priceLevel: 1,
      averageSpendKRW: 0,
      openingHours: everyDay('10:00', '20:00'),
      tags: ['architecture', 'design', 'free'],
      text: {
        en: {
          name: 'Dongdaemun Design Plaza (DDP)',
          description:
            'Futuristic Zaha Hadid building with design exhibitions, shops and, at night, a garden of LED roses.',
          hoursNote: 'Exhibitions are paid and keep their own hours.',
        },
        'pt-BR': {
          name: 'Dongdaemun Design Plaza (DDP)',
          description:
            'Edifício futurista de Zaha Hadid com exposições de design, lojas e, à noite, um jardim de rosas de LED.',
          hoursNote: 'Exposições são pagas e têm horários próprios.',
        },
      },
    },
    {
      slug: 'cheonggyecheon-stream',
      category: C.ATTRACTION,
      nameKo: '청계천',
      address: 'Cheonggyecheon-ro, Jongno-gu, Seoul',
      latitude: 37.5696,
      longitude: 126.9784,
      priceLevel: 1,
      averageSpendKRW: 0,
      openingHours: alwaysOpen(),
      tags: ['walk', 'free', 'night'],
      text: {
        en: {
          name: 'Cheonggyecheon Stream',
          description:
            'A restored 11 km stream running through downtown, with walkways, lit bridges and lantern festivals.',
        },
        'pt-BR': {
          name: 'Riacho Cheonggyecheon',
          description:
            'Riacho restaurado de 11 km que corta o centro, com passarelas, pontes iluminadas e festivais de lanternas.',
        },
      },
    },
    {
      slug: 'banpo-bridge-rainbow-fountain',
      category: C.ATTRACTION,
      nameKo: '반포대교 달빛무지개분수',
      address: 'Banpo Hangang Park, Seocho-gu, Seoul',
      latitude: 37.5126,
      longitude: 126.996,
      priceLevel: 1,
      averageSpendKRW: 0,
      openingHours: everyDay('19:30', '21:00'),
      tags: ['free', 'night', 'romantic'],
      text: {
        en: {
          name: 'Banpo Bridge Moonlight Rainbow Fountain',
          description:
            'Illuminated water jets along Banpo Bridge, with shows synchronized to music in Hangang Park.',
          hoursNote: 'Shows run from April to October; cancelled in the rain.',
        },
        'pt-BR': {
          name: 'Fonte Arco-Íris da Ponte Banpo',
          description:
            'Fonte com jatos de água iluminados ao longo da ponte Banpo, com shows sincronizados com música no Parque Hangang.',
          hoursNote: 'Shows de abril a outubro; não funciona com chuva.',
        },
      },
    },

    // ----- Cafés -----
    {
      slug: 'cafe-onion-anguk',
      category: C.CAFE,
      nameKo: '어니언 안국',
      district: 'insadong',
      address: '5 Gyedong-gil, Jongno-gu, Seoul',
      latitude: 37.5776,
      longitude: 126.9867,
      priceLevel: 2,
      averageSpendKRW: 15_000,
      openingHours: everyDay('07:00', '22:00'),
      tags: ['hanok', 'bakery', 'photogenic'],
      text: {
        en: {
          name: 'Café Onion Anguk',
          description:
            'Café in a traditional hanok house near Insadong, known for its pastries and inner courtyard.',
        },
        'pt-BR': {
          name: 'Café Onion Anguk',
          description:
            'Café em uma casa tradicional (hanok) perto de Insadong, conhecido pelos pães e pelo pátio interno.',
        },
      },
    },
    {
      slug: 'cafe-onion-seongsu',
      category: C.CAFE,
      nameKo: '어니언 성수',
      address: '8 Achasan-ro 9-gil, Seongdong-gu, Seoul',
      latitude: 37.5446,
      longitude: 127.0581,
      priceLevel: 2,
      averageSpendKRW: 15_000,
      openingHours: everyDay('08:00', '22:00'),
      tags: ['industrial', 'bakery', 'seongsu'],
      text: {
        en: {
          name: 'Café Onion Seongsu',
          description:
            'The original Onion, in a former factory in Seongsu, a neighborhood of workshops and concept stores.',
        },
        'pt-BR': {
          name: 'Café Onion Seongsu',
          description:
            'Unidade original da Onion, em uma antiga fábrica de Seongsu, bairro de ateliês e lojas conceito.',
        },
      },
    },
    {
      slug: 'fritz-coffee-company-dohwa',
      category: C.CAFE,
      nameKo: '프릳츠 도화점',
      address: 'Dohwa-dong, Mapo-gu, Seoul',
      latitude: 37.5414,
      longitude: 126.95,
      priceLevel: 2,
      averageSpendKRW: 12_000,
      openingHours: everyDay('08:00', '22:00'),
      tags: ['specialty-coffee', 'bakery', 'roastery'],
      text: {
        en: {
          name: 'Fritz Coffee Company (Dohwa)',
          description:
            'A leading Korean roastery with artisan bread and a retro visual identity inspired by the 1980s.',
        },
        'pt-BR': {
          name: 'Fritz Coffee Company (Dohwa)',
          description:
            'Torrefação coreana de referência, com pães artesanais e identidade visual retrô inspirada nos anos 1980.',
        },
      },
    },
    {
      slug: 'blue-bottle-samcheong',
      category: C.CAFE,
      nameKo: '블루보틀 삼청 카페',
      address: 'Samcheong-ro, Jongno-gu, Seoul',
      latitude: 37.5823,
      longitude: 126.9817,
      priceLevel: 2,
      averageSpendKRW: 10_000,
      openingHours: everyDay('09:00', '19:00'),
      tags: ['specialty-coffee', 'views', 'hanok'],
      text: {
        en: {
          name: 'Blue Bottle Samcheong',
          description:
            "Blue Bottle on Samcheong-dong's gallery street, with windows overlooking hanok rooftops.",
        },
        'pt-BR': {
          name: 'Blue Bottle Samcheong',
          description:
            'Unidade da Blue Bottle na rua de galerias de Samcheong-dong, com janelas voltadas para os telhados de hanok.',
        },
      },
    },
    {
      slug: 'ikseon-dong-cafes',
      category: C.CAFE,
      nameKo: '익선동 한옥거리',
      address: 'Ikseon-dong, Jongno-gu, Seoul',
      latitude: 37.574,
      longitude: 126.9895,
      priceLevel: 2,
      averageSpendKRW: 13_000,
      openingHours: alwaysOpen(),
      tags: ['hanok', 'alleys', 'photogenic'],
      text: {
        en: {
          name: 'Ikseon-dong Cafés',
          description:
            'Alleys of 1920s hanok houses turned into cafés, bakeries and restaurants. Crowded on weekends.',
          hoursNote: 'Each café keeps its own hours, usually 11:00–22:00.',
        },
        'pt-BR': {
          name: 'Cafés de Ikseon-dong',
          description:
            'Becos de hanoks dos anos 1920 transformados em cafés, confeitarias e restaurantes. Fica cheio nos fins de semana.',
          hoursNote: 'Cada café tem horário próprio, geralmente 11:00–22:00.',
        },
      },
    },

    // ----- Shopping -----
    {
      slug: 'myeongdong-shopping-street',
      category: C.SHOPPING,
      nameKo: '명동거리',
      district: 'myeongdong',
      address: 'Myeongdong-gil, Jung-gu, Seoul',
      latitude: 37.5636,
      longitude: 126.985,
      priceLevel: 2,
      averageSpendKRW: 50_000,
      openingHours: everyDay('10:00', '22:00'),
      tags: ['cosmetics', 'street-food', 'fashion'],
      text: {
        en: {
          name: 'Myeongdong Shopping Street',
          description:
            'Pedestrian streets packed with Korean cosmetics stores, fashion brands and evening street food stalls.',
        },
        'pt-BR': {
          name: 'Rua comercial de Myeongdong',
          description:
            'Ruas de pedestres repletas de lojas de cosméticos coreanos, marcas de moda e barracas de comida de rua à noite.',
        },
      },
    },
    {
      slug: 'starfield-coex-mall',
      category: C.SHOPPING,
      nameKo: '스타필드 코엑스몰',
      district: 'gangnam',
      address: '513 Yeongdong-daero, Gangnam-gu, Seoul',
      latitude: 37.5118,
      longitude: 127.0592,
      priceLevel: 3,
      averageSpendKRW: 60_000,
      openingHours: everyDay('10:30', '22:00'),
      tags: ['mall', 'library', 'rainy-day'],
      text: {
        en: {
          name: 'Starfield COEX Mall',
          description:
            'Underground mall in Gangnam, famous for the Starfield Library with 13-meter bookshelves and the COEX Aquarium.',
        },
        'pt-BR': {
          name: 'Starfield COEX Mall',
          description:
            'Shopping subterrâneo em Gangnam, famoso pela Biblioteca Starfield, com estantes de 13 metros, e pelo aquário COEX.',
        },
      },
    },
    {
      slug: 'namdaemun-market',
      category: C.SHOPPING,
      nameKo: '남대문시장',
      address: '21 Namdaemunsijang 4-gil, Jung-gu, Seoul',
      latitude: 37.5592,
      longitude: 126.9773,
      priceLevel: 1,
      averageSpendKRW: 30_000,
      openingHours: closedOn(['sun'], '07:00', '18:00'),
      tags: ['market', 'souvenirs', 'budget'],
      text: {
        en: {
          name: 'Namdaemun Market',
          description:
            "The country's largest traditional market, with clothes, kitchenware, ginseng, souvenirs and cheap street food.",
          hoursNote: 'Many shops close on Sundays.',
        },
        'pt-BR': {
          name: 'Mercado Namdaemun',
          description:
            'Maior mercado tradicional do país, com roupas, utensílios, ginseng, souvenirs e comida de rua a preços baixos.',
          hoursNote: 'Muitas lojas fecham aos domingos.',
        },
      },
    },

    // ----- Culture -----
    {
      slug: 'gyeongbokgung-palace',
      category: C.CULTURE,
      nameKo: '경복궁',
      address: '161 Sajik-ro, Jongno-gu, Seoul',
      latitude: 37.5796,
      longitude: 126.977,
      priceLevel: 1,
      averageSpendKRW: 3_000,
      openingHours: closedOn(['tue'], '09:00', '18:00'),
      website: 'https://royal.khs.go.kr',
      tags: ['palace', 'history', 'hanbok'],
      text: {
        en: {
          name: 'Gyeongbokgung Palace',
          description:
            'The main palace of the Joseon dynasty (1395). Catch the changing of the guard; visitors wearing hanbok get in free.',
          hoursNote: 'Closed on Tuesdays. Closing time varies by season.',
        },
        'pt-BR': {
          name: 'Palácio Gyeongbokgung',
          description:
            'Principal palácio da dinastia Joseon (1395). Não perca a troca da guarda; quem visita vestindo hanbok tem entrada gratuita.',
          hoursNote: 'Fechado às terças. Horário de fechamento varia conforme a estação.',
        },
      },
    },
    {
      slug: 'changdeokgung-palace',
      category: C.CULTURE,
      nameKo: '창덕궁',
      address: '99 Yulgok-ro, Jongno-gu, Seoul',
      latitude: 37.5794,
      longitude: 126.991,
      priceLevel: 1,
      averageSpendKRW: 8_000,
      openingHours: closedOn(['mon'], '09:00', '18:00'),
      website: 'https://royal.khs.go.kr',
      tags: ['palace', 'unesco', 'garden'],
      text: {
        en: {
          name: 'Changdeokgung Palace',
          description:
            'UNESCO World Heritage palace known for its Secret Garden (Huwon), visited only on guided tours.',
          hoursNote: 'Closed on Mondays. The Secret Garden requires a tour booking.',
        },
        'pt-BR': {
          name: 'Palácio Changdeokgung',
          description:
            'Palácio Patrimônio da UNESCO, conhecido pelo Jardim Secreto (Huwon), visitado apenas em tours guiados.',
          hoursNote: 'Fechado às segundas. O Jardim Secreto exige reserva de tour.',
        },
      },
    },
    {
      slug: 'bukchon-hanok-village',
      category: C.CULTURE,
      nameKo: '북촌한옥마을',
      district: 'insadong',
      address: 'Gyedong-gil, Jongno-gu, Seoul',
      latitude: 37.5826,
      longitude: 126.9831,
      priceLevel: 1,
      averageSpendKRW: 0,
      openingHours: everyDay('10:00', '17:00'),
      tags: ['hanok', 'history', 'free'],
      text: {
        en: {
          name: 'Bukchon Hanok Village',
          description:
            'Residential neighborhood with hundreds of traditional houses between the palaces. People live here, so keep your voice down.',
          hoursNote: 'Residential area with restricted visiting hours for tourists.',
        },
        'pt-BR': {
          name: 'Vilarejo Bukchon Hanok',
          description:
            'Bairro residencial com centenas de casas tradicionais entre os palácios. Moradores vivem ali, então visite em silêncio.',
          hoursNote: 'Área residencial com horário de visitação restrito para turistas.',
        },
      },
    },
    {
      slug: 'national-museum-of-korea',
      category: C.CULTURE,
      nameKo: '국립중앙박물관',
      address: '137 Seobinggo-ro, Yongsan-gu, Seoul',
      latitude: 37.524,
      longitude: 126.9803,
      priceLevel: 1,
      averageSpendKRW: 0,
      openingHours: everyDay('10:00', '18:00'),
      website: 'https://www.museum.go.kr',
      tags: ['museum', 'history', 'free', 'rainy-day'],
      text: {
        en: {
          name: 'National Museum of Korea',
          description:
            "The country's largest museum, covering over 5,000 years of Korean history, from prehistoric artifacts to national treasures. Free admission.",
          hoursNote: 'Closed on January 1 and on Seollal and Chuseok.',
        },
        'pt-BR': {
          name: 'Museu Nacional da Coreia',
          description:
            'Maior museu do país, com mais de 5 mil anos de história coreana, de peças pré-históricas a tesouros nacionais. Entrada gratuita.',
          hoursNote: 'Fechado em 1º de janeiro e no Seollal e Chuseok.',
        },
      },
    },

    // ----- Nature -----
    {
      slug: 'yeouido-hangang-park',
      category: C.NATURE,
      nameKo: '여의도 한강공원',
      address: 'Yeouido-dong, Yeongdeungpo-gu, Seoul',
      latitude: 37.5284,
      longitude: 126.9327,
      priceLevel: 1,
      averageSpendKRW: 0,
      openingHours: alwaysOpen(),
      tags: ['han-river', 'picnic', 'cherry-blossoms'],
      text: {
        en: {
          name: 'Yeouido Hangang Park',
          description:
            'Han River bank with picnic lawns, bike rentals, cherry blossoms in spring and the fireworks festival in autumn.',
        },
        'pt-BR': {
          name: 'Parque Hangang de Yeouido',
          description:
            'Margem do rio Han com gramados para piquenique, aluguel de bicicletas, cerejeiras na primavera e o festival de fogos no outono.',
        },
      },
    },
    {
      slug: 'seoul-forest',
      category: C.NATURE,
      nameKo: '서울숲',
      address: '273 Ttukseom-ro, Seongdong-gu, Seoul',
      latitude: 37.5444,
      longitude: 127.0374,
      priceLevel: 1,
      averageSpendKRW: 0,
      openingHours: alwaysOpen(),
      tags: ['park', 'family', 'free'],
      text: {
        en: {
          name: 'Seoul Forest',
          description:
            'Large urban park with woods, ponds and a deer enclosure, next to the Seongsu neighborhood.',
        },
        'pt-BR': {
          name: 'Seoul Forest',
          description:
            'Grande parque urbano com bosques, lagos e uma área com cervos, vizinho ao bairro de Seongsu.',
        },
      },
    },
    {
      slug: 'gyeongui-line-forest-park',
      category: C.NATURE,
      nameKo: '경의선숲길',
      district: 'hongdae',
      address: 'Yeonnam-dong, Mapo-gu, Seoul',
      latitude: 37.5603,
      longitude: 126.9256,
      priceLevel: 1,
      averageSpendKRW: 0,
      openingHours: alwaysOpen(),
      tags: ['park', 'walk', 'free'],
      text: {
        en: {
          name: 'Gyeongui Line Forest Park',
          description:
            'Linear park built over a former railway line through Yeonnam-dong, lined with cafés and people picnicking.',
        },
        'pt-BR': {
          name: 'Parque Gyeongui Line Forest',
          description:
            'Parque linear construído sobre uma antiga linha de trem, cortando Yeonnam-dong, cheio de cafés e gente fazendo piquenique.',
        },
      },
    },
  ],
  accommodations: [
    {
      name: 'The Shilla Seoul',
      type: 'HOTEL',
      tier: 'LUXURY',
      pricePerNightKRW: 650_000,
      latitude: 37.556,
      longitude: 127.0057,
    },
    {
      name: 'Signiel Seoul',
      type: 'HOTEL',
      tier: 'LUXURY',
      pricePerNightKRW: 800_000,
      latitude: 37.5126,
      longitude: 127.1026,
    },
    {
      name: 'Rakkojae Seoul',
      type: 'HANOK',
      tier: 'LUXURY',
      district: 'insadong',
      pricePerNightKRW: 450_000,
      latitude: 37.5815,
      longitude: 126.9845,
    },
    {
      name: 'L7 Myeongdong by Lotte',
      type: 'HOTEL',
      tier: 'MID',
      district: 'myeongdong',
      pricePerNightKRW: 190_000,
      latitude: 37.5603,
      longitude: 126.9836,
    },
    {
      name: 'RYSE, Autograph Collection',
      type: 'HOTEL',
      tier: 'MID',
      district: 'hongdae',
      pricePerNightKRW: 250_000,
      latitude: 37.5536,
      longitude: 126.9218,
    },
    {
      name: 'Fraser Place Central Seoul',
      type: 'APARTMENT',
      tier: 'MID',
      pricePerNightKRW: 220_000,
      latitude: 37.5605,
      longitude: 126.9705,
    },
    {
      name: 'Toyoko Inn Seoul Gangnam',
      type: 'HOTEL',
      tier: 'BUDGET',
      district: 'gangnam',
      pricePerNightKRW: 85_000,
      latitude: 37.504,
      longitude: 127.048,
    },
    {
      name: 'ibis budget Ambassador Seoul Dongdaemun',
      type: 'HOTEL',
      tier: 'BUDGET',
      pricePerNightKRW: 75_000,
      latitude: 37.5682,
      longitude: 127.012,
    },
    {
      name: 'Hongdae Guesthouse',
      type: 'GUESTHOUSE',
      tier: 'BUDGET',
      district: 'hongdae',
      pricePerNightKRW: 50_000,
      latitude: 37.5555,
      longitude: 126.9225,
    },
  ],
};
