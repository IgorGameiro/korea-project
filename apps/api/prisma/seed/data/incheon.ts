import { PlaceCategory as C, TrailDifficulty as D } from '../../../src/generated/prisma/enums';
import { alwaysOpen, closedOn, everyDay } from '../helpers';
import type { CitySeed } from '../types';

// Prices, hours and spend are estimates for planning purposes — review before relying on them.

export const incheon: CitySeed = {
  slug: 'incheon',
  nameKo: '인천',
  latitude: 37.4563,
  longitude: 126.7052,
  population: 3_000_000,
  isFeatured: false,
  sortOrder: 4,
  text: {
    en: {
      name: 'Incheon',
      description:
        "Port city and home of the country's main international airport. It has Korea's only official Chinatown, the planned district of Songdo and islands such as Ganghwa and Yeongjong.",
      bestTimeToVisit:
        'Spring and autumn. Ideal for a day or two at the start or end of the trip, right next to the airport.',
    },
    'pt-BR': {
      name: 'Incheon',
      description:
        'Cidade portuária onde fica o principal aeroporto internacional do país. Tem a única Chinatown oficial da Coreia, o bairro planejado de Songdo e ilhas como Ganghwa e Yeongjong.',
      bestTimeToVisit:
        'Primavera e outono. Ótima para um ou dois dias no início ou no fim da viagem, por estar ao lado do aeroporto.',
    },
  },
  districts: [
    {
      slug: 'songdo',
      nameKo: '송도',
      latitude: 37.383,
      longitude: 126.656,
      text: {
        en: {
          name: 'Songdo',
          description:
            "Planned district on reclaimed land, with skyscrapers, a canal and Central Park — one of the country's most modern areas.",
        },
        'pt-BR': {
          name: 'Songdo',
          description:
            'Distrito planejado sobre aterro, com arranha-céus, canal e o Central Park, e uma das áreas mais modernas do país.',
        },
      },
    },
    {
      slug: 'chinatown',
      nameKo: '차이나타운',
      latitude: 37.4755,
      longitude: 126.6175,
      text: {
        en: {
          name: 'Chinatown',
          description:
            'Neighborhood founded by Chinese immigrants in the late 19th century, birthplace of jajangmyeon, next to the fairy-tale village.',
        },
        'pt-BR': {
          name: 'Chinatown',
          description:
            'Bairro formado por imigrantes chineses no fim do século XIX, berço do jajangmyeon, vizinho da vila de contos de fadas.',
        },
      },
    },
    {
      slug: 'wolmido',
      nameKo: '월미도',
      latitude: 37.475,
      longitude: 126.5975,
      text: {
        en: {
          name: 'Wolmido',
          description:
            'Former island now joined to the mainland, with a seaside promenade, amusement park, seafood restaurants and the Wolmi Sea Train.',
        },
        'pt-BR': {
          name: 'Wolmido',
          description:
            'Antiga ilha, hoje ligada ao continente, com calçadão à beira-mar, parque de diversões, restaurantes de frutos do mar e o trem Wolmi Sea Train.',
        },
      },
    },
    {
      slug: 'bupyeong',
      nameKo: '부평',
      latitude: 37.4895,
      longitude: 126.724,
      text: {
        en: {
          name: 'Bupyeong',
          description:
            'Shopping hub with a huge underground mall, a traditional market and a street of bars and restaurants.',
        },
        'pt-BR': {
          name: 'Bupyeong',
          description:
            'Centro comercial com o enorme shopping subterrâneo, o mercado tradicional e uma rua de bares e restaurantes.',
        },
      },
    },
  ],
  costEstimates: {
    BUDGET: {
      lodgingPerRoomPerNightKRW: 55_000,
      foodPerPersonPerDayKRW: 30_000,
      transportPerPersonPerDayKRW: 7_000,
      activitiesPerPersonPerDayKRW: 10_000,
    },
    MID: {
      lodgingPerRoomPerNightKRW: 140_000,
      foodPerPersonPerDayKRW: 55_000,
      transportPerPersonPerDayKRW: 12_000,
      activitiesPerPersonPerDayKRW: 30_000,
    },
    LUXURY: {
      lodgingPerRoomPerNightKRW: 350_000,
      foodPerPersonPerDayKRW: 120_000,
      transportPerPersonPerDayKRW: 40_000,
      activitiesPerPersonPerDayKRW: 80_000,
    },
  },
  places: [
    // ----- Restaurants -----
    {
      slug: 'gonghwachun',
      category: C.RESTAURANT,
      nameKo: '공화춘',
      district: 'chinatown',
      address: '43 Chinatown-ro, Jung-gu, Incheon',
      latitude: 37.4755,
      longitude: 126.6175,
      priceLevel: 2,
      averageSpendKRW: 15_000,
      openingHours: everyDay('10:30', '21:30'),
      tags: ['jajangmyeon', 'korean-chinese', 'history'],
      text: {
        en: {
          name: 'Gonghwachun',
          description:
            'A historic name tied to the origin of jajangmyeon, noodles in black bean sauce. Today’s restaurant stands next to the original building, now a museum.',
        },
        'pt-BR': {
          name: 'Gonghwachun',
          description:
            'Nome histórico ligado à origem do jajangmyeon, o macarrão com molho de feijão preto. O restaurante atual fica ao lado do prédio original, hoje museu.',
        },
      },
    },
    {
      slug: 'sinpo-international-market',
      category: C.RESTAURANT,
      nameKo: '신포국제시장',
      address: '11-5 Uhyeon-ro 49beon-gil, Jung-gu, Incheon',
      latitude: 37.4723,
      longitude: 126.6255,
      priceLevel: 1,
      averageSpendKRW: 15_000,
      openingHours: everyDay('09:00', '21:00'),
      tags: ['market', 'fried-chicken', 'street-food'],
      text: {
        en: {
          name: 'Sinpo International Market',
          description:
            'Traditional market famous for dakgangjeong (sweet and sour fried chicken) and stuffed dumplings.',
        },
        'pt-BR': {
          name: 'Mercado Internacional de Sinpo',
          description:
            'Mercado tradicional famoso pelo dakgangjeong (frango frito agridoce) e pelos bolinhos de massa recheados.',
        },
      },
    },
    {
      slug: 'hwapyeong-dong-naengmyeon-street',
      category: C.RESTAURANT,
      nameKo: '화평동 냉면거리',
      address: 'Hwapyeong-dong, Dong-gu, Incheon',
      latitude: 37.479,
      longitude: 126.636,
      priceLevel: 1,
      averageSpendKRW: 9_000,
      openingHours: everyDay('10:00', '21:00'),
      tags: ['noodles', 'budget', 'local'],
      text: {
        en: {
          name: 'Hwapyeong-dong Naengmyeon Street',
          description:
            'Street known for "washbasin naengmyeon": huge portions of cold noodles served in giant bowls.',
        },
        'pt-BR': {
          name: 'Rua do Naengmyeon de Hwapyeong-dong',
          description:
            'Rua conhecida pelo "naengmyeon de bacia": porções enormes de macarrão gelado servidas em tigelas gigantes.',
        },
      },
    },
    {
      slug: 'wolmido-seafood-restaurants',
      category: C.RESTAURANT,
      nameKo: '월미도 횟집거리',
      district: 'wolmido',
      address: 'Wolmimunhwa-ro, Jung-gu, Incheon',
      latitude: 37.475,
      longitude: 126.5975,
      priceLevel: 3,
      averageSpendKRW: 45_000,
      openingHours: everyDay('11:00', '23:00'),
      tags: ['seafood', 'sea-view', 'sunset'],
      text: {
        en: {
          name: 'Wolmido Seafood Restaurants',
          description:
            'Waterfront strip of sashimi and grilled seafood restaurants, with views of the harbor and the sunset.',
        },
        'pt-BR': {
          name: 'Restaurantes de frutos do mar de Wolmido',
          description:
            'Orla com restaurantes de sashimi e frutos do mar grelhados, com vista para o porto e o pôr do sol.',
        },
      },
    },

    // ----- Nightlife -----
    {
      slug: 'bupyeong-culture-street',
      category: C.NIGHTLIFE,
      nameKo: '부평 문화의거리',
      district: 'bupyeong',
      address: 'Bupyeong-daero, Bupyeong-gu, Incheon',
      latitude: 37.493,
      longitude: 126.7225,
      priceLevel: 2,
      averageSpendKRW: 30_000,
      openingHours: alwaysOpen(),
      tags: ['bars', 'karaoke', 'young-crowd'],
      text: {
        en: {
          name: 'Bupyeong Culture Street',
          description:
            'Pedestrian street near Bupyeong Station with bars, pocha drinking tents, karaoke rooms and a stage for performances.',
        },
        'pt-BR': {
          name: 'Rua da Cultura de Bupyeong',
          description:
            'Rua de pedestres perto da estação Bupyeong, com bares, pochas, karaokês e palco para apresentações.',
        },
      },
    },
    {
      slug: 'wolmido-culture-street',
      category: C.NIGHTLIFE,
      nameKo: '월미문화의거리',
      district: 'wolmido',
      address: 'Wolmimunhwa-ro, Jung-gu, Incheon',
      latitude: 37.474,
      longitude: 126.596,
      priceLevel: 2,
      averageSpendKRW: 30_000,
      openingHours: alwaysOpen(),
      tags: ['waterfront', 'live-music', 'summer'],
      text: {
        en: {
          name: 'Wolmido Culture Street',
          description:
            'Seaside promenade with bars, a lit-up amusement park and live music on summer nights.',
        },
        'pt-BR': {
          name: 'Rua da Cultura de Wolmido',
          description:
            'Calçadão à beira-mar com bares, parque de diversões iluminado e música ao vivo nas noites de verão.',
        },
      },
    },
    {
      slug: 'guwol-dong-rodeo-street',
      category: C.NIGHTLIFE,
      nameKo: '구월동 로데오거리',
      address: 'Guwol-dong, Namdong-gu, Incheon',
      latitude: 37.4475,
      longitude: 126.702,
      priceLevel: 2,
      averageSpendKRW: 35_000,
      openingHours: alwaysOpen(),
      tags: ['clubs', 'bars', 'local'],
      text: {
        en: {
          name: 'Guwol-dong Rodeo Street',
          description:
            "The city's main nightlife hub, near City Hall, with dozens of bars, restaurants and clubs.",
        },
        'pt-BR': {
          name: 'Rua Rodeo de Guwol-dong',
          description:
            'Principal polo noturno da cidade, perto da prefeitura, com dezenas de bares, restaurantes e casas noturnas.',
        },
      },
    },
    {
      slug: 'paradise-city',
      category: C.NIGHTLIFE,
      nameKo: '파라다이스시티',
      address: '186 Yeongjonghaeannam-ro 321beon-gil, Jung-gu, Incheon',
      latitude: 37.4385,
      longitude: 126.4535,
      priceLevel: 4,
      averageSpendKRW: 100_000,
      openingHours: alwaysOpen(),
      tags: ['resort', 'casino', 'luxury'],
      text: {
        en: {
          name: 'Paradise City',
          description:
            'Integrated resort next to the airport, with a casino for foreigners, bars, contemporary art and an indoor theme park.',
          hoursNote: 'The casino is open 24 hours; other venues keep their own hours.',
        },
        'pt-BR': {
          name: 'Paradise City',
          description:
            'Resort integrado ao lado do aeroporto, com cassino para estrangeiros, bares, arte contemporânea e parque indoor.',
          hoursNote: 'Cassino 24 horas; demais espaços com horários próprios.',
        },
      },
    },

    // ----- Hiking -----
    {
      slug: 'gyeyangsan',
      category: C.HIKING,
      nameKo: '계양산',
      address: 'Gyeyang-gu, Incheon',
      latitude: 37.543,
      longitude: 126.719,
      priceLevel: 1,
      averageSpendKRW: 0,
      openingHours: alwaysOpen(),
      tags: ['views', 'fortress', 'local'],
      trail: { difficulty: D.MODERATE, distanceKm: 4, durationMinutes: 120, elevationGainM: 350 },
      text: {
        en: {
          name: 'Gyeyangsan',
          description:
            'The highest mountain in mainland Incheon (395 m), with views of the Han River and, on clear days, Seoul.',
        },
        'pt-BR': {
          name: 'Gyeyangsan',
          description:
            'Montanha mais alta da parte continental de Incheon (395 m), com vista para o rio Han e para Seul em dias claros.',
        },
      },
    },
    {
      slug: 'munhaksan',
      category: C.HIKING,
      nameKo: '문학산',
      address: 'Michuhol-gu, Incheon',
      latitude: 37.44,
      longitude: 126.672,
      priceLevel: 1,
      averageSpendKRW: 0,
      openingHours: everyDay('09:00', '18:00'),
      tags: ['easy', 'history', 'views'],
      trail: { difficulty: D.EASY, distanceKm: 3, durationMinutes: 90, elevationGainM: 200 },
      text: {
        en: {
          name: 'Munhaksan',
          description:
            'Short trail to the ruins of an ancient fortress, overlooking Songdo and the Yellow Sea.',
        },
        'pt-BR': {
          name: 'Munhaksan',
          description:
            'Trilha curta até as ruínas de uma fortaleza antiga, com vista para Songdo e para o mar Amarelo.',
        },
      },
    },
    {
      slug: 'manisan-ganghwa',
      category: C.HIKING,
      nameKo: '마니산',
      address: 'Hwado-myeon, Ganghwa-gun, Incheon',
      latitude: 37.613,
      longitude: 126.432,
      priceLevel: 1,
      averageSpendKRW: 2_000,
      openingHours: everyDay('05:00', '18:00'),
      tags: ['island', 'legend', 'sea-view'],
      trail: { difficulty: D.MODERATE, distanceKm: 4.8, durationMinutes: 180, elevationGainM: 420 },
      text: {
        en: {
          name: 'Manisan (Ganghwa)',
          description:
            'Mountain on Ganghwa Island (472 m) with the Chamseongdan altar, where legend says Dangun made offerings to heaven.',
        },
        'pt-BR': {
          name: 'Manisan (Ganghwa)',
          description:
            'Montanha na ilha de Ganghwa (472 m) com o altar Chamseongdan, onde, segundo a lenda, Dangun fazia oferendas ao céu.',
        },
      },
    },
    {
      slug: 'wolmi-park',
      category: C.HIKING,
      nameKo: '월미공원',
      district: 'wolmido',
      address: '131-22 Wolmi-ro, Jung-gu, Incheon',
      latitude: 37.474,
      longitude: 126.603,
      priceLevel: 1,
      averageSpendKRW: 0,
      openingHours: everyDay('05:00', '23:00'),
      tags: ['easy', 'harbor', 'family'],
      trail: { difficulty: D.EASY, distanceKm: 2.5, durationMinutes: 60, elevationGainM: 100 },
      text: {
        en: {
          name: 'Wolmi Park',
          description:
            'Wooded hill on Wolmido with a traditional Korean garden and an observatory over the harbor.',
        },
        'pt-BR': {
          name: 'Parque Wolmi',
          description:
            'Morro arborizado em Wolmido com jardim tradicional coreano e um observatório sobre o porto.',
        },
      },
    },

    // ----- Attractions -----
    {
      slug: 'incheon-chinatown',
      category: C.ATTRACTION,
      nameKo: '인천 차이나타운',
      district: 'chinatown',
      address: 'Chinatown-ro, Jung-gu, Incheon',
      latitude: 37.4757,
      longitude: 126.6178,
      priceLevel: 1,
      averageSpendKRW: 0,
      openingHours: alwaysOpen(),
      tags: ['history', 'food', 'free'],
      text: {
        en: {
          name: 'Incheon Chinatown',
          description:
            'Paifang gate, red streets, Korean-Chinese restaurants and little shops selling sweets like gonggalppang.',
        },
        'pt-BR': {
          name: 'Chinatown de Incheon',
          description:
            'Portal Paifang, ruas vermelhas, restaurantes chineses-coreanos e lojinhas de doces como o gonggalppang.',
        },
      },
    },
    {
      slug: 'songwol-dong-fairy-tale-village',
      category: C.ATTRACTION,
      nameKo: '송월동 동화마을',
      district: 'chinatown',
      address: 'Songwol-dong, Jung-gu, Incheon',
      latitude: 37.478,
      longitude: 126.619,
      priceLevel: 1,
      averageSpendKRW: 0,
      openingHours: alwaysOpen(),
      tags: ['family', 'photogenic', 'free'],
      text: {
        en: {
          name: 'Songwol-dong Fairy Tale Village',
          description:
            'Streets of houses and walls painted with fairy-tale characters, next to Chinatown.',
        },
        'pt-BR': {
          name: 'Vila dos Contos de Fadas de Songwol-dong',
          description:
            'Ruas com casas e muros pintados com personagens de contos de fadas, ao lado da Chinatown.',
        },
      },
    },
    {
      slug: 'wolmi-sea-train',
      category: C.ATTRACTION,
      nameKo: '월미바다열차',
      district: 'wolmido',
      address: 'Wolmi-ro, Jung-gu, Incheon',
      latitude: 37.4745,
      longitude: 126.6,
      priceLevel: 2,
      averageSpendKRW: 8_000,
      openingHours: closedOn(['mon'], '10:00', '18:00'),
      tags: ['train', 'sea-view', 'family'],
      text: {
        en: {
          name: 'Wolmi Sea Train',
          description:
            'Elevated train that loops around Wolmido in about 35 minutes, with views of the harbor, the sea and Incheon Bridge.',
        },
        'pt-BR': {
          name: 'Wolmi Sea Train',
          description:
            'Trem elevado que contorna Wolmido em cerca de 35 minutos, com vista do porto, do mar e da ponte Incheon.',
        },
      },
    },
    {
      slug: 'g-tower-observatory',
      category: C.ATTRACTION,
      nameKo: 'G타워 전망대',
      district: 'songdo',
      address: '175 Art center-daero, Yeonsu-gu, Incheon',
      latitude: 37.3925,
      longitude: 126.635,
      priceLevel: 1,
      averageSpendKRW: 0,
      openingHours: everyDay('10:00', '21:00'),
      tags: ['views', 'free', 'skyscraper'],
      text: {
        en: {
          name: 'G-Tower Observatory',
          description:
            'Free observation deck on the 33rd floor of a public building in Songdo, overlooking Central Park and Incheon Bridge.',
        },
        'pt-BR': {
          name: 'Observatório da G-Tower',
          description:
            'Mirante gratuito no 33º andar de um prédio público em Songdo, com vista do Central Park e da ponte Incheon.',
        },
      },
    },

    // ----- Cafés -----
    {
      slug: 'joyang-bangjik',
      category: C.CAFE,
      nameKo: '조양방직',
      address: '12 Hyangnamu-gil 5beon-gil, Ganghwa-eup, Ganghwa-gun, Incheon',
      latitude: 37.746,
      longitude: 126.487,
      priceLevel: 2,
      averageSpendKRW: 12_000,
      openingHours: everyDay('11:00', '20:00'),
      tags: ['retro', 'industrial', 'photogenic'],
      text: {
        en: {
          name: 'Joyang Bangjik',
          description:
            'Huge café in a 1930s textile mill on Ganghwa Island, decorated with antiques and period machinery.',
        },
        'pt-BR': {
          name: 'Joyang Bangjik',
          description:
            'Café enorme instalado em uma tecelagem dos anos 1930 em Ganghwa, decorado com antiguidades e máquinas da época.',
        },
      },
    },
    {
      slug: 'gaehang-ro-cafes',
      category: C.CAFE,
      nameKo: '개항로',
      address: 'Gaehang-ro, Jung-gu, Incheon',
      latitude: 37.474,
      longitude: 126.628,
      priceLevel: 2,
      averageSpendKRW: 10_000,
      openingHours: alwaysOpen(),
      tags: ['retro', 'history', 'old-town'],
      text: {
        en: {
          name: 'Gaehang-ro Cafés',
          description:
            'The old port district, where early 20th-century buildings have become retro cafés and bars.',
          hoursNote: 'Each café keeps its own hours.',
        },
        'pt-BR': {
          name: 'Cafés de Gaehang-ro',
          description:
            'Centro antigo do porto, com construções do início do século XX transformadas em cafés e bares retrô.',
          hoursNote: 'Cada café tem horário próprio.',
        },
      },
    },
    {
      slug: 'eurwangni-beach-cafes',
      category: C.CAFE,
      nameKo: '을왕리 카페거리',
      address: 'Eurwang-dong, Jung-gu, Incheon',
      latitude: 37.4475,
      longitude: 126.3725,
      priceLevel: 2,
      averageSpendKRW: 13_000,
      openingHours: alwaysOpen(),
      tags: ['sea-view', 'sunset', 'near-airport'],
      text: {
        en: {
          name: 'Eurwangni Beach Cafés',
          description:
            'Terrace cafés facing Eurwangni Beach on Yeongjong Island, a few minutes from the airport.',
          hoursNote: 'Each café keeps its own hours.',
        },
        'pt-BR': {
          name: 'Cafés da Praia de Eurwangni',
          description:
            'Cafés com terraço de frente para a praia de Eurwangni, em Yeongjongdo, a poucos minutos do aeroporto.',
          hoursNote: 'Cada café tem horário próprio.',
        },
      },
    },
    {
      slug: 'wolmido-seafront-cafes',
      category: C.CAFE,
      nameKo: '월미도 카페',
      district: 'wolmido',
      address: 'Wolmimunhwa-ro, Jung-gu, Incheon',
      latitude: 37.4755,
      longitude: 126.5968,
      priceLevel: 2,
      averageSpendKRW: 12_000,
      openingHours: alwaysOpen(),
      tags: ['sea-view', 'sunset', 'waterfront'],
      text: {
        en: {
          name: 'Wolmido Seafront Cafés',
          description:
            'Cafés in buildings along the Wolmido promenade, with views of the ships and the sunset over the sea.',
          hoursNote: 'Each café keeps its own hours.',
        },
        'pt-BR': {
          name: 'Cafés da orla de Wolmido',
          description:
            'Cafés em prédios à beira do calçadão de Wolmido, com vista para os navios e para o pôr do sol no mar.',
          hoursNote: 'Cada café tem horário próprio.',
        },
      },
    },

    // ----- Shopping -----
    {
      slug: 'bupyeong-underground-shopping-center',
      category: C.SHOPPING,
      nameKo: '부평지하상가',
      district: 'bupyeong',
      address: 'Bupyeong-daero, Bupyeong-gu, Incheon',
      latitude: 37.49,
      longitude: 126.724,
      priceLevel: 1,
      averageSpendKRW: 30_000,
      openingHours: everyDay('10:00', '22:00'),
      tags: ['fashion', 'budget', 'rainy-day'],
      text: {
        en: {
          name: 'Bupyeong Underground Shopping Center',
          description:
            'Recognized by Guinness as the underground mall with the most stores in the world, selling fashion, cosmetics and electronics.',
        },
        'pt-BR': {
          name: 'Shopping Subterrâneo de Bupyeong',
          description:
            'Reconhecido pelo Guinness como o shopping subterrâneo com mais lojas no mundo, com moda, cosméticos e eletrônicos.',
        },
      },
    },
    {
      slug: 'hyundai-premium-outlets-songdo',
      category: C.SHOPPING,
      nameKo: '현대프리미엄아울렛 송도점',
      district: 'songdo',
      address: '123 Songdo International-daero, Yeonsu-gu, Incheon',
      latitude: 37.381,
      longitude: 126.656,
      priceLevel: 3,
      averageSpendKRW: 70_000,
      openingHours: everyDay('10:30', '21:00'),
      tags: ['outlet', 'brands', 'rainy-day'],
      text: {
        en: {
          name: 'Hyundai Premium Outlets Songdo',
          description:
            'Outlet with international and Korean brands, plus restaurants and a cinema.',
        },
        'pt-BR': {
          name: 'Hyundai Premium Outlets Songdo',
          description:
            'Outlet com marcas internacionais e coreanas, além de restaurantes e cinema.',
        },
      },
    },
    {
      slug: 'triple-street',
      category: C.SHOPPING,
      nameKo: '트리플스트리트',
      district: 'songdo',
      address: '180 Songdogwahak-ro, Yeonsu-gu, Incheon',
      latitude: 37.379,
      longitude: 126.662,
      priceLevel: 2,
      averageSpendKRW: 40_000,
      openingHours: everyDay('10:30', '22:00'),
      tags: ['mall', 'open-air', 'restaurants'],
      text: {
        en: {
          name: 'Triple Street',
          description:
            'Open-air mall in Songdo with shops, restaurants and gathering spaces between the buildings.',
        },
        'pt-BR': {
          name: 'Triple Street',
          description:
            'Shopping a céu aberto em Songdo, com lojas, restaurantes e áreas de convivência entre os prédios.',
        },
      },
    },

    // ----- Culture -----
    {
      slug: 'jajangmyeon-museum',
      category: C.CULTURE,
      nameKo: '짜장면박물관',
      district: 'chinatown',
      address: '56-14 Chinatown-ro, Jung-gu, Incheon',
      latitude: 37.4757,
      longitude: 126.6174,
      priceLevel: 1,
      averageSpendKRW: 1_000,
      openingHours: closedOn(['mon'], '09:00', '18:00'),
      tags: ['museum', 'food-history', 'history'],
      text: {
        en: {
          name: 'Jajangmyeon Museum',
          description:
            'Museum in the original Gonghwachun restaurant building, telling the story of the dish and of Chinese immigration.',
        },
        'pt-BR': {
          name: 'Museu do Jajangmyeon',
          description:
            'Museu no prédio original do restaurante Gonghwachun, que conta a história do prato e da imigração chinesa.',
        },
      },
    },
    {
      slug: 'ganghwa-dolmens',
      category: C.CULTURE,
      nameKo: '강화 고인돌',
      address: 'Bugeun-ri, Hajeom-myeon, Ganghwa-gun, Incheon',
      latitude: 37.757,
      longitude: 126.45,
      priceLevel: 1,
      averageSpendKRW: 0,
      openingHours: alwaysOpen(),
      tags: ['unesco', 'prehistory', 'free'],
      text: {
        en: {
          name: 'Ganghwa Dolmens',
          description:
            "Prehistoric megalithic tombs on the UNESCO World Heritage list, including one of Korea's largest dolmens.",
        },
        'pt-BR': {
          name: 'Dólmens de Ganghwa',
          description:
            'Túmulos megalíticos pré-históricos reconhecidos como Patrimônio Mundial da UNESCO, incluindo um dos maiores dólmens da Coreia.',
        },
      },
    },
    {
      slug: 'jeondeungsa-temple',
      category: C.CULTURE,
      nameKo: '전등사',
      address: '37-41 Jeondeungsa-ro, Gilsang-myeon, Ganghwa-gun, Incheon',
      latitude: 37.623,
      longitude: 126.544,
      priceLevel: 1,
      averageSpendKRW: 4_000,
      openingHours: everyDay('08:00', '18:00'),
      tags: ['temple', 'history', 'templestay'],
      text: {
        en: {
          name: 'Jeondeungsa Temple',
          description:
            "One of Korea's oldest Buddhist temples, inside the Samnangseong fortress on Ganghwa Island.",
        },
        'pt-BR': {
          name: 'Templo Jeondeungsa',
          description:
            'Um dos templos budistas mais antigos da Coreia, dentro da fortaleza Samnangseong na ilha de Ganghwa.',
        },
      },
    },

    // ----- Nature -----
    {
      slug: 'songdo-central-park',
      category: C.NATURE,
      nameKo: '송도센트럴파크',
      district: 'songdo',
      address: '160 Convensia-daero, Yeonsu-gu, Incheon',
      latitude: 37.3925,
      longitude: 126.639,
      priceLevel: 1,
      averageSpendKRW: 0,
      openingHours: alwaysOpen(),
      tags: ['park', 'canal', 'family'],
      text: {
        en: {
          name: 'Songdo Central Park',
          description:
            "Park with a seawater canal, boat and kayak rides, and views of Songdo's skyscrapers.",
        },
        'pt-BR': {
          name: 'Songdo Central Park',
          description:
            'Parque com canal de água do mar, passeios de barco e caiaque e vista dos arranha-céus de Songdo.',
        },
      },
    },
    {
      slug: 'eurwangni-beach',
      category: C.NATURE,
      nameKo: '을왕리해수욕장',
      address: 'Eurwang-dong, Jung-gu, Incheon',
      latitude: 37.447,
      longitude: 126.372,
      priceLevel: 1,
      averageSpendKRW: 0,
      openingHours: alwaysOpen(),
      tags: ['beach', 'sunset', 'near-airport'],
      text: {
        en: {
          name: 'Eurwangni Beach',
          description:
            "Yeongjong Island's best-known beach, with pine trees, grilled seafood and sunsets over the Yellow Sea.",
        },
        'pt-BR': {
          name: 'Praia de Eurwangni',
          description:
            'Praia mais conhecida de Yeongjongdo, com pinheiros, frutos do mar grelhados e pôr do sol sobre o mar Amarelo.',
        },
      },
    },
    {
      slug: 'sorae-ecological-park',
      category: C.NATURE,
      nameKo: '소래습지생태공원',
      address: '77 Sorae-ro 154beon-gil, Namdong-gu, Incheon',
      latitude: 37.406,
      longitude: 126.743,
      priceLevel: 1,
      averageSpendKRW: 0,
      openingHours: alwaysOpen(),
      tags: ['birdwatching', 'wetland', 'free'],
      text: {
        en: {
          name: 'Sorae Wetland Ecological Park',
          description:
            'Former salt pans turned into a wetland park with windmills, reeds and birdwatching.',
        },
        'pt-BR': {
          name: 'Parque Ecológico de Sorae',
          description:
            'Antigas salinas transformadas em parque de áreas úmidas, com moinhos de vento, juncos e observação de aves.',
        },
      },
    },
  ],
  accommodations: [
    {
      name: 'Paradise City Hotel',
      type: 'HOTEL',
      tier: 'LUXURY',
      pricePerNightKRW: 400_000,
      latitude: 37.4385,
      longitude: 126.4535,
    },
    {
      name: 'Grand Hyatt Incheon',
      type: 'HOTEL',
      tier: 'LUXURY',
      pricePerNightKRW: 350_000,
      latitude: 37.44,
      longitude: 126.456,
    },
    {
      name: 'Sheraton Grand Incheon',
      type: 'HOTEL',
      tier: 'LUXURY',
      district: 'songdo',
      pricePerNightKRW: 300_000,
      latitude: 37.39,
      longitude: 126.64,
    },
    {
      name: 'Oakwood Premier Incheon',
      type: 'APARTMENT',
      tier: 'MID',
      district: 'songdo',
      pricePerNightKRW: 200_000,
      latitude: 37.392,
      longitude: 126.643,
    },
    {
      name: 'Harbor Park Hotel',
      type: 'HOTEL',
      tier: 'MID',
      district: 'chinatown',
      pricePerNightKRW: 130_000,
      latitude: 37.474,
      longitude: 126.619,
    },
    {
      name: 'Best Western Premier Incheon Airport',
      type: 'HOTEL',
      tier: 'MID',
      pricePerNightKRW: 140_000,
      latitude: 37.4875,
      longitude: 126.4935,
    },
    {
      name: 'Toyoko Inn Incheon Bupyeong',
      type: 'HOTEL',
      tier: 'BUDGET',
      district: 'bupyeong',
      pricePerNightKRW: 70_000,
      latitude: 37.4895,
      longitude: 126.723,
    },
    {
      name: 'Chinatown Guesthouse',
      type: 'GUESTHOUSE',
      tier: 'BUDGET',
      district: 'chinatown',
      pricePerNightKRW: 50_000,
      latitude: 37.4752,
      longitude: 126.6185,
    },
    {
      name: 'Airport Hostel',
      type: 'HOSTEL',
      tier: 'BUDGET',
      pricePerNightKRW: 40_000,
      latitude: 37.4925,
      longitude: 126.4935,
    },
  ],
};
