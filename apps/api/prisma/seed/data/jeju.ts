import { PlaceCategory as C, TrailDifficulty as D } from '../../../src/generated/prisma/enums';
import { alwaysOpen, closedOn, everyDay } from '../helpers';
import type { CitySeed } from '../types';

// Prices, hours and spend are estimates for planning purposes — review before relying on them.

export const jeju: CitySeed = {
  slug: 'jeju',
  nameKo: '제주',
  latitude: 33.4996,
  longitude: 126.5312,
  population: 670_000,
  isFeatured: true,
  sortOrder: 3,
  text: {
    en: {
      name: 'Jeju',
      description:
        'Volcanic island south of the peninsula and a UNESCO World Natural Heritage site, with Mount Hallasan, volcanic cones (oreum), pale-sand beaches, waterfalls and the culture of the haenyeo women divers.',
      bestTimeToVisit:
        'Spring (April–May), with canola flowers and cherry blossoms, and autumn (September–November). Avoid the typhoon season in late summer.',
    },
    'pt-BR': {
      name: 'Jeju',
      description:
        'Ilha vulcânica ao sul da península, Patrimônio Natural da UNESCO. Tem o monte Hallasan, cones vulcânicos (oreum), praias de areia clara, cachoeiras e a cultura das mergulhadoras haenyeo.',
      bestTimeToVisit:
        'Primavera (abril–maio), com canola e cerejeiras, e outono (setembro–novembro). Evite a temporada de tufões no fim do verão.',
    },
  },
  districts: [
    {
      slug: 'jeju-city',
      nameKo: '제주시',
      latitude: 33.4996,
      longitude: 126.5312,
      text: {
        en: {
          name: 'Jeju City',
          description:
            'Urban center on the north of the island, near the airport, with markets, hotels and the Nuwemaru nightlife area.',
        },
        'pt-BR': {
          name: 'Cidade de Jeju',
          description:
            'Centro urbano no norte da ilha, perto do aeroporto, com mercados, hotéis e a vida noturna de Nuwemaru.',
        },
      },
    },
    {
      slug: 'seogwipo',
      nameKo: '서귀포',
      latitude: 33.2541,
      longitude: 126.56,
      text: {
        en: {
          name: 'Seogwipo',
          description:
            'Warmer town on the south coast, with waterfalls that drop into the sea, the Olle market and famous Olle Trail sections.',
        },
        'pt-BR': {
          name: 'Seogwipo',
          description:
            'Cidade na costa sul, mais quente, com cachoeiras que caem no mar, o mercado Olle e trechos famosos da trilha Olle.',
        },
      },
    },
    {
      slug: 'aewol',
      nameKo: '애월',
      latitude: 33.463,
      longitude: 126.331,
      text: {
        en: {
          name: 'Aewol',
          description: 'Northwest coast with a coastal road, sea-view cafés and famous sunsets.',
        },
        'pt-BR': {
          name: 'Aewol',
          description:
            'Litoral noroeste com estrada costeira, cafés com vista para o mar e pores do sol famosos.',
        },
      },
    },
    {
      slug: 'seongsan',
      nameKo: '성산',
      latitude: 33.458,
      longitude: 126.93,
      text: {
        en: {
          name: 'Seongsan',
          description:
            'Eastern tip of the island, home to the Seongsan Ilchulbong crater, Seopjikoji and the ferry port for Udo.',
        },
        'pt-BR': {
          name: 'Seongsan',
          description:
            'Extremo leste da ilha, onde fica a cratera Seongsan Ilchulbong, Seopjikoji e o porto de barcos para Udo.',
        },
      },
    },
    {
      slug: 'jungmun',
      nameKo: '중문',
      latitude: 33.25,
      longitude: 126.412,
      text: {
        en: {
          name: 'Jungmun',
          description:
            'Resort area on the south coast with large hotels, Jungmun Beach and the Jusangjeolli basalt columns.',
        },
        'pt-BR': {
          name: 'Jungmun',
          description:
            'Complexo turístico na costa sul com resorts, a praia Jungmun e as colunas de basalto de Jusangjeolli.',
        },
      },
    },
  ],
  costEstimates: {
    BUDGET: {
      lodgingPerRoomPerNightKRW: 65_000,
      foodPerPersonPerDayKRW: 35_000,
      transportPerPersonPerDayKRW: 25_000,
      activitiesPerPersonPerDayKRW: 15_000,
    },
    MID: {
      lodgingPerRoomPerNightKRW: 170_000,
      foodPerPersonPerDayKRW: 65_000,
      transportPerPersonPerDayKRW: 45_000,
      activitiesPerPersonPerDayKRW: 40_000,
    },
    LUXURY: {
      lodgingPerRoomPerNightKRW: 450_000,
      foodPerPersonPerDayKRW: 140_000,
      transportPerPersonPerDayKRW: 90_000,
      activitiesPerPersonPerDayKRW: 100_000,
    },
  },
  places: [
    // ----- Restaurants -----
    {
      slug: 'dongmun-market',
      category: C.RESTAURANT,
      nameKo: '동문시장',
      district: 'jeju-city',
      address: '20 Gwandeok-ro 14-gil, Jeju-si, Jeju',
      latitude: 33.5122,
      longitude: 126.5281,
      priceLevel: 1,
      averageSpendKRW: 15_000,
      openingHours: everyDay('08:00', '21:00'),
      tags: ['market', 'street-food', 'tangerines'],
      text: {
        en: {
          name: 'Dongmun Market',
          description:
            "The island's oldest and busiest market, with tangerines, hairtail fish, abalone and plenty of street food.",
        },
        'pt-BR': {
          name: 'Mercado Dongmun',
          description:
            'Mercado mais antigo e movimentado da ilha, com tangerinas, peixe-espada, abalone e muita comida de rua.',
        },
      },
    },
    {
      slug: 'black-pork-street',
      category: C.RESTAURANT,
      nameKo: '흑돼지거리',
      district: 'jeju-city',
      address: 'Geonip-dong, Jeju-si, Jeju',
      latitude: 33.5136,
      longitude: 126.53,
      priceLevel: 3,
      averageSpendKRW: 35_000,
      openingHours: everyDay('11:00', '23:00'),
      tags: ['korean-bbq', 'pork', 'local-specialty'],
      text: {
        en: {
          name: 'Black Pork Street',
          description:
            "A street of barbecue restaurants serving heukdwaeji, Jeju's black pork, grilled at the table and dipped in anchovy sauce.",
        },
        'pt-BR': {
          name: 'Rua do Porco Preto',
          description:
            'Rua com várias churrascarias de heukdwaeji, o porco preto de Jeju, grelhado na mesa e mergulhado em molho de anchova.',
        },
      },
    },
    {
      slug: 'seogwipo-olle-market',
      category: C.RESTAURANT,
      nameKo: '서귀포매일올레시장',
      district: 'seogwipo',
      address: '22 Jungang-ro 62beon-gil, Seogwipo-si, Jeju',
      latitude: 33.2496,
      longitude: 126.5636,
      priceLevel: 1,
      averageSpendKRW: 15_000,
      openingHours: everyDay('07:00', '21:00'),
      tags: ['market', 'street-food', 'seafood'],
      text: {
        en: {
          name: 'Seogwipo Olle Market',
          description:
            'Covered market in central Seogwipo with sashimi, tangerines and snacks like its famous garlic fried chicken.',
        },
        'pt-BR': {
          name: 'Mercado Olle de Seogwipo',
          description:
            'Mercado coberto no centro de Seogwipo, com sashimi, tangerinas e petiscos como o famoso frango frito com alho.',
        },
      },
    },
    {
      slug: 'gogi-guksu-street',
      category: C.RESTAURANT,
      nameKo: '국수문화거리',
      district: 'jeju-city',
      address: 'Samseong-ro, Jeju-si, Jeju',
      latitude: 33.5045,
      longitude: 126.5312,
      priceLevel: 1,
      averageSpendKRW: 10_000,
      openingHours: everyDay('08:00', '21:00'),
      tags: ['noodles', 'local-specialty', 'budget'],
      text: {
        en: {
          name: 'Gogi-guksu Street',
          description:
            'A street of restaurants specializing in gogi-guksu, noodles in pork bone broth topped with sliced pork, a classic of the island.',
        },
        'pt-BR': {
          name: 'Rua do Gogi-guksu',
          description:
            'Rua com casas especializadas em gogi-guksu, macarrão em caldo de osso de porco coberto com fatias de carne, prato típico da ilha.',
        },
      },
    },
    {
      slug: 'myeongjin-jeonbok',
      category: C.RESTAURANT,
      nameKo: '명진전복',
      address: 'Pyeongdae-ri, Gujwa-eup, Jeju-si, Jeju',
      latitude: 33.5363,
      longitude: 126.851,
      priceLevel: 2,
      averageSpendKRW: 20_000,
      openingHours: closedOn(['tue'], '09:30', '21:00'),
      tags: ['seafood', 'abalone', 'local-specialty'],
      text: {
        en: {
          name: 'Myeongjin Jeonbok',
          description:
            'Seaside restaurant in Gujwa famous for stone-pot abalone rice and abalone porridge.',
          hoursNote: 'There is often a line at lunchtime.',
        },
        'pt-BR': {
          name: 'Myeongjin Jeonbok',
          description:
            'Restaurante à beira-mar em Gujwa famoso pelo arroz de abalone na panela de pedra e pelo mingau de abalone.',
          hoursNote: 'Costuma ter fila no almoço.',
        },
      },
    },

    // ----- Nightlife -----
    {
      slug: 'nuwemaru-street',
      category: C.NIGHTLIFE,
      nameKo: '누웨마루거리',
      district: 'jeju-city',
      address: 'Yeon-dong, Jeju-si, Jeju',
      latitude: 33.487,
      longitude: 126.49,
      priceLevel: 2,
      averageSpendKRW: 35_000,
      openingHours: alwaysOpen(),
      tags: ['bars', 'karaoke', 'downtown'],
      text: {
        en: {
          name: 'Nuwemaru Street',
          description:
            "Jeju's main nightlife area, in Yeon-dong, with bars, restaurants, karaoke rooms and shops open late.",
        },
        'pt-BR': {
          name: 'Rua Nuwemaru',
          description:
            'Principal área noturna de Jeju, em Yeon-dong, com bares, restaurantes, karaokês e lojas abertas até tarde.',
        },
      },
    },
    {
      slug: 'tapdong-seafront',
      category: C.NIGHTLIFE,
      nameKo: '탑동 해변공연장',
      district: 'jeju-city',
      address: 'Tapdong-ro, Jeju-si, Jeju',
      latitude: 33.517,
      longitude: 126.522,
      priceLevel: 1,
      averageSpendKRW: 20_000,
      openingHours: alwaysOpen(),
      tags: ['waterfront', 'sunset', 'walk'],
      text: {
        en: {
          name: 'Tapdong Seafront',
          description:
            'Seaside promenade in central Jeju with an open-air stage, bars and people strolling at dusk.',
        },
        'pt-BR': {
          name: 'Orla de Tapdong',
          description:
            'Calçadão à beira-mar no centro de Jeju, com palco ao ar livre, bares e pessoas caminhando ao entardecer.',
        },
      },
    },
    {
      slug: 'dongmun-night-market',
      category: C.NIGHTLIFE,
      nameKo: '동문야시장',
      district: 'jeju-city',
      address: 'Dongmun Market, Jeju-si, Jeju',
      latitude: 33.5118,
      longitude: 126.5268,
      priceLevel: 1,
      averageSpendKRW: 20_000,
      openingHours: everyDay('18:00', '24:00'),
      tags: ['night-market', 'street-food', 'beer'],
      text: {
        en: {
          name: 'Dongmun Night Market',
          description:
            'Section of Dongmun Market that fills with stalls at night, selling grilled lobster, black pork and local beer.',
        },
        'pt-BR': {
          name: 'Mercado Noturno de Dongmun',
          description:
            'Área do mercado Dongmun que se enche de barracas à noite, com lagosta grelhada, porco preto e cerveja local.',
        },
      },
    },
    {
      slug: 'lee-jung-seop-street',
      category: C.NIGHTLIFE,
      nameKo: '이중섭거리',
      district: 'seogwipo',
      address: 'Lee Jung-seop-ro, Seogwipo-si, Jeju',
      latitude: 33.247,
      longitude: 126.564,
      priceLevel: 1,
      averageSpendKRW: 25_000,
      openingHours: alwaysOpen(),
      tags: ['art', 'bars', 'quiet'],
      text: {
        en: {
          name: 'Lee Jung-seop Street',
          description:
            'Artists’ street in Seogwipo named after painter Lee Jung-seop, with small bars and a craft market.',
        },
        'pt-BR': {
          name: 'Rua Lee Jung-seop',
          description:
            'Rua de artistas em Seogwipo, batizada em homenagem ao pintor Lee Jung-seop, com bares pequenos e feira de artesanato.',
        },
      },
    },

    // ----- Hiking -----
    {
      slug: 'hallasan-seongpanak-trail',
      category: C.HIKING,
      nameKo: '한라산 성판악 탐방로',
      address: 'Hallasan National Park, Jeju-si, Jeju',
      latitude: 33.385,
      longitude: 126.62,
      priceLevel: 1,
      averageSpendKRW: 0,
      openingHours: everyDay('05:30', '18:00'),
      website: 'https://www.jeju.go.kr/hallasan',
      tags: ['national-park', 'summit', 'challenging'],
      trail: { difficulty: D.HARD, distanceKm: 19.2, durationMinutes: 540, elevationGainM: 1150 },
      text: {
        en: {
          name: 'Hallasan — Seongpanak Trail',
          description:
            "The longest route to the summit of Hallasan (1,950 m), South Korea's highest mountain, with the Baengnokdam crater lake.",
          hoursNote:
            'Online reservation required to reach the summit. There is a cut-off time at the midway shelter.',
        },
        'pt-BR': {
          name: 'Hallasan — Trilha Seongpanak',
          description:
            'Rota mais longa até o cume do Hallasan (1.950 m), a montanha mais alta da Coreia do Sul, com o lago de cratera Baengnokdam.',
          hoursNote:
            'Reserva online obrigatória para subir ao cume. Há horário limite para passar pelo abrigo intermediário.',
        },
      },
    },
    {
      slug: 'hallasan-eorimok-trail',
      category: C.HIKING,
      nameKo: '한라산 어리목 탐방로',
      address: 'Hallasan National Park, Jeju-si, Jeju',
      latitude: 33.3925,
      longitude: 126.495,
      priceLevel: 1,
      averageSpendKRW: 0,
      openingHours: everyDay('05:00', '18:00'),
      website: 'https://www.jeju.go.kr/hallasan',
      tags: ['national-park', 'plateau', 'views'],
      trail: {
        difficulty: D.MODERATE,
        distanceKm: 13.6,
        durationMinutes: 360,
        elevationGainM: 730,
      },
      text: {
        en: {
          name: 'Hallasan — Eorimok Trail',
          description:
            'Shorter route to the Witse-oreum plateau (1,700 m), with open fields and views of the peak. It does not reach the summit.',
          hoursNote: 'Entry hours vary by season.',
        },
        'pt-BR': {
          name: 'Hallasan — Trilha Eorimok',
          description:
            'Rota mais curta até o planalto Witse-oreum (1.700 m), com campos abertos e vista do pico. Não chega ao cume.',
          hoursNote: 'Horário de entrada varia conforme a estação.',
        },
      },
    },
    {
      slug: 'seongsan-ilchulbong',
      category: C.HIKING,
      nameKo: '성산일출봉',
      district: 'seongsan',
      address: '284-12 Ilchul-ro, Seongsan-eup, Seogwipo-si, Jeju',
      latitude: 33.4581,
      longitude: 126.9425,
      priceLevel: 1,
      averageSpendKRW: 5_000,
      openingHours: everyDay('07:00', '20:00'),
      tags: ['unesco', 'sunrise', 'volcano'],
      trail: { difficulty: D.EASY, distanceKm: 1.8, durationMinutes: 60, elevationGainM: 180 },
      text: {
        en: {
          name: 'Seongsan Ilchulbong',
          description:
            '182 m volcanic crater rising straight out of the sea, a UNESCO site. A short, steep climb, famous at sunrise.',
          hoursNote: 'Opens earlier in summer for the sunrise.',
        },
        'pt-BR': {
          name: 'Seongsan Ilchulbong',
          description:
            'Cratera vulcânica de 182 m que sobe direto do mar, Patrimônio da UNESCO. Subida curta e íngreme, famosa ao nascer do sol.',
          hoursNote: 'Abre mais cedo no verão para o nascer do sol.',
        },
      },
    },
    {
      slug: 'jeju-olle-trail-route-7',
      category: C.HIKING,
      nameKo: '제주올레 7코스',
      district: 'seogwipo',
      address: 'Seogwipo-si, Jeju',
      latitude: 33.24,
      longitude: 126.56,
      priceLevel: 1,
      averageSpendKRW: 0,
      openingHours: alwaysOpen(),
      website: 'https://www.jejuolle.org',
      tags: ['coast', 'long-distance', 'villages'],
      trail: {
        difficulty: D.MODERATE,
        distanceKm: 17.6,
        durationMinutes: 330,
        elevationGainM: 150,
      },
      text: {
        en: {
          name: 'Jeju Olle Trail — Route 7',
          description:
            'One of the most beautiful sections of the Olle Trail around the island: cliffs, Oedolgae rock and fishing villages in Seogwipo.',
        },
        'pt-BR': {
          name: 'Trilha Olle — Rota 7',
          description:
            'Um dos trechos mais bonitos da trilha Olle, que contorna a ilha: falésias, a rocha Oedolgae e vilarejos de pescadores em Seogwipo.',
        },
      },
    },
    {
      slug: 'saebyeol-oreum',
      category: C.HIKING,
      nameKo: '새별오름',
      district: 'aewol',
      address: 'Bongseong-ri, Aewol-eup, Jeju-si, Jeju',
      latitude: 33.366,
      longitude: 126.357,
      priceLevel: 1,
      averageSpendKRW: 0,
      openingHours: alwaysOpen(),
      tags: ['oreum', 'autumn', 'sunset'],
      trail: { difficulty: D.EASY, distanceKm: 1.5, durationMinutes: 40, elevationGainM: 120 },
      text: {
        en: {
          name: 'Saebyeol Oreum',
          description:
            'Volcanic cone covered in silver grass in autumn. A short climb with wide views of the west of the island.',
        },
        'pt-BR': {
          name: 'Saebyeol Oreum',
          description:
            'Cone vulcânico coberto de capim-prateado no outono. Subida curta com vista ampla do oeste da ilha.',
        },
      },
    },

    // ----- Attractions -----
    {
      slug: 'udo-island',
      category: C.ATTRACTION,
      nameKo: '우도',
      address: 'Udo-myeon, Jeju-si, Jeju',
      latitude: 33.506,
      longitude: 126.953,
      priceLevel: 2,
      averageSpendKRW: 30_000,
      openingHours: everyDay('08:00', '18:00'),
      tags: ['island', 'beach', 'cycling'],
      text: {
        en: {
          name: 'Udo Island',
          description:
            'A small island 15 minutes by ferry from Seongsan, known for coral-sand beaches, peanut ice cream and electric-bike rides.',
          hoursNote: 'The last ferry time varies with the season and sea conditions.',
        },
        'pt-BR': {
          name: 'Ilha Udo',
          description:
            'Pequena ilha a 15 minutos de barco de Seongsan, conhecida pelas praias de areia de coral, pelo sorvete de amendoim e pelos passeios de bicicleta elétrica.',
          hoursNote: 'Horário da última balsa varia conforme a estação e o mar.',
        },
      },
    },
    {
      slug: 'seopjikoji',
      category: C.ATTRACTION,
      nameKo: '섭지코지',
      district: 'seongsan',
      address: 'Goseong-ri, Seongsan-eup, Seogwipo-si, Jeju',
      latitude: 33.424,
      longitude: 126.931,
      priceLevel: 1,
      averageSpendKRW: 0,
      openingHours: alwaysOpen(),
      tags: ['coast', 'lighthouse', 'canola'],
      text: {
        en: {
          name: 'Seopjikoji',
          description:
            'Headland with cliffs, a lighthouse and canola fields in spring, looking out to Seongsan Ilchulbong.',
        },
        'pt-BR': {
          name: 'Seopjikoji',
          description:
            'Promontório com falésias, farol e campos de canola na primavera, com vista para o Seongsan Ilchulbong.',
        },
      },
    },
    {
      slug: 'jusangjeolli-cliffs',
      category: C.ATTRACTION,
      nameKo: '중문 대포 주상절리대',
      district: 'jungmun',
      address: '36-30 Ieodo-ro, Seogwipo-si, Jeju',
      latitude: 33.238,
      longitude: 126.425,
      priceLevel: 1,
      averageSpendKRW: 2_000,
      openingHours: everyDay('09:00', '18:00'),
      tags: ['volcano', 'coast', 'geology'],
      text: {
        en: {
          name: 'Jusangjeolli Cliffs',
          description:
            'Hexagonal basalt columns formed by cooling lava, pounded by waves on the Jungmun coast.',
        },
        'pt-BR': {
          name: 'Falésias de Jusangjeolli',
          description:
            'Colunas hexagonais de basalto formadas pelo resfriamento da lava, batidas pelas ondas na costa de Jungmun.',
        },
      },
    },
    {
      slug: 'hallim-park',
      category: C.ATTRACTION,
      nameKo: '한림공원',
      address: '300 Hallim-ro, Hallim-eup, Jeju-si, Jeju',
      latitude: 33.3895,
      longitude: 126.239,
      priceLevel: 2,
      averageSpendKRW: 15_000,
      openingHours: everyDay('09:00', '18:00'),
      tags: ['garden', 'cave', 'family'],
      text: {
        en: {
          name: 'Hallim Park',
          description:
            'Botanical park with lava caves, themed gardens and a folk village, near Hyeopjae Beach.',
        },
        'pt-BR': {
          name: 'Hallim Park',
          description:
            'Parque botânico com cavernas de lava, jardins temáticos e uma vila folclórica, perto da praia de Hyeopjae.',
        },
      },
    },
    {
      slug: 'camellia-hill',
      category: C.ATTRACTION,
      nameKo: '카멜리아힐',
      address: '166 Byeongak-ro, Andeok-myeon, Seogwipo-si, Jeju',
      latitude: 33.2895,
      longitude: 126.368,
      priceLevel: 2,
      averageSpendKRW: 10_000,
      openingHours: everyDay('08:30', '18:00'),
      tags: ['garden', 'flowers', 'photogenic'],
      text: {
        en: {
          name: 'Camellia Hill',
          description:
            'Garden with hundreds of camellia varieties blooming from late autumn to spring, and hydrangeas in summer.',
        },
        'pt-BR': {
          name: 'Camellia Hill',
          description:
            'Jardim com centenas de variedades de camélias, que florescem do fim do outono à primavera, e hortênsias no verão.',
        },
      },
    },

    // ----- Cafés -----
    {
      slug: 'osulloc-tea-museum',
      category: C.CAFE,
      nameKo: '오설록 티뮤지엄',
      address: '15 Sinhwayeoksa-ro, Andeok-myeon, Seogwipo-si, Jeju',
      latitude: 33.306,
      longitude: 126.2895,
      priceLevel: 2,
      averageSpendKRW: 12_000,
      openingHours: everyDay('09:00', '18:00'),
      tags: ['green-tea', 'plantation', 'desserts'],
      text: {
        en: {
          name: "O'sulloc Tea Museum",
          description:
            "Tea house and museum among Amorepacific's green tea fields, famous for its matcha ice cream and roll cake.",
        },
        'pt-BR': {
          name: "O'sulloc Tea Museum",
          description:
            'Casa de chá e museu no meio das plantações de chá verde da Amorepacific, famosa pelo sorvete e pelo rolo de matcha.',
        },
      },
    },
    {
      slug: 'aewol-cafe-street',
      category: C.CAFE,
      nameKo: '애월 카페거리',
      district: 'aewol',
      address: 'Aewol-eup, Jeju-si, Jeju',
      latitude: 33.463,
      longitude: 126.311,
      priceLevel: 2,
      averageSpendKRW: 13_000,
      openingHours: alwaysOpen(),
      tags: ['sea-view', 'sunset', 'photogenic'],
      text: {
        en: {
          name: 'Aewol Café Street',
          description:
            'Stretch of the Aewol coast lined with sea-facing cafés, a classic spot for sunset.',
          hoursNote: 'Each café keeps its own hours, usually 10:00–21:00.',
        },
        'pt-BR': {
          name: 'Rua dos Cafés de Aewol',
          description:
            'Trecho do litoral de Aewol com cafés de frente para o mar, ponto clássico para ver o pôr do sol.',
          hoursNote: 'Cada café tem horário próprio, geralmente 10:00–21:00.',
        },
      },
    },
    {
      slug: 'woljeong-ri-cafes',
      category: C.CAFE,
      nameKo: '월정리 카페거리',
      address: 'Woljeong-ri, Gujwa-eup, Jeju-si, Jeju',
      latitude: 33.556,
      longitude: 126.796,
      priceLevel: 2,
      averageSpendKRW: 13_000,
      openingHours: alwaysOpen(),
      tags: ['beach', 'sea-view', 'photogenic'],
      text: {
        en: {
          name: 'Woljeong-ri Cafés',
          description:
            'Turquoise-water beach in the northeast of the island, surrounded by terrace cafés with chairs facing the sea.',
          hoursNote: 'Each café keeps its own hours.',
        },
        'pt-BR': {
          name: 'Cafés de Woljeong-ri',
          description:
            'Praia de água turquesa no nordeste da ilha, cercada de cafés com terraço e cadeiras viradas para o mar.',
          hoursNote: 'Cada café tem horário próprio.',
        },
      },
    },
    {
      slug: 'hamdeok-beach-cafes',
      category: C.CAFE,
      nameKo: '함덕해수욕장 카페',
      address: 'Hamdeok-ri, Jocheon-eup, Jeju-si, Jeju',
      latitude: 33.543,
      longitude: 126.669,
      priceLevel: 2,
      averageSpendKRW: 13_000,
      openingHours: alwaysOpen(),
      tags: ['beach', 'sea-view', 'family'],
      text: {
        en: {
          name: 'Hamdeok Beach Cafés',
          description:
            'Beach near the airport with Seoubong oreum next to it and cafés facing the pale sand.',
          hoursNote: 'Each café keeps its own hours.',
        },
        'pt-BR': {
          name: 'Cafés da Praia de Hamdeok',
          description:
            'Praia perto do aeroporto com o oreum Seoubong ao lado e cafés de frente para a areia clara.',
          hoursNote: 'Cada café tem horário próprio.',
        },
      },
    },

    // ----- Shopping -----
    {
      slug: 'chilseong-ro-shopping-street',
      category: C.SHOPPING,
      nameKo: '칠성로 쇼핑거리',
      district: 'jeju-city',
      address: 'Chilseong-ro, Jeju-si, Jeju',
      latitude: 33.5135,
      longitude: 126.525,
      priceLevel: 2,
      averageSpendKRW: 40_000,
      openingHours: everyDay('10:00', '22:00'),
      tags: ['fashion', 'downtown', 'rainy-day'],
      text: {
        en: {
          name: 'Chilseong-ro Shopping Street',
          description:
            "Covered shopping street in Jeju's old downtown, with clothing, shoe and cosmetics stores.",
        },
        'pt-BR': {
          name: 'Rua Chilseong-ro',
          description:
            'Rua comercial coberta no centro antigo de Jeju, com lojas de roupas, calçados e cosméticos.',
        },
      },
    },
    {
      slug: 'jungang-ro-underground-shopping-center',
      category: C.SHOPPING,
      nameKo: '중앙로 지하상가',
      district: 'jeju-city',
      address: 'Jungang-ro, Jeju-si, Jeju',
      latitude: 33.511,
      longitude: 126.526,
      priceLevel: 1,
      averageSpendKRW: 25_000,
      openingHours: everyDay('10:00', '21:00'),
      tags: ['fashion', 'budget', 'rainy-day'],
      text: {
        en: {
          name: 'Jungang-ro Underground Shopping Center',
          description:
            'Underground arcade in central Jeju, connected to Dongmun Market, with clothing and accessory stores.',
        },
        'pt-BR': {
          name: 'Shopping Subterrâneo Jungang-ro',
          description:
            'Galeria subterrânea no centro de Jeju, ligada ao mercado Dongmun, com lojas de roupas e acessórios.',
        },
      },
    },
    {
      slug: 'jeju-five-day-market',
      category: C.SHOPPING,
      nameKo: '제주민속오일시장',
      district: 'jeju-city',
      address: '26 Oiljangseo-gil, Jeju-si, Jeju',
      latitude: 33.493,
      longitude: 126.473,
      priceLevel: 1,
      averageSpendKRW: 20_000,
      openingHours: everyDay('08:00', '18:00'),
      tags: ['market', 'local', 'traditional'],
      text: {
        en: {
          name: 'Jeju Five-Day Market',
          description:
            'Traditional market held on dates ending in 2 and 7, with local produce, clothes, plants and food.',
          hoursNote: 'Only on the 2nd, 7th, 12th, 17th, 22nd and 27th of each month.',
        },
        'pt-BR': {
          name: 'Mercado de Cinco Dias de Jeju',
          description:
            'Feira tradicional que acontece nos dias terminados em 2 e 7, com produtos locais, roupas, plantas e comida.',
          hoursNote: 'Funciona apenas nos dias 2, 7, 12, 17, 22 e 27 de cada mês.',
        },
      },
    },

    // ----- Culture -----
    {
      slug: 'haenyeo-museum',
      category: C.CULTURE,
      nameKo: '해녀박물관',
      address: '26 Haenyeobangmulgwan-gil, Gujwa-eup, Jeju-si, Jeju',
      latitude: 33.5225,
      longitude: 126.8615,
      priceLevel: 1,
      averageSpendKRW: 1_100,
      openingHours: closedOn(['mon'], '09:00', '18:00'),
      tags: ['museum', 'haenyeo', 'unesco'],
      text: {
        en: {
          name: 'Haenyeo Museum',
          description:
            'Museum about the haenyeo, women divers who harvest seafood without breathing equipment, a practice recognized by UNESCO.',
        },
        'pt-BR': {
          name: 'Museu das Haenyeo',
          description:
            'Museu sobre as haenyeo, mergulhadoras que coletam frutos do mar sem equipamento de respiração, prática reconhecida pela UNESCO.',
        },
      },
    },
    {
      slug: 'seongeup-folk-village',
      category: C.CULTURE,
      nameKo: '성읍민속마을',
      address: 'Seongeup-ri, Pyoseon-myeon, Seogwipo-si, Jeju',
      latitude: 33.387,
      longitude: 126.801,
      priceLevel: 1,
      averageSpendKRW: 0,
      openingHours: everyDay('09:00', '18:00'),
      tags: ['traditional-village', 'history', 'free'],
      text: {
        en: {
          name: 'Seongeup Folk Village',
          description:
            "A living village of volcanic-stone, thatched-roof houses that preserves Jeju's traditional architecture.",
        },
        'pt-BR': {
          name: 'Vila Folclórica de Seongeup',
          description:
            'Vila habitada com casas de pedra vulcânica e telhado de palha, que preserva a arquitetura tradicional de Jeju.',
        },
      },
    },
    {
      slug: 'jeju-stone-park',
      category: C.CULTURE,
      nameKo: '제주돌문화공원',
      address: '2023 Namjo-ro, Jocheon-eup, Jeju-si, Jeju',
      latitude: 33.45,
      longitude: 126.66,
      priceLevel: 1,
      averageSpendKRW: 5_000,
      openingHours: closedOn(['mon'], '09:00', '18:00'),
      tags: ['museum', 'volcano', 'dol-hareubang'],
      text: {
        en: {
          name: 'Jeju Stone Park',
          description:
            "Large park about the role of volcanic stone in Jeju's culture, with dol hareubang statues and a museum.",
        },
        'pt-BR': {
          name: 'Parque Cultural das Pedras de Jeju',
          description:
            'Grande parque sobre o papel da pedra vulcânica na cultura de Jeju, com estátuas dol hareubang e um museu.',
        },
      },
    },

    // ----- Nature -----
    {
      slug: 'cheonjiyeon-waterfall',
      category: C.NATURE,
      nameKo: '천지연폭포',
      district: 'seogwipo',
      address: '2-15 Namseongjungang-ro, Seogwipo-si, Jeju',
      latitude: 33.247,
      longitude: 126.5545,
      priceLevel: 1,
      averageSpendKRW: 2_000,
      openingHours: everyDay('09:00', '22:00'),
      tags: ['waterfall', 'easy', 'night'],
      text: {
        en: {
          name: 'Cheonjiyeon Waterfall',
          description:
            '22 m waterfall in a subtropical valley in Seogwipo, with a flat path and lighting at night.',
        },
        'pt-BR': {
          name: 'Cachoeira Cheonjiyeon',
          description:
            'Cachoeira de 22 m em um vale subtropical de Seogwipo, com caminho plano e iluminação à noite.',
        },
      },
    },
    {
      slug: 'hyeopjae-beach',
      category: C.NATURE,
      nameKo: '협재해수욕장',
      address: 'Hyeopjae-ri, Hallim-eup, Jeju-si, Jeju',
      latitude: 33.394,
      longitude: 126.239,
      priceLevel: 1,
      averageSpendKRW: 0,
      openingHours: alwaysOpen(),
      tags: ['beach', 'family', 'free'],
      text: {
        en: {
          name: 'Hyeopjae Beach',
          description:
            'White-sand beach with turquoise water facing Biyangdo islet, great for families.',
          hoursNote: 'Swimming is officially allowed in summer.',
        },
        'pt-BR': {
          name: 'Praia de Hyeopjae',
          description:
            'Praia de areia branca e água azul-turquesa com vista para a ilhota Biyangdo, ótima para famílias.',
          hoursNote: 'Banho de mar liberado oficialmente no verão.',
        },
      },
    },
    {
      slug: 'bijarim-forest',
      category: C.NATURE,
      nameKo: '비자림',
      address: '55 Bijasup-gil, Gujwa-eup, Jeju-si, Jeju',
      latitude: 33.489,
      longitude: 126.809,
      priceLevel: 1,
      averageSpendKRW: 3_000,
      openingHours: everyDay('09:00', '18:00'),
      tags: ['forest', 'easy', 'quiet'],
      text: {
        en: {
          name: 'Bijarim Forest',
          description:
            'Forest of thousands of nutmeg yew trees, some over 500 years old, with flat trails on volcanic soil.',
        },
        'pt-BR': {
          name: 'Floresta Bijarim',
          description:
            'Floresta com milhares de árvores de torreya, algumas com mais de 500 anos, e trilhas planas de terra vulcânica.',
        },
      },
    },
  ],
  accommodations: [
    {
      name: 'Grand Hyatt Jeju',
      type: 'HOTEL',
      tier: 'LUXURY',
      district: 'jeju-city',
      pricePerNightKRW: 400_000,
      latitude: 33.4855,
      longitude: 126.488,
    },
    {
      name: 'The Shilla Jeju',
      type: 'HOTEL',
      tier: 'LUXURY',
      district: 'jungmun',
      pricePerNightKRW: 550_000,
      latitude: 33.2475,
      longitude: 126.4085,
    },
    {
      name: 'Lotte Hotel Jeju',
      type: 'HOTEL',
      tier: 'LUXURY',
      district: 'jungmun',
      pricePerNightKRW: 450_000,
      latitude: 33.248,
      longitude: 126.41,
    },
    {
      name: 'Shilla Stay Jeju',
      type: 'HOTEL',
      tier: 'MID',
      district: 'jeju-city',
      pricePerNightKRW: 150_000,
      latitude: 33.4865,
      longitude: 126.489,
    },
    {
      name: 'Lotte City Hotel Jeju',
      type: 'HOTEL',
      tier: 'MID',
      district: 'jeju-city',
      pricePerNightKRW: 160_000,
      latitude: 33.4885,
      longitude: 126.49,
    },
    {
      name: 'Ramada Plaza Jeju',
      type: 'HOTEL',
      tier: 'MID',
      district: 'jeju-city',
      pricePerNightKRW: 140_000,
      latitude: 33.517,
      longitude: 126.518,
    },
    {
      name: 'Jeju City Hostel',
      type: 'HOSTEL',
      tier: 'BUDGET',
      district: 'jeju-city',
      pricePerNightKRW: 35_000,
      latitude: 33.5125,
      longitude: 126.527,
    },
    {
      name: 'Aewol Guesthouse',
      type: 'GUESTHOUSE',
      tier: 'BUDGET',
      district: 'aewol',
      pricePerNightKRW: 60_000,
      latitude: 33.4625,
      longitude: 126.315,
    },
    {
      name: 'Seogwipo Guesthouse',
      type: 'GUESTHOUSE',
      tier: 'BUDGET',
      district: 'seogwipo',
      pricePerNightKRW: 55_000,
      latitude: 33.2505,
      longitude: 126.562,
    },
  ],
};
