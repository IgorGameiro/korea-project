import { PlaceCategory as C, TrailDifficulty as D } from '../../../src/generated/prisma/enums';
import { alwaysOpen, closedOn, everyDay } from '../helpers';
import type { CitySeed } from '../types';

// Prices, hours and spend are estimates for planning purposes — review before relying on them.

export const busan: CitySeed = {
  slug: 'busan',
  nameKo: '부산',
  latitude: 35.1796,
  longitude: 129.0756,
  population: 3_300_000,
  isFeatured: true,
  sortOrder: 2,
  text: {
    en: {
      name: 'Busan',
      description:
        "Korea's second-largest city and main port, Busan combines city beaches, seaside temples, mountains and some of the country's best seafood.",
      bestTimeToVisit:
        'Summer (June–August) for the beaches; spring and autumn for sightseeing and hiking in pleasant weather.',
    },
    'pt-BR': {
      name: 'Busan',
      description:
        'Segunda maior cidade do país e principal porto, Busan combina praias urbanas, templos à beira-mar, montanhas e alguns dos melhores frutos do mar da Coreia.',
      bestTimeToVisit:
        'Verão (junho–agosto) para as praias; primavera e outono para passeios e trilhas com clima agradável.',
    },
  },
  districts: [
    {
      slug: 'haeundae',
      nameKo: '해운대',
      latitude: 35.1631,
      longitude: 129.1635,
      text: {
        en: {
          name: 'Haeundae',
          description:
            "Korea's most famous beach, surrounded by skyscrapers, luxury hotels, a traditional market and the Dalmaji-gil road.",
        },
        'pt-BR': {
          name: 'Haeundae',
          description:
            'Praia mais famosa da Coreia, cercada por arranha-céus, hotéis de luxo, mercado tradicional e o Dalmaji-gil.',
        },
      },
    },
    {
      slug: 'seomyeon',
      nameKo: '서면',
      latitude: 35.1578,
      longitude: 129.06,
      text: {
        en: {
          name: 'Seomyeon',
          description:
            "The city's shopping and entertainment center, with underground malls, nightlife and the famous pork soup alley.",
        },
        'pt-BR': {
          name: 'Seomyeon',
          description:
            'Centro comercial e de entretenimento da cidade, com shoppings subterrâneos, vida noturna e o famoso beco do dwaeji gukbap.',
        },
      },
    },
    {
      slug: 'gamcheon',
      nameKo: '감천',
      latitude: 35.0975,
      longitude: 129.0106,
      text: {
        en: {
          name: 'Gamcheon',
          description:
            'Hillside of colorful terraced houses, a former refugee settlement turned into an art village.',
        },
        'pt-BR': {
          name: 'Gamcheon',
          description:
            'Encosta com casas coloridas em escadaria, antigo bairro de refugiados transformado em vilarejo de arte.',
        },
      },
    },
    {
      slug: 'gwangalli',
      nameKo: '광안리',
      latitude: 35.1532,
      longitude: 129.1186,
      text: {
        en: {
          name: 'Gwangalli',
          description:
            'Beach facing the Gwangan Bridge, lit up at night, with a waterfront full of bars, cafés and seafood restaurants.',
        },
        'pt-BR': {
          name: 'Gwangalli',
          description:
            'Praia com vista para a ponte Gwangan, iluminada à noite, e orla cheia de bares, cafés e restaurantes de frutos do mar.',
        },
      },
    },
    {
      slug: 'nampo',
      nameKo: '남포동',
      latitude: 35.098,
      longitude: 129.03,
      text: {
        en: {
          name: 'Nampo-dong',
          description:
            'Old downtown by the port, home to Jagalchi Market, Gukje Market, BIFF Square and Busan Tower.',
        },
        'pt-BR': {
          name: 'Nampo-dong',
          description:
            'Centro antigo próximo ao porto, com o mercado Jagalchi, o mercado Gukje, a BIFF Square e a Torre de Busan.',
        },
      },
    },
  ],
  costEstimates: {
    BUDGET: {
      lodgingPerRoomPerNightKRW: 60_000,
      foodPerPersonPerDayKRW: 30_000,
      transportPerPersonPerDayKRW: 7_000,
      activitiesPerPersonPerDayKRW: 12_000,
    },
    MID: {
      lodgingPerRoomPerNightKRW: 160_000,
      foodPerPersonPerDayKRW: 60_000,
      transportPerPersonPerDayKRW: 15_000,
      activitiesPerPersonPerDayKRW: 35_000,
    },
    LUXURY: {
      lodgingPerRoomPerNightKRW: 400_000,
      foodPerPersonPerDayKRW: 130_000,
      transportPerPersonPerDayKRW: 45_000,
      activitiesPerPersonPerDayKRW: 90_000,
    },
  },
  places: [
    // ----- Restaurants -----
    {
      slug: 'jagalchi-fish-market',
      category: C.RESTAURANT,
      nameKo: '자갈치시장',
      district: 'nampo',
      address: '52 Jagalchihaean-ro, Jung-gu, Busan',
      latitude: 35.0966,
      longitude: 129.0306,
      priceLevel: 3,
      averageSpendKRW: 45_000,
      openingHours: everyDay('05:00', '22:00'),
      tags: ['seafood', 'market', 'classic'],
      text: {
        en: {
          name: 'Jagalchi Fish Market',
          description:
            "Korea's largest fish market. Choose your seafood on the ground floor and eat it upstairs, overlooking the harbor.",
          hoursNote: 'Usually closed on the 1st and 3rd Tuesday of the month.',
        },
        'pt-BR': {
          name: 'Mercado de Peixes Jagalchi',
          description:
            'Maior mercado de peixes da Coreia. Escolha os frutos do mar no térreo e coma no andar de cima, com vista para o porto.',
          hoursNote: 'Costuma fechar na 1ª e na 3ª terça-feira do mês.',
        },
      },
    },
    {
      slug: 'seomyeon-pork-soup-alley',
      category: C.RESTAURANT,
      nameKo: '서면 돼지국밥골목',
      district: 'seomyeon',
      address: 'Bujeon-dong, Busanjin-gu, Busan',
      latitude: 35.1567,
      longitude: 129.0597,
      priceLevel: 1,
      averageSpendKRW: 11_000,
      openingHours: alwaysOpen(),
      tags: ['soup', 'local', 'budget'],
      text: {
        en: {
          name: 'Seomyeon Pork Soup Alley',
          description:
            "A street of restaurants specializing in dwaeji gukbap, Busan's signature pork and rice soup, served with chives and kimchi.",
          hoursNote: 'Several restaurants are open 24 hours.',
        },
        'pt-BR': {
          name: 'Beco do Dwaeji Gukbap de Seomyeon',
          description:
            'Rua com várias casas especializadas na sopa de porco com arroz, prato símbolo de Busan, servida com cebolinha e kimchi.',
          hoursNote: 'Várias casas funcionam 24 horas.',
        },
      },
    },
    {
      slug: 'choryang-milmyeon',
      category: C.RESTAURANT,
      nameKo: '초량밀면',
      address: 'Choryang-dong, Dong-gu, Busan',
      latitude: 35.117,
      longitude: 129.039,
      priceLevel: 1,
      averageSpendKRW: 10_000,
      openingHours: everyDay('10:00', '22:00'),
      tags: ['noodles', 'local', 'summer'],
      text: {
        en: {
          name: 'Choryang Milmyeon',
          description:
            'Known for milmyeon, the cold wheat noodles created in Busan during the Korean War, near the train station.',
        },
        'pt-BR': {
          name: 'Choryang Milmyeon',
          description:
            'Casa famosa pelo milmyeon, o macarrão gelado de trigo criado em Busan durante a Guerra da Coreia, perto da estação de trem.',
        },
      },
    },
    {
      slug: 'haeundae-amso-galbi',
      category: C.RESTAURANT,
      nameKo: '해운대암소갈비집',
      district: 'haeundae',
      address: 'Jung-dong, Haeundae-gu, Busan',
      latitude: 35.163,
      longitude: 129.1638,
      priceLevel: 4,
      averageSpendKRW: 70_000,
      openingHours: everyDay('11:30', '22:00'),
      tags: ['korean-bbq', 'classic', 'beef'],
      text: {
        en: {
          name: 'Haeundae Amso Galbi',
          description:
            'Open since 1964, a benchmark for marinated beef galbi grilled at the table. Finish with noodles cooked in the grill juices.',
        },
        'pt-BR': {
          name: 'Haeundae Amso Galbi',
          description:
            'Churrascaria aberta em 1964, referência em galbi de vaca marinado, grelhado na mesa. O macarrão no caldo da grelha fecha a refeição.',
        },
      },
    },
    {
      slug: 'biff-square-street-food',
      category: C.RESTAURANT,
      nameKo: 'BIFF광장 먹자골목',
      district: 'nampo',
      address: 'BIFF Square, Jung-gu, Busan',
      latitude: 35.0985,
      longitude: 129.0283,
      priceLevel: 1,
      averageSpendKRW: 8_000,
      openingHours: everyDay('10:00', '22:00'),
      tags: ['street-food', 'budget', 'cinema'],
      text: {
        en: {
          name: 'BIFF Square Street Food',
          description:
            'Square of the Busan film festival, where stalls sell ssiat hotteok (seed-filled pancakes) and eomuk fish cakes.',
        },
        'pt-BR': {
          name: 'Comida de rua da BIFF Square',
          description:
            'Praça do festival de cinema de Busan, onde as barracas vendem o ssiat hotteok (panqueca recheada com sementes) e eomuk.',
        },
      },
    },

    // ----- Nightlife -----
    {
      slug: 'gwangalli-beachfront',
      category: C.NIGHTLIFE,
      nameKo: '광안리 해변',
      district: 'gwangalli',
      address: 'Gwanganhaebyeon-ro, Suyeong-gu, Busan',
      latitude: 35.1532,
      longitude: 129.1186,
      priceLevel: 2,
      averageSpendKRW: 40_000,
      openingHours: alwaysOpen(),
      tags: ['bars', 'beach', 'night-views'],
      text: {
        en: {
          name: 'Gwangalli Beachfront',
          description:
            'Bars, pubs and restaurants facing the illuminated Gwangan Bridge. Drone light shows fly over the beach on Saturdays.',
        },
        'pt-BR': {
          name: 'Orla de Gwangalli',
          description:
            'Bares, pubs e restaurantes de frente para a ponte Gwangan iluminada. Aos sábados há shows de drones sobre a praia.',
        },
      },
    },
    {
      slug: 'the-bay-101',
      category: C.NIGHTLIFE,
      nameKo: '더베이101',
      district: 'haeundae',
      address: '52 Dongbaek-ro, Haeundae-gu, Busan',
      latitude: 35.1567,
      longitude: 129.1522,
      priceLevel: 3,
      averageSpendKRW: 50_000,
      openingHours: everyDay('09:00', '02:00'),
      tags: ['bars', 'night-views', 'marina'],
      text: {
        en: {
          name: 'The Bay 101',
          description:
            "Marina complex in Haeundae with bars and restaurants, and the most photographed view of Marine City's skyscrapers.",
        },
        'pt-BR': {
          name: 'The Bay 101',
          description:
            'Complexo à beira da marina de Haeundae com bares e restaurantes e a vista mais fotografada dos arranha-céus de Marine City.',
        },
      },
    },
    {
      slug: 'seomyeon-nightlife-district',
      category: C.NIGHTLIFE,
      nameKo: '서면 1번가',
      district: 'seomyeon',
      address: 'Bujeon-dong, Busanjin-gu, Busan',
      latitude: 35.1578,
      longitude: 129.0594,
      priceLevel: 2,
      averageSpendKRW: 35_000,
      openingHours: alwaysOpen(),
      tags: ['clubs', 'karaoke', 'young-crowd'],
      text: {
        en: {
          name: 'Seomyeon Nightlife District',
          description:
            "Streets full of bars, pocha drinking tents, karaoke rooms and clubs — the city's main hangout for young people.",
        },
        'pt-BR': {
          name: 'Centro noturno de Seomyeon',
          description:
            'Ruas cheias de bares, pochas (barracas de bebida), karaokês e clubes. É o principal ponto de encontro jovem da cidade.',
        },
      },
    },
    {
      slug: 'haeundae-gunam-ro',
      category: C.NIGHTLIFE,
      nameKo: '해운대 구남로',
      district: 'haeundae',
      address: 'Gunam-ro, Haeundae-gu, Busan',
      latitude: 35.1617,
      longitude: 129.1597,
      priceLevel: 2,
      averageSpendKRW: 35_000,
      openingHours: alwaysOpen(),
      tags: ['bars', 'beach', 'live-music'],
      text: {
        en: {
          name: 'Haeundae Gunam-ro',
          description:
            'Pedestrian avenue between Haeundae Station and the beach, with bars, restaurants and street performances in summer.',
        },
        'pt-BR': {
          name: 'Gunam-ro de Haeundae',
          description:
            'Avenida de pedestres entre a estação Haeundae e a praia, com bares, restaurantes e apresentações de rua no verão.',
        },
      },
    },

    // ----- Hiking -----
    {
      slug: 'jangsan',
      category: C.HIKING,
      nameKo: '장산',
      district: 'haeundae',
      address: 'Haeundae-gu, Busan',
      latitude: 35.1902,
      longitude: 129.1659,
      priceLevel: 1,
      averageSpendKRW: 0,
      openingHours: alwaysOpen(),
      tags: ['views', 'sea', 'challenging'],
      trail: { difficulty: D.MODERATE, distanceKm: 7, durationMinutes: 210, elevationGainM: 550 },
      text: {
        en: {
          name: 'Jangsan',
          description:
            'Mountain behind Haeundae (634 m) with views of the beach, Marine City and, on clear days, across the sea to Japan.',
        },
        'pt-BR': {
          name: 'Jangsan',
          description:
            'Montanha atrás de Haeundae (634 m) com vista da praia, de Marine City e, em dias claros, do mar até o Japão.',
        },
      },
    },
    {
      slug: 'geumjeongsan-fortress',
      category: C.HIKING,
      nameKo: '금정산성',
      address: 'Geumjeong-gu, Busan',
      latitude: 35.2795,
      longitude: 129.0577,
      priceLevel: 1,
      averageSpendKRW: 0,
      openingHours: alwaysOpen(),
      tags: ['fortress', 'history', 'views'],
      trail: { difficulty: D.MODERATE, distanceKm: 8, durationMinutes: 240, elevationGainM: 600 },
      text: {
        en: {
          name: 'Geumjeongsan and Geumjeong Fortress',
          description:
            "Trail along Korea's largest mountain fortress, with old gates and access to Beomeosa Temple.",
        },
        'pt-BR': {
          name: 'Geumjeongsan e Fortaleza Geumjeong',
          description:
            'Trilha ao longo da maior fortaleza de montanha da Coreia, com portões antigos e acesso ao templo Beomeosa.',
        },
      },
    },
    {
      slug: 'igidae-coastal-walk',
      category: C.HIKING,
      nameKo: '이기대 해안산책로',
      address: 'Yongho-dong, Nam-gu, Busan',
      latitude: 35.1225,
      longitude: 129.1214,
      priceLevel: 1,
      averageSpendKRW: 0,
      openingHours: alwaysOpen(),
      tags: ['coast', 'easy', 'views'],
      trail: { difficulty: D.EASY, distanceKm: 4.7, durationMinutes: 120, elevationGainM: 100 },
      text: {
        en: {
          name: 'Igidae Coastal Walk',
          description:
            'Path along seaside cliffs and suspension bridges, with views of Gwangan Bridge and the Oryukdo islets.',
        },
        'pt-BR': {
          name: 'Caminho Costeiro de Igidae',
          description:
            'Caminho por falésias e pontes suspensas à beira-mar, com vista para a ponte Gwangan e para as ilhas Oryukdo.',
        },
      },
    },
    {
      slug: 'hwangnyeongsan',
      category: C.HIKING,
      nameKo: '황령산',
      address: 'Nam-gu, Busan',
      latitude: 35.1567,
      longitude: 129.0821,
      priceLevel: 1,
      averageSpendKRW: 0,
      openingHours: alwaysOpen(),
      tags: ['night-views', 'sunset', 'views'],
      trail: { difficulty: D.EASY, distanceKm: 5, durationMinutes: 150, elevationGainM: 350 },
      text: {
        en: {
          name: 'Hwangnyeongsan',
          description:
            "Central mountain (427 m) with one of Busan's best night viewpoints, between Seomyeon and Gwangalli.",
        },
        'pt-BR': {
          name: 'Hwangnyeongsan',
          description:
            'Montanha central (427 m) com um dos melhores mirantes noturnos de Busan, entre Seomyeon e Gwangalli.',
        },
      },
    },
    {
      slug: 'taejongdae-park',
      category: C.HIKING,
      nameKo: '태종대',
      address: 'Jeonmang-ro, Yeongdo-gu, Busan',
      latitude: 35.053,
      longitude: 129.087,
      priceLevel: 1,
      averageSpendKRW: 0,
      openingHours: everyDay('04:00', '24:00'),
      tags: ['coast', 'lighthouse', 'family'],
      trail: { difficulty: D.EASY, distanceKm: 4.3, durationMinutes: 100, elevationGainM: 120 },
      text: {
        en: {
          name: 'Taejongdae Park',
          description:
            'Loop on Yeongdo island through forests and sea cliffs, with a lighthouse and observatory. A small road train covers part of it.',
        },
        'pt-BR': {
          name: 'Parque Taejongdae',
          description:
            'Circuito em Yeongdo por florestas e penhascos sobre o mar, com farol e mirante. Um trenzinho cobre parte do percurso.',
        },
      },
    },

    // ----- Attractions -----
    {
      slug: 'gamcheon-culture-village',
      category: C.ATTRACTION,
      nameKo: '감천문화마을',
      district: 'gamcheon',
      address: '203 Gamnae 2-ro, Saha-gu, Busan',
      latitude: 35.0975,
      longitude: 129.0106,
      priceLevel: 1,
      averageSpendKRW: 3_000,
      openingHours: alwaysOpen(),
      tags: ['art', 'photogenic', 'viewpoint'],
      text: {
        en: {
          name: 'Gamcheon Culture Village',
          description:
            'Colorful terraced houses, murals, art installations and viewpoints. A stamp map guides you through the alleys.',
          hoursNote: 'Shops and the information center are open 09:00–18:00.',
        },
        'pt-BR': {
          name: 'Vilarejo Cultural Gamcheon',
          description:
            'Casas coloridas em escadaria, murais, instalações de arte e mirantes. O mapa de carimbos guia o passeio pelas vielas.',
          hoursNote: 'Lojas e o centro de informações funcionam das 09:00 às 18:00.',
        },
      },
    },
    {
      slug: 'haeundae-blueline-park',
      category: C.ATTRACTION,
      nameKo: '해운대 블루라인파크',
      district: 'haeundae',
      address: '13 Dalmaji-gil 62beon-gil, Haeundae-gu, Busan',
      latitude: 35.1605,
      longitude: 129.1775,
      priceLevel: 2,
      averageSpendKRW: 35_000,
      openingHours: everyDay('09:30', '20:30'),
      tags: ['coast', 'romantic', 'family'],
      text: {
        en: {
          name: 'Haeundae Blueline Park',
          description:
            'A former coastal railway between Mipo and Songjeong, with a seaside tram and colorful elevated sky capsules.',
        },
        'pt-BR': {
          name: 'Haeundae Blueline Park',
          description:
            'Antiga ferrovia costeira entre Mipo e Songjeong, com bondinho à beira-mar e cápsulas suspensas coloridas.',
        },
      },
    },
    {
      slug: 'busan-x-the-sky',
      category: C.ATTRACTION,
      nameKo: '부산엑스더스카이',
      district: 'haeundae',
      address: '30 Dalmaji-gil, Haeundae-gu, Busan',
      latitude: 35.1601,
      longitude: 129.1691,
      priceLevel: 3,
      averageSpendKRW: 27_000,
      openingHours: everyDay('10:00', '21:00'),
      tags: ['views', 'skyscraper', 'rainy-day'],
      text: {
        en: {
          name: 'Busan X the Sky',
          description:
            "Observatory on floors 98 to 100 of LCT, Busan's tallest tower, overlooking Haeundae Beach.",
        },
        'pt-BR': {
          name: 'Busan X the Sky',
          description:
            'Observatório nos andares 98 a 100 da LCT, a torre mais alta de Busan, com vista da praia de Haeundae.',
        },
      },
    },
    {
      slug: 'songdo-marine-cable-car',
      category: C.ATTRACTION,
      nameKo: '송도해상케이블카',
      address: '171 Songdohaebyeon-ro, Seo-gu, Busan',
      latitude: 35.0763,
      longitude: 129.0236,
      priceLevel: 2,
      averageSpendKRW: 22_000,
      openingHours: everyDay('09:00', '21:00'),
      tags: ['sea', 'views', 'family'],
      text: {
        en: {
          name: 'Songdo Marine Cable Car',
          description:
            'Cable car over the sea between Songdo Beach and Amnam Park. The "Crystal" cabins have glass floors.',
        },
        'pt-BR': {
          name: 'Teleférico Marinho de Songdo',
          description:
            'Teleférico sobre o mar entre a praia de Songdo e Amnam Park. A cabine "Crystal" tem piso de vidro.',
        },
      },
    },
    {
      slug: 'busan-tower',
      category: C.ATTRACTION,
      nameKo: '부산타워',
      district: 'nampo',
      address: '37-55 Yongdusan-gil, Jung-gu, Busan',
      latitude: 35.1009,
      longitude: 129.0326,
      priceLevel: 2,
      averageSpendKRW: 12_000,
      openingHours: everyDay('10:00', '22:00'),
      tags: ['views', 'harbor', 'night'],
      text: {
        en: {
          name: 'Busan Tower',
          description:
            'Tower in Yongdusan Park, in the old downtown, with an observation deck over the harbor and mountains.',
        },
        'pt-BR': {
          name: 'Torre de Busan',
          description:
            'Torre no Parque Yongdusan, no centro antigo, com mirante sobre o porto e as montanhas.',
        },
      },
    },

    // ----- Cafés -----
    {
      slug: 'jeonpo-cafe-street',
      category: C.CAFE,
      nameKo: '전포카페거리',
      district: 'seomyeon',
      address: 'Jeonpo-dong, Busanjin-gu, Busan',
      latitude: 35.155,
      longitude: 129.064,
      priceLevel: 2,
      averageSpendKRW: 12_000,
      openingHours: alwaysOpen(),
      tags: ['specialty-coffee', 'desserts', 'photogenic'],
      text: {
        en: {
          name: 'Jeonpo Café Street',
          description:
            "Former workshop and hardware district turned into Busan's biggest cluster of independent cafés, next to Seomyeon.",
          hoursNote: 'Each café keeps its own hours, usually 11:00–22:00.',
        },
        'pt-BR': {
          name: 'Rua dos Cafés de Jeonpo',
          description:
            'Antiga região de oficinas e ferragens que virou o maior polo de cafés autorais de Busan, ao lado de Seomyeon.',
          hoursNote: 'Cada café tem horário próprio, geralmente 11:00–22:00.',
        },
      },
    },
    {
      slug: 'momos-coffee-oncheonjang',
      category: C.CAFE,
      nameKo: '모모스커피 온천장 본점',
      address: 'Oncheon-dong, Dongnae-gu, Busan',
      latitude: 35.219,
      longitude: 129.086,
      priceLevel: 2,
      averageSpendKRW: 10_000,
      openingHours: everyDay('09:00', '21:00'),
      tags: ['specialty-coffee', 'roastery', 'garden'],
      text: {
        en: {
          name: 'Momos Coffee (Oncheonjang)',
          description:
            'Busan roastery whose barista won the 2019 World Barista Championship. The flagship has an inner garden.',
        },
        'pt-BR': {
          name: 'Momos Coffee (Oncheonjang)',
          description:
            'Torrefação de Busan cuja barista venceu o Campeonato Mundial de Baristas de 2019. A loja principal tem jardim interno.',
        },
      },
    },
    {
      slug: 'waveon-coffee',
      category: C.CAFE,
      nameKo: '웨이브온 커피',
      address: 'Ilgwang-eup, Gijang-gun, Busan',
      latitude: 35.2621,
      longitude: 129.234,
      priceLevel: 3,
      averageSpendKRW: 15_000,
      openingHours: everyDay('10:00', '22:00'),
      tags: ['sea-view', 'architecture', 'photogenic'],
      text: {
        en: {
          name: 'Waveon Coffee',
          description:
            'Award-winning architecture on the Gijang coast, with large windows and terraces facing the sea.',
        },
        'pt-BR': {
          name: 'Waveon Coffee',
          description:
            'Café de arquitetura premiada sobre a costa de Gijang, com janelões e terraços voltados para o mar.',
        },
      },
    },
    {
      slug: 'dalmaji-gil-cafes',
      category: C.CAFE,
      nameKo: '달맞이길',
      district: 'haeundae',
      address: 'Dalmaji-gil, Haeundae-gu, Busan',
      latitude: 35.1585,
      longitude: 129.176,
      priceLevel: 2,
      averageSpendKRW: 13_000,
      openingHours: alwaysOpen(),
      tags: ['sea-view', 'cherry-blossoms', 'romantic'],
      text: {
        en: {
          name: 'Dalmaji-gil Cafés',
          description:
            'Winding hillside road above Haeundae lined with sea-view terrace cafés, famous for its cherry blossoms.',
          hoursNote: 'Each café keeps its own hours.',
        },
        'pt-BR': {
          name: 'Cafés do Dalmaji-gil',
          description:
            'Estrada sinuosa na encosta acima de Haeundae, ladeada de cafés com terraço e vista do mar, famosa pelas cerejeiras.',
          hoursNote: 'Cada café tem horário próprio.',
        },
      },
    },

    // ----- Shopping -----
    {
      slug: 'shinsegae-centum-city',
      category: C.SHOPPING,
      nameKo: '신세계 센텀시티',
      address: '35 Centumnam-daero, Haeundae-gu, Busan',
      latitude: 35.169,
      longitude: 129.1295,
      priceLevel: 3,
      averageSpendKRW: 80_000,
      openingHours: everyDay('10:30', '20:00'),
      tags: ['mall', 'luxury', 'rainy-day'],
      text: {
        en: {
          name: 'Shinsegae Centum City',
          description:
            "Recognized by Guinness in 2009 as the world's largest department store, with a spa, ice rink and cinema.",
        },
        'pt-BR': {
          name: 'Shinsegae Centum City',
          description:
            'Reconhecida pelo Guinness em 2009 como a maior loja de departamentos do mundo, com spa, rinque de patinação e cinema.',
        },
      },
    },
    {
      slug: 'gukje-market',
      category: C.SHOPPING,
      nameKo: '국제시장',
      district: 'nampo',
      address: '36 Sinchang-dong 4-ga, Jung-gu, Busan',
      latitude: 35.101,
      longitude: 129.028,
      priceLevel: 1,
      averageSpendKRW: 25_000,
      openingHours: closedOn(['sun'], '09:00', '20:00'),
      tags: ['market', 'history', 'budget'],
      text: {
        en: {
          name: 'Gukje Market',
          description:
            'Traditional market born after the Korean War, selling clothes, electronics, kitchenware and street food.',
          hoursNote: 'Some shops close on Sundays.',
        },
        'pt-BR': {
          name: 'Mercado Gukje',
          description:
            'Mercado tradicional surgido após a Guerra da Coreia, com roupas, eletrônicos, utensílios e comida de rua.',
          hoursNote: 'Parte das lojas fecha aos domingos.',
        },
      },
    },
    {
      slug: 'seomyeon-underground-shopping-center',
      category: C.SHOPPING,
      nameKo: '서면지하상가',
      district: 'seomyeon',
      address: 'Jungang-daero, Busanjin-gu, Busan',
      latitude: 35.1577,
      longitude: 129.059,
      priceLevel: 1,
      averageSpendKRW: 30_000,
      openingHours: everyDay('10:00', '22:00'),
      tags: ['fashion', 'budget', 'rainy-day'],
      text: {
        en: {
          name: 'Seomyeon Underground Shopping Center',
          description:
            'Underground arcades connected to the subway, with fashion, cosmetics and accessories at low prices.',
        },
        'pt-BR': {
          name: 'Shopping Subterrâneo de Seomyeon',
          description:
            'Galerias subterrâneas ligadas ao metrô, com moda, cosméticos e acessórios a preços populares.',
        },
      },
    },

    // ----- Culture -----
    {
      slug: 'haedong-yonggungsa-temple',
      category: C.CULTURE,
      nameKo: '해동용궁사',
      address: '86 Yonggung-gil, Gijang-eup, Gijang-gun, Busan',
      latitude: 35.1883,
      longitude: 129.2233,
      priceLevel: 1,
      averageSpendKRW: 0,
      openingHours: everyDay('05:00', '19:00'),
      tags: ['temple', 'sea', 'sunrise'],
      text: {
        en: {
          name: 'Haedong Yonggungsa Temple',
          description:
            'A rare Buddhist temple built on seaside rocks (founded in 1376). Sunrise here is especially popular.',
        },
        'pt-BR': {
          name: 'Templo Haedong Yonggungsa',
          description:
            'Raro templo budista construído sobre as rochas à beira-mar (fundado em 1376). O nascer do sol ali é muito procurado.',
        },
      },
    },
    {
      slug: 'beomeosa-temple',
      category: C.CULTURE,
      nameKo: '범어사',
      address: '250 Beomeosa-ro, Geumjeong-gu, Busan',
      latitude: 35.2836,
      longitude: 129.0687,
      priceLevel: 1,
      averageSpendKRW: 0,
      openingHours: everyDay('08:30', '17:30'),
      tags: ['temple', 'history', 'templestay'],
      text: {
        en: {
          name: 'Beomeosa Temple',
          description:
            "One of Korea's most important temples, founded in 678 on the slopes of Geumjeongsan. It offers a templestay program.",
        },
        'pt-BR': {
          name: 'Templo Beomeosa',
          description:
            'Um dos templos mais importantes da Coreia, fundado no ano 678 na encosta do Geumjeongsan. Oferece programa de templestay.',
        },
      },
    },
    {
      slug: 'busan-cinema-center',
      category: C.CULTURE,
      nameKo: '영화의전당',
      address: '120 Suyeonggangbyeon-daero, Haeundae-gu, Busan',
      latitude: 35.1712,
      longitude: 129.1272,
      priceLevel: 1,
      averageSpendKRW: 10_000,
      openingHours: closedOn(['mon'], '10:00', '21:00'),
      tags: ['cinema', 'architecture', 'festival'],
      text: {
        en: {
          name: 'Busan Cinema Center',
          description:
            "Home of the Busan International Film Festival, with the world's longest cantilever roof, lit by LEDs at night.",
        },
        'pt-BR': {
          name: 'Busan Cinema Center',
          description:
            'Sede do Festival Internacional de Cinema de Busan, com o maior teto em balanço do mundo, iluminado por LEDs à noite.',
        },
      },
    },

    // ----- Nature -----
    {
      slug: 'haeundae-beach',
      category: C.NATURE,
      nameKo: '해운대해수욕장',
      district: 'haeundae',
      address: 'Haeundaehaebyeon-ro, Haeundae-gu, Busan',
      latitude: 35.1587,
      longitude: 129.1604,
      priceLevel: 1,
      averageSpendKRW: 0,
      openingHours: alwaysOpen(),
      tags: ['beach', 'summer', 'free'],
      text: {
        en: {
          name: 'Haeundae Beach',
          description:
            "The country's most famous beach: 1.5 km of sand, a sand festival in spring and crowds in summer.",
          hoursNote: 'Swimming is officially allowed from June to August.',
        },
        'pt-BR': {
          name: 'Praia de Haeundae',
          description:
            'Praia mais famosa do país, com 1,5 km de areia, festival de areia na primavera e multidões no verão.',
          hoursNote: 'Banho de mar liberado oficialmente de junho a agosto.',
        },
      },
    },
    {
      slug: 'oryukdo-skywalk',
      category: C.NATURE,
      nameKo: '오륙도 스카이워크',
      address: '137 Oryukdo-ro, Nam-gu, Busan',
      latitude: 35.1006,
      longitude: 129.1245,
      priceLevel: 1,
      averageSpendKRW: 0,
      openingHours: everyDay('09:00', '18:00'),
      tags: ['sea', 'views', 'free'],
      text: {
        en: {
          name: 'Oryukdo Skywalk',
          description:
            'Horseshoe-shaped glass walkway 35 m above the sea, facing the rocky Oryukdo islets.',
        },
        'pt-BR': {
          name: 'Oryukdo Skywalk',
          description:
            'Passarela de vidro em formato de ferradura a 35 m sobre o mar, de frente para as ilhas rochosas Oryukdo.',
        },
      },
    },
    {
      slug: 'songjeong-beach',
      category: C.NATURE,
      nameKo: '송정해수욕장',
      address: 'Songjeonghaebyeon-ro, Haeundae-gu, Busan',
      latitude: 35.1786,
      longitude: 129.1999,
      priceLevel: 1,
      averageSpendKRW: 0,
      openingHours: alwaysOpen(),
      tags: ['beach', 'surf', 'quiet'],
      text: {
        en: {
          name: 'Songjeong Beach',
          description:
            'A quieter beach east of Haeundae, favored by beginner surfers, with surf schools and cafés.',
        },
        'pt-BR': {
          name: 'Praia de Songjeong',
          description:
            'Praia mais tranquila a leste de Haeundae, preferida por surfistas iniciantes, com escolas de surfe e cafés.',
        },
      },
    },
  ],
  accommodations: [
    {
      name: 'Paradise Hotel Busan',
      type: 'HOTEL',
      tier: 'LUXURY',
      district: 'haeundae',
      pricePerNightKRW: 450_000,
      latitude: 35.1595,
      longitude: 129.164,
    },
    {
      name: 'Park Hyatt Busan',
      type: 'HOTEL',
      tier: 'LUXURY',
      district: 'haeundae',
      pricePerNightKRW: 500_000,
      latitude: 35.1562,
      longitude: 129.144,
    },
    {
      name: 'Signiel Busan',
      type: 'HOTEL',
      tier: 'LUXURY',
      district: 'haeundae',
      pricePerNightKRW: 600_000,
      latitude: 35.1601,
      longitude: 129.169,
    },
    {
      name: 'Shilla Stay Haeundae',
      type: 'HOTEL',
      tier: 'MID',
      district: 'haeundae',
      pricePerNightKRW: 170_000,
      latitude: 35.1627,
      longitude: 129.1607,
    },
    {
      name: 'ibis Ambassador Busan Haeundae',
      type: 'HOTEL',
      tier: 'MID',
      district: 'haeundae',
      pricePerNightKRW: 140_000,
      latitude: 35.1615,
      longitude: 129.1612,
    },
    {
      name: 'Kent Hotel Gwangalli by Kensington',
      type: 'HOTEL',
      tier: 'MID',
      district: 'gwangalli',
      pricePerNightKRW: 180_000,
      latitude: 35.153,
      longitude: 129.1185,
    },
    {
      name: 'Toyoko Inn Busan Seomyeon',
      type: 'HOTEL',
      tier: 'BUDGET',
      district: 'seomyeon',
      pricePerNightKRW: 75_000,
      latitude: 35.156,
      longitude: 129.061,
    },
    {
      name: 'ibis budget Ambassador Busan Haeundae',
      type: 'HOTEL',
      tier: 'BUDGET',
      district: 'haeundae',
      pricePerNightKRW: 70_000,
      latitude: 35.161,
      longitude: 129.16,
    },
    {
      name: 'Gamcheon Guesthouse',
      type: 'GUESTHOUSE',
      tier: 'BUDGET',
      district: 'gamcheon',
      pricePerNightKRW: 45_000,
      latitude: 35.0972,
      longitude: 129.011,
    },
  ],
};
