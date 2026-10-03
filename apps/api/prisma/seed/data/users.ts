import type { FavoriteSeed, ReviewSeed, UserSeed } from '../types';

// Demo accounts. Passwords come from SEED_ADMIN_PASSWORD / SEED_USER_PASSWORD.
// example.com is reserved for documentation (RFC 2606), so these addresses never reach anyone.

export const ADMIN_EMAIL = 'admin@example.com';

export const users: UserSeed[] = [
  { name: 'Admin korea-project', email: ADMIN_EMAIL, role: 'ADMIN' },
  { name: 'Ana Souza', email: 'ana.souza@example.com', role: 'USER' },
  { name: 'Bruno Lima', email: 'bruno.lima@example.com', role: 'USER' },
  { name: 'Carla Mendes', email: 'carla.mendes@example.com', role: 'USER' },
  { name: 'Diego Rocha', email: 'diego.rocha@example.com', role: 'USER' },
];

const ana = 'ana.souza@example.com';
const bruno = 'bruno.lima@example.com';
const carla = 'carla.mendes@example.com';
const diego = 'diego.rocha@example.com';

export const reviews: ReviewSeed[] = [
  // Seul
  {
    userEmail: ana,
    placeSlug: 'palacio-gyeongbokgung',
    rating: 5,
    title: 'Imperdível, ainda mais de hanbok',
    comment:
      'Alugamos hanbok numa loja ao lado e entramos de graça. Chegue cedo para ver a troca da guarda sem multidão.',
    visitedAt: '2026-04-12',
  },
  {
    userEmail: bruno,
    placeSlug: 'palacio-gyeongbokgung',
    rating: 4,
    title: 'Lindo, mas muito cheio',
    comment: 'O palácio é enorme e bonito. No fim de semana estava lotado; volte num dia útil.',
    visitedAt: '2026-05-03',
  },
  {
    userEmail: carla,
    placeSlug: 'palacio-gyeongbokgung',
    rating: 5,
    title: 'Aula de história a céu aberto',
    comment: 'Vale juntar com o Museu Folclórico, que fica dentro do complexo. Reserve meio dia.',
    visitedAt: '2025-10-20',
  },
  {
    userEmail: ana,
    placeSlug: 'mercado-gwangjang',
    rating: 5,
    title: 'O melhor bindaetteok da vida',
    comment:
      'Comemos de banca em banca. O mayak gimbap vicia mesmo. Leve dinheiro em espécie para as bancas menores.',
    visitedAt: '2026-04-13',
  },
  {
    userEmail: diego,
    placeSlug: 'mercado-gwangjang',
    rating: 4,
    title: 'Ótimo para provar de tudo',
    comment: 'Ambiente animado e barato. Os assentos são apertados, então não espere conforto.',
    visitedAt: '2025-11-08',
  },
  {
    userEmail: bruno,
    placeSlug: 'n-seoul-tower',
    rating: 4,
    title: 'Vista noturna espetacular',
    comment:
      'Subimos de teleférico e descemos a pé pela trilha. O observatório é caro, mas a vista paga.',
    visitedAt: '2026-05-04',
  },
  {
    userEmail: carla,
    placeSlug: 'n-seoul-tower',
    rating: 3,
    title: 'Bonito, porém turístico',
    comment: 'A vista é linda, mas a fila do elevador foi longa e o lugar estava muito cheio.',
    visitedAt: '2025-10-21',
  },
  {
    userEmail: ana,
    placeSlug: 'myeongdong-kyoja',
    rating: 5,
    title: 'Kalguksu que conforta a alma',
    comment:
      'Fila andou rápido, o caldo é delicioso e o kimchi tem bastante alho. Recomendo os mandu.',
    visitedAt: '2026-04-14',
  },
  {
    userEmail: diego,
    placeSlug: 'bukhansan-pico-baegundae',
    rating: 5,
    title: 'Melhor trilha perto de Seul',
    comment:
      'Subida puxada no final, com cabos. Vá com tênis de trilha e água. A vista do topo é inesquecível.',
    visitedAt: '2025-10-25',
  },
  {
    userEmail: bruno,
    placeSlug: 'lotte-world-tower-seoul-sky',
    rating: 4,
    title: 'Piso de vidro dá um frio na barriga',
    comment: 'Fomos ao pôr do sol e valeu muito. Compre o ingresso online para economizar.',
    visitedAt: '2026-05-05',
  },
  {
    userEmail: carla,
    placeSlug: 'vilarejo-bukchon-hanok',
    rating: 4,
    title: 'Charmoso, respeite os moradores',
    comment:
      'As ruas são lindas para fotos. Há placas pedindo silêncio porque as casas são habitadas.',
    visitedAt: '2025-10-22',
  },
  {
    userEmail: ana,
    placeSlug: 'cafe-onion-anguk',
    rating: 4,
    title: 'Pão incrível em um hanok',
    comment: 'O pandoro é famoso por um motivo. Cheio no fim de semana; chegue na abertura.',
    visitedAt: '2026-04-15',
  },
  {
    userEmail: diego,
    placeSlug: 'rua-hongdae-walking-street',
    rating: 4,
    title: 'Energia jovem a noite toda',
    comment:
      'Muitos artistas de rua e bares baratos. No sábado as baladas lotam depois da meia-noite.',
    visitedAt: '2025-11-07',
  },
  {
    userEmail: bruno,
    placeSlug: 'museu-nacional-da-coreia',
    rating: 5,
    title: 'Gratuito e de primeiro mundo',
    comment: 'Acervo impressionante e muito bem organizado. Ótima opção para dia de chuva.',
    visitedAt: '2026-05-06',
  },

  // Busan
  {
    userEmail: ana,
    placeSlug: 'vilarejo-cultural-gamcheon',
    rating: 5,
    title: 'Colorido e cheio de surpresas',
    comment: 'Compre o mapa de carimbos e siga as setas. As vistas lá de cima são lindas.',
    visitedAt: '2026-04-18',
  },
  {
    userEmail: carla,
    placeSlug: 'vilarejo-cultural-gamcheon',
    rating: 4,
    title: 'Muitas escadas, mas vale',
    comment:
      'Vá de táxi até o topo e desça caminhando. As lojinhas de arte são ótimas para presentes.',
    visitedAt: '2025-10-27',
  },
  {
    userEmail: bruno,
    placeSlug: 'templo-haedong-yonggungsa',
    rating: 5,
    title: 'Templo sobre o mar, surreal',
    comment:
      'Fomos cedo e pegamos o sol nascendo atrás das rochas. Muito diferente dos templos de montanha.',
    visitedAt: '2026-05-08',
  },
  {
    userEmail: diego,
    placeSlug: 'templo-haedong-yonggungsa',
    rating: 4,
    title: 'Lindo, porém lotado de dia',
    comment:
      'A localização é incrível. Depois das 10h fica bem cheio; o ideal é ir logo na abertura.',
    visitedAt: '2025-11-10',
  },
  {
    userEmail: ana,
    placeSlug: 'mercado-de-peixes-jagalchi',
    rating: 4,
    title: 'Frutos do mar fresquíssimos',
    comment: 'Escolhemos o peixe embaixo e comemos em cima. Negocie o preço antes de fechar.',
    visitedAt: '2026-04-19',
  },
  {
    userEmail: carla,
    placeSlug: 'praia-de-haeundae',
    rating: 4,
    title: 'Praia urbana muito bem cuidada',
    comment: 'Areia limpa e estrutura ótima. Em agosto é lotada, mas em junho estava tranquila.',
    visitedAt: '2025-06-15',
  },
  {
    userEmail: bruno,
    placeSlug: 'haeundae-blueline-park',
    rating: 5,
    title: 'Cápsula do céu é obrigatória',
    comment:
      'Reserve a sky capsule com antecedência. Passeio romântico com vista para o mar o tempo todo.',
    visitedAt: '2026-05-09',
  },
  {
    userEmail: diego,
    placeSlug: 'orla-de-gwangalli',
    rating: 5,
    title: 'Noite perfeita com vista da ponte',
    comment:
      'Vimos o show de drones no sábado com uma cerveja na mão. Um dos melhores momentos da viagem.',
    visitedAt: '2025-11-08',
  },
  {
    userEmail: ana,
    placeSlug: 'beco-do-dwaeji-gukbap-de-seomyeon',
    rating: 4,
    title: 'Sopa de porco que vale a fama',
    comment:
      'Barato, farto e servido rapidinho. Adicione o camarão salgado no caldo como os locais fazem.',
    visitedAt: '2026-04-20',
  },

  // Jeju
  {
    userEmail: carla,
    placeSlug: 'seongsan-ilchulbong',
    rating: 5,
    title: 'Nascer do sol inesquecível',
    comment: 'Subida curta, mas íngreme. Lá de cima dá para ver a cratera inteira e o mar.',
    visitedAt: '2025-10-30',
  },
  {
    userEmail: ana,
    placeSlug: 'seongsan-ilchulbong',
    rating: 4,
    title: 'Rápido e lindo',
    comment: 'Em 30 minutos você está no topo. Depois desça para ver as haenyeo se apresentando.',
    visitedAt: '2026-04-23',
  },
  {
    userEmail: diego,
    placeSlug: 'hallasan-trilha-seongpanak',
    rating: 5,
    title: 'Desafio do ano',
    comment:
      'Reservei online, saí às 6h e cheguei ao cume antes do meio-dia. Longa, mas a cratera compensa.',
    visitedAt: '2025-10-18',
  },
  {
    userEmail: bruno,
    placeSlug: 'ilha-udo',
    rating: 5,
    title: 'Dia perfeito de carrinho elétrico',
    comment:
      'Alugamos um carrinho elétrico e demos a volta na ilha. O sorvete de amendoim é obrigatório.',
    visitedAt: '2026-05-12',
  },
  {
    userEmail: carla,
    placeSlug: 'rua-do-porco-preto',
    rating: 4,
    title: 'Porco preto suculento',
    comment: 'Carne muito saborosa. Peça o molho de anchova, combina demais.',
    visitedAt: '2025-10-29',
  },
  {
    userEmail: ana,
    placeSlug: 'o-sulloc-tea-museum',
    rating: 4,
    title: 'Sorvete de matcha delicioso',
    comment: 'As plantações são lindas para caminhar. A loja tem ótimos presentes de chá.',
    visitedAt: '2026-04-24',
  },
  {
    userEmail: bruno,
    placeSlug: 'mercado-dongmun',
    rating: 4,
    title: 'Tangerinas e muita comida',
    comment: 'Voltamos à noite para o mercado noturno. A lagosta grelhada com queijo é famosa.',
    visitedAt: '2026-05-11',
  },

  // Incheon
  {
    userEmail: diego,
    placeSlug: 'chinatown-de-incheon',
    rating: 4,
    title: 'Ótimo bate-volta de Seul',
    comment: 'Fácil de chegar de metrô. Combine com a vila dos contos de fadas, que fica ao lado.',
    visitedAt: '2025-11-12',
  },
  {
    userEmail: carla,
    placeSlug: 'gonghwachun',
    rating: 4,
    title: 'Jajangmyeon com história',
    comment: 'Prato gostoso e bem servido. Visite o museu do jajangmyeon antes, fica na mesma rua.',
    visitedAt: '2025-11-02',
  },
  {
    userEmail: bruno,
    placeSlug: 'mercado-internacional-de-sinpo',
    rating: 5,
    title: 'Dakgangjeong viciante',
    comment:
      'Frango crocante e agridoce. Pedimos uma caixa para levar e acabou antes de chegar ao hotel.',
    visitedAt: '2026-05-14',
  },
  {
    userEmail: ana,
    placeSlug: 'songdo-central-park',
    rating: 4,
    title: 'Passeio de barco relaxante',
    comment:
      'Fizemos o passeio de barco no canal ao entardecer. Ótimo para a última noite antes do voo.',
    visitedAt: '2026-04-27',
  },
];

export const favorites: FavoriteSeed[] = [
  { userEmail: ana, placeSlug: 'palacio-gyeongbokgung' },
  { userEmail: ana, placeSlug: 'vilarejo-cultural-gamcheon' },
  { userEmail: ana, placeSlug: 'seongsan-ilchulbong' },
  { userEmail: bruno, placeSlug: 'haeundae-blueline-park' },
  { userEmail: bruno, placeSlug: 'ilha-udo' },
  { userEmail: carla, placeSlug: 'vilarejo-bukchon-hanok' },
  { userEmail: diego, placeSlug: 'bukhansan-pico-baegundae' },
  { userEmail: diego, placeSlug: 'hallasan-trilha-seongpanak' },
];
