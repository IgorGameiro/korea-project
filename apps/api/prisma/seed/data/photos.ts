import type { Photo } from '@korea-project/shared';

// Real photos from Wikimedia Commons, reviewed one by one (2026-10-06): each was matched through the
// place's Wikidata item (its official image, P18) or a Commons search, and checked visually to show
// the place itself. Licenses (CC BY, CC BY-SA, CC0, public domain, KOGL Type 1, GFDL) require the
// credit shown on the site. Places missing here keep a placeholder (no free photo found or none
// that really showed the place). URLs are Commons thumbnails (hotlinked; see README).

export const cityPhotos: Record<string, Photo> = {
  seoul: {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/88/%EB%8D%95%EC%88%98%EA%B6%81%EC%9D%98_%EA%B0%80%EC%9D%84.jpg/1920px-%EB%8D%95%EC%88%98%EA%B6%81%EC%9D%98_%EA%B0%80%EC%9D%84.jpg',
    credit: {
      author: '라성민',
      license: 'CC BY-SA 3.0',
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:%EB%8D%95%EC%88%98%EA%B6%81%EC%9D%98_%EA%B0%80%EC%9D%84.jpg',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0',
    },
  },
  busan: {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5c/Skyline_of_Busan_Including_Gwangan_Bridge%2C_Marine_City_and_LCT_Skyscrapers.jpg/1920px-Skyline_of_Busan_Including_Gwangan_Bridge%2C_Marine_City_and_LCT_Skyscrapers.jpg',
    credit: {
      author: 'S h y numis',
      license: 'CC BY 4.0',
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:Skyline_of_Busan_Including_Gwangan_Bridge,_Marine_City_and_LCT_Skyscrapers.jpg',
      licenseUrl: 'https://creativecommons.org/licenses/by/4.0',
    },
  },
  jeju: {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/19/Hydrangea_macrophylla_in_front_of_Seongsan_Ilchulbong_volcano_at_blue_hour_in_Jeju_Island_South_Korea.jpg/1920px-Hydrangea_macrophylla_in_front_of_Seongsan_Ilchulbong_volcano_at_blue_hour_in_Jeju_Island_South_Korea.jpg',
    credit: {
      author: 'Basile Morin',
      license: 'CC BY-SA 4.0',
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:Hydrangea_macrophylla_in_front_of_Seongsan_Ilchulbong_volcano_at_blue_hour_in_Jeju_Island_South_Korea.jpg',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    },
  },
  incheon: {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ec/Incheon_Cityscape.jpg/1920px-Incheon_Cityscape.jpg',
    credit: {
      author: 'JNicol',
      license: 'CC BY-SA 3.0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Incheon_Cityscape.jpg',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0',
    },
  },
};

export const placePhotos: Record<string, Photo> = {
  achasan: {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7e/Achasan2.jpg/1920px-Achasan2.jpg',
    credit: {
      author: 'Straitgate',
      license: 'CC BY-SA 3.0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Achasan2.jpg',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0',
    },
  },
  'banpo-bridge-rainbow-fountain': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/ba/Banpo_Moonlight_Rainbow_Fountain.jpg/1920px-Banpo_Moonlight_Rainbow_Fountain.jpg',
    credit: {
      author: 'Cookinu',
      license: 'CC BY-SA 4.0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Banpo_Moonlight_Rainbow_Fountain.jpg',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    },
  },
  'beomeosa-temple': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/1/14/Korea-Busan-Beomeosa-01.jpg',
    credit: {
      author: 'by Paul_Canning',
      license: 'CC BY 2.0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Korea-Busan-Beomeosa-01.jpg',
      licenseUrl: 'https://creativecommons.org/licenses/by/2.0',
    },
  },
  'bijarim-forest': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/a/aa/%EC%A0%9C%EC%A3%BC_%EB%B9%84%EC%9E%90%EB%A6%BC_Jeju_Bijarim-cropped.jpg',
    credit: {
      author: 'TKostolany',
      license: 'CC BY-SA 4.0',
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:%EC%A0%9C%EC%A3%BC_%EB%B9%84%EC%9E%90%EB%A6%BC_Jeju_Bijarim-cropped.jpg',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    },
  },
  'bukchon-hanok-village': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4e/Bukchon_Village_Seoul.jpg/1920px-Bukchon_Village_Seoul.jpg',
    credit: {
      author: 'kallerna',
      license: 'CC BY-SA 4.0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Bukchon_Village_Seoul.jpg',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    },
  },
  'bukhansan-baegundae-peak': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/6/60/Insoo_peak.jpg',
    credit: {
      author: 'Jkp008',
      license: 'Public domain',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Insoo_peak.jpg',
    },
  },
  'bupyeong-culture-street': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2a/%EC%9D%B8%EC%B2%9C%EA%B4%91%EC%97%AD%EC%8B%9C_%EB%B6%80%ED%8F%89%EA%B5%AC_%EB%B6%80%ED%8F%89%EB%AC%B8%ED%99%94%EB%A1%9C.jpg/1920px-%EC%9D%B8%EC%B2%9C%EA%B4%91%EC%97%AD%EC%8B%9C_%EB%B6%80%ED%8F%89%EA%B5%AC_%EB%B6%80%ED%8F%89%EB%AC%B8%ED%99%94%EB%A1%9C.jpg',
    credit: {
      author: 'Narubaru7',
      license: 'CC BY 4.0',
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:%EC%9D%B8%EC%B2%9C%EA%B4%91%EC%97%AD%EC%8B%9C_%EB%B6%80%ED%8F%89%EA%B5%AC_%EB%B6%80%ED%8F%89%EB%AC%B8%ED%99%94%EB%A1%9C.jpg',
      licenseUrl: 'https://creativecommons.org/licenses/by/4.0',
    },
  },
  'busan-cinema-center': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/e/e1/Busan_Cinema_Center.jpg',
    credit: {
      author: '399scout',
      license: 'CC BY-SA 4.0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Busan_Cinema_Center.jpg',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    },
  },
  'busan-x-the-sky': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/bf/Haeundae_Beach_20200522_005.jpg/1920px-Haeundae_Beach_20200522_005.jpg',
    credit: {
      author: 'Mobius6',
      license: 'CC BY-SA 4.0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Haeundae_Beach_20200522_005.jpg',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    },
  },
  'changdeokgung-palace': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d4/%EC%B0%BD%EB%8D%95%EA%B6%81_%EC%A0%84%EA%B2%BD_%282012%29.jpg/1920px-%EC%B0%BD%EB%8D%95%EA%B6%81_%EC%A0%84%EA%B2%BD_%282012%29.jpg',
    credit: {
      author: '문화재청',
      license: 'KOGL Type 1',
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:%EC%B0%BD%EB%8D%95%EA%B6%81_%EC%A0%84%EA%B2%BD_(2012).jpg',
      licenseUrl: 'http://www.kogl.or.kr/info/licenseType1.do',
    },
  },
  'cheonggyecheon-stream': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/67/Cheonggyecheon_evening_2.jpg/1920px-Cheonggyecheon_evening_2.jpg',
    credit: {
      author: 'kallerna This photo was taken with Fujifilm X-T30',
      license: 'CC BY-SA 4.0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Cheonggyecheon_evening_2.jpg',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    },
  },
  'cheonjiyeon-waterfall': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1b/Cheonjiyeon_Waterfall_20160616_092608.jpg/1920px-Cheonjiyeon_Waterfall_20160616_092608.jpg',
    credit: {
      author: 'Yhnn0065 This photo was taken with Sony ILCE-6000',
      license: 'CC BY-SA 3.0',
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:Cheonjiyeon_Waterfall_20160616_092608.jpg',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0',
    },
  },
  'dongdaemun-design-plaza': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8f/Dongdaemun_Design_Plaza_at_night%2C_Seoul%2C_Korea.jpg/1920px-Dongdaemun_Design_Plaza_at_night%2C_Seoul%2C_Korea.jpg',
    credit: {
      author: 'Eugene Lim',
      license: 'CC BY 2.0',
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:Dongdaemun_Design_Plaza_at_night,_Seoul,_Korea.jpg',
      licenseUrl: 'https://creativecommons.org/licenses/by/2.0',
    },
  },
  'dongmun-market': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7a/Jeju_dongmun_market_1.JPG/1920px-Jeju_dongmun_market_1.JPG',
    credit: {
      author: 'thddbwnd',
      license: 'CC BY 3.0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Jeju_dongmun_market_1.JPG',
      licenseUrl: 'https://creativecommons.org/licenses/by/3.0',
    },
  },
  'dongmun-night-market': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c7/Lobster_and_crab_at_Dongmun_Market%2C_Jeju.jpg/1920px-Lobster_and_crab_at_Dongmun_Market%2C_Jeju.jpg',
    credit: {
      author: 'Journyes',
      license: 'CC BY-SA 4.0',
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:Lobster_and_crab_at_Dongmun_Market,_Jeju.jpg',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    },
  },
  'eurwangni-beach': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/99/Eurwangni_Beach%2C_Incheon_%28%EC%9D%B8%EC%B2%9C_%EC%9D%84%EC%99%95%EB%A6%AC_%ED%95%B4%EC%88%98%EC%9A%95%EC%9E%A5%29_-_panoramio.jpg/1920px-Eurwangni_Beach%2C_Incheon_%28%EC%9D%B8%EC%B2%9C_%EC%9D%84%EC%99%95%EB%A6%AC_%ED%95%B4%EC%88%98%EC%9A%95%EC%9E%A5%29_-_panoramio.jpg',
    credit: {
      author: '골뱅이',
      license: 'CC BY-SA 3.0',
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:Eurwangni_Beach,_Incheon_(%EC%9D%B8%EC%B2%9C_%EC%9D%84%EC%99%95%EB%A6%AC_%ED%95%B4%EC%88%98%EC%9A%95%EC%9E%A5)_-_panoramio.jpg',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0',
    },
  },
  'gamcheon-culture-village': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c8/Gamcheon_Culture_Village_1.jpg/1920px-Gamcheon_Culture_Village_1.jpg',
    credit: {
      author: 'Christophe95',
      license: 'CC BY-SA 4.0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Gamcheon_Culture_Village_1.jpg',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    },
  },
  'ganghwa-dolmens': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/f/f7/Ganghwado.jpg',
    credit: {
      author: 'Elswhs at Dutch Wikipedia (Original text: Els Slots)',
      license: 'CC BY-SA 3.0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Ganghwado.jpg',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/',
    },
  },
  'gangnam-station': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/86/Q17469_Gangnam_B02.jpg/1920px-Q17469_Gangnam_B02.jpg',
    credit: {
      author: '분당선M',
      license: 'CC BY-SA 3.0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Q17469_Gangnam_B02.jpg',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0',
    },
  },
  'geumjeongsan-fortress': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1f/Geumjeong_Fortress_North_Gate.jpg/1920px-Geumjeong_Fortress_North_Gate.jpg',
    credit: {
      author: 'Christophe95',
      license: 'CC BY-SA 4.0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Geumjeong_Fortress_North_Gate.jpg',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    },
  },
  gonghwachun: {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/47/Museum_of_Jajangmyeon_%28Former_Gonghwachun%29.jpg/1920px-Museum_of_Jajangmyeon_%28Former_Gonghwachun%29.jpg',
    credit: {
      author: 'Jjw',
      license: 'CC BY-SA 4.0',
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:Museum_of_Jajangmyeon_(Former_Gonghwachun).jpg',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    },
  },
  'gukje-market': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/44/%E5%9C%8B%E9%9A%9B%E5%B8%82%E5%A0%B4.jpg/1920px-%E5%9C%8B%E9%9A%9B%E5%B8%82%E5%A0%B4.jpg',
    credit: {
      author: 'Vano111ru',
      license: 'CC BY-SA 4.0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:%E5%9C%8B%E9%9A%9B%E5%B8%82%E5%A0%B4.jpg',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    },
  },
  'guwol-dong-rodeo-street': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7f/%EA%B5%AC%EC%9B%94%EB%8F%99_%EB%A1%9C%EB%8D%B0%EC%98%A4%EA%B1%B0%EB%A6%AC_%EC%9D%B8%ED%95%98%EB%A1%9C511%EB%B2%88%EA%B8%B8_2025.jpg/1920px-%EA%B5%AC%EC%9B%94%EB%8F%99_%EB%A1%9C%EB%8D%B0%EC%98%A4%EA%B1%B0%EB%A6%AC_%EC%9D%B8%ED%95%98%EB%A1%9C511%EB%B2%88%EA%B8%B8_2025.jpg',
    credit: {
      author: 'Narubaru7',
      license: 'CC BY 4.0',
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:%EA%B5%AC%EC%9B%94%EB%8F%99_%EB%A1%9C%EB%8D%B0%EC%98%A4%EA%B1%B0%EB%A6%AC_%EC%9D%B8%ED%95%98%EB%A1%9C511%EB%B2%88%EA%B8%B8_2025.jpg',
      licenseUrl: 'https://creativecommons.org/licenses/by/4.0',
    },
  },
  gwanaksan: {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/81/Gwanaksan_Seoul_KR.jpg/1920px-Gwanaksan_Seoul_KR.jpg',
    credit: {
      author: 'Wolfgang Schaefer (photographer)',
      license: 'CC BY-SA 3.0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Gwanaksan_Seoul_KR.jpg',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/',
    },
  },
  'gwangjang-market': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/94/Gwangjang_Market%2C_Seoul_01.jpg/1920px-Gwangjang_Market%2C_Seoul_01.jpg',
    credit: {
      author: 'Bgag',
      license: 'CC0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Gwangjang_Market,_Seoul_01.jpg',
      licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/deed.en',
    },
  },
  'gyeongbokgung-palace': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/63/%EA%B4%91%ED%99%94%EB%AC%B8_%EC%9B%94%EB%8C%80.jpg/1920px-%EA%B4%91%ED%99%94%EB%AC%B8_%EC%9B%94%EB%8C%80.jpg',
    credit: {
      author: '서울관광 아카이브',
      license: 'KOGL Type 1',
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:%EA%B4%91%ED%99%94%EB%AC%B8_%EC%9B%94%EB%8C%80.jpg',
      licenseUrl: 'http://www.kogl.or.kr/info/licenseType1.do',
    },
  },
  'gyeongnidan-gil': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/36/Itaewon_Gyeongnidan-gil_1.jpg/1920px-Itaewon_Gyeongnidan-gil_1.jpg',
    credit: {
      author: 'Korea Tourism Organization, Kim Jiho',
      license: 'KOGL Type 1',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Itaewon_Gyeongnidan-gil_1.jpg',
      licenseUrl: 'http://www.kogl.or.kr/info/licenseType1.do',
    },
  },
  'gyeongui-line-forest-park': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a5/Gyeonguiseon_Forest_Trail_Park_and_Ttaeng-ttaeng_Street_in_Seoul_%28near_Hongdae%2C_1%29.jpg/1920px-Gyeonguiseon_Forest_Trail_Park_and_Ttaeng-ttaeng_Street_in_Seoul_%28near_Hongdae%2C_1%29.jpg',
    credit: {
      author: 'Christian Bolz (크리스티안 볼츠)',
      license: 'CC BY-SA 4.0',
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:Gyeonguiseon_Forest_Trail_Park_and_Ttaeng-ttaeng_Street_in_Seoul_(near_Hongdae,_1).jpg',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    },
  },
  gyeyangsan: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/f/f3/Gyeyang_Mountain_20081228-1.jpg',
    credit: {
      author: 'User:G43',
      license: 'CC BY 3.0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Gyeyang_Mountain_20081228-1.jpg',
      licenseUrl: 'https://creativecommons.org/licenses/by/3.0',
    },
  },
  'haedong-yonggungsa-temple': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d4/Haedong_Yonggungsa_Temple_view_on_sea.JPG/1920px-Haedong_Yonggungsa_Temple_view_on_sea.JPG',
    credit: {
      author: 'Londenp',
      license: 'CC BY-SA 3.0',
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:Haedong_Yonggungsa_Temple_view_on_sea.JPG',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0',
    },
  },
  'haenyeo-museum': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f2/Haenyeo_Museum.jpg/1920px-Haenyeo_Museum.jpg',
    credit: {
      author: 'Vanbasten 23',
      license: 'CC BY-SA 3.0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Haenyeo_Museum.jpg',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0',
    },
  },
  'haeundae-beach': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a2/Haeundae_Beach_in_Busan.jpg/1920px-Haeundae_Beach_in_Busan.jpg',
    credit: {
      author: 'StephNurnberg',
      license: 'CC BY 2.0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Haeundae_Beach_in_Busan.jpg',
      licenseUrl: 'https://creativecommons.org/licenses/by/2.0',
    },
  },
  'haeundae-blueline-park': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8e/Sky_Capsule_train_at_Haeundae_Blueline_Park%2C_Busan.jpg/1920px-Sky_Capsule_train_at_Haeundae_Blueline_Park%2C_Busan.jpg',
    credit: {
      author: 'VN.NguyenDucDuy',
      license: 'CC BY-SA 4.0',
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:Sky_Capsule_train_at_Haeundae_Blueline_Park,_Busan.jpg',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    },
  },
  'haeundae-gunam-ro': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/17/Crowds_at_the_crosswalk_on_Gunam-ro_Culture_Square%2C_Haeundae%2C_at_twilight.jpg/1920px-Crowds_at_the_crosswalk_on_Gunam-ro_Culture_Square%2C_Haeundae%2C_at_twilight.jpg',
    credit: {
      author: 'Pranay chakraborty 2004',
      license: 'CC BY 4.0',
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:Crowds_at_the_crosswalk_on_Gunam-ro_Culture_Square,_Haeundae,_at_twilight.jpg',
      licenseUrl: 'https://creativecommons.org/licenses/by/4.0',
    },
  },
  'hallasan-eorimok-trail': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1a/Hallasan_2.jpg/1920px-Hallasan_2.jpg',
    credit: {
      author: 'Unknown',
      license: 'Public domain',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Hallasan_2.jpg',
    },
  },
  'hallasan-seongpanak-trail': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1a/Hallasan_2.jpg/1920px-Hallasan_2.jpg',
    credit: {
      author: 'Unknown',
      license: 'Public domain',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Hallasan_2.jpg',
    },
  },
  'hallim-park': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/55/Hallim_Park_33.jpg/1920px-Hallim_Park_33.jpg',
    credit: {
      author: 'Grapesurgeon',
      license: 'CC BY-SA 4.0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Hallim_Park_33.jpg',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    },
  },
  'hongdae-walking-street': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/cf/Hongdae_Streets.jpg/1920px-Hongdae_Streets.jpg',
    credit: {
      author: 'U0894629',
      license: 'CC BY-SA 4.0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Hongdae_Streets.jpg',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    },
  },
  hwangnyeongsan: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/d/d7/Tr_st_hwangnyeongsan.jpg',
    credit: {
      author: 'Sz1161',
      license: 'GFDL',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Tr_st_hwangnyeongsan.jpg',
      licenseUrl: 'http://www.gnu.org/copyleft/fdl.html',
    },
  },
  'hyeopjae-beach': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2e/Hyeopjae_Beach_Scenery.jpg/1920px-Hyeopjae_Beach_Scenery.jpg',
    credit: {
      author: 'Lcarrion88',
      license: 'CC BY-SA 4.0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Hyeopjae_Beach_Scenery.jpg',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    },
  },
  'incheon-chinatown': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/52/Chinatown%2C_incheon_20230430_002.jpg/1920px-Chinatown%2C_incheon_20230430_002.jpg',
    credit: {
      author: 'Mobius6',
      license: 'CC BY-SA 4.0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Chinatown,_incheon_20230430_002.jpg',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    },
  },
  inwangsan: {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/cf/Korea-Seoul-Inwangsan-01.jpg/1920px-Korea-Seoul-Inwangsan-01.jpg',
    credit: {
      author: 'Gaël Chardon',
      license: 'CC BY-SA 2.0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Korea-Seoul-Inwangsan-01.jpg',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/2.0',
    },
  },
  'itaewon-bar-street': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b6/Itaewon_bar_and_restaurant_street%2C_March_18%2C_2016.jpg/1920px-Itaewon_bar_and_restaurant_street%2C_March_18%2C_2016.jpg',
    credit: {
      author: 'anokarina',
      license: 'CC BY-SA 2.0',
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:Itaewon_bar_and_restaurant_street,_March_18,_2016.jpg',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/2.0',
    },
  },
  'jagalchi-fish-market': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/04/Jagalchi_Fish_Market_at_Morning.jpg/1920px-Jagalchi_Fish_Market_at_Morning.jpg',
    credit: {
      author: 'Doo Ho Kim',
      license: 'CC BY-SA 2.0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Jagalchi_Fish_Market_at_Morning.jpg',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/2.0',
    },
  },
  'jajangmyeon-museum': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f5/Jjajangmyeon_Museum%2C_2013.jpg/1920px-Jjajangmyeon_Museum%2C_2013.jpg',
    credit: {
      author: 'PuzzletChung',
      license: 'CC0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Jjajangmyeon_Museum,_2013.jpg',
      licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/deed.en',
    },
  },
  jangsan: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/5/54/Panorama_of_Mt._Jang_%28Busan%29.jpg',
    credit: {
      author: 'Bandoche',
      license: 'Public domain',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Panorama_of_Mt._Jang_(Busan).jpg',
    },
  },
  'jeju-five-day-market': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f1/Jeju_City_Traditional_Five-Day_Market_10.jpg/1920px-Jeju_City_Traditional_Five-Day_Market_10.jpg',
    credit: {
      author: 'Grapesurgeon',
      license: 'CC BY-SA 4.0',
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:Jeju_City_Traditional_Five-Day_Market_10.jpg',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    },
  },
  'jeju-olle-trail-route-7': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2e/Jeju_olle_trail_marker.jpg/1920px-Jeju_olle_trail_marker.jpg',
    credit: {
      author: 'Sgroey',
      license: 'CC BY-SA 4.0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Jeju_olle_trail_marker.jpg',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    },
  },
  'jeju-stone-park': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9d/Jeju_Stone_Museum_01.jpg/1920px-Jeju_Stone_Museum_01.jpg',
    credit: {
      author: 'Bernard Gagnon',
      license: 'CC0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Jeju_Stone_Museum_01.jpg',
      licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/deed.en',
    },
  },
  'jeondeungsa-temple': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2b/Jeondeungsa_02.JPG/1920px-Jeondeungsa_02.JPG',
    credit: {
      author: 'Dalgial',
      license: 'CC BY-SA 3.0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Jeondeungsa_02.JPG',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0',
    },
  },
  'jusangjeolli-cliffs': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/56/Daepo_Jusangjeolli_Cliff_01.jpg/1920px-Daepo_Jusangjeolli_Cliff_01.jpg',
    credit: {
      author: 'Bernard Gagnon',
      license: 'CC0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Daepo_Jusangjeolli_Cliff_01.jpg',
      licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/deed.en',
    },
  },
  'lotte-world': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9a/Lotte_World.jpg/1920px-Lotte_World.jpg',
    credit: {
      author: 'SJ Yang',
      license: 'CC BY-SA 2.0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Lotte_World.jpg',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/2.0',
    },
  },
  'lotte-world-tower-seoul-sky': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/57/Lotte_World_morning_view_8.jpg/1920px-Lotte_World_morning_view_8.jpg',
    credit: {
      author: 'kallerna',
      license: 'CC BY-SA 4.0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Lotte_World_morning_view_8.jpg',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    },
  },
  'manisan-ganghwa': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/0/0f/Mt_mani_2.jpg',
    credit: {
      author: 'w:ko:Jtm71',
      license: 'CC BY 2.0 kr',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Mt_mani_2.jpg',
      licenseUrl: 'https://creativecommons.org/licenses/by/2.0/kr/deed.en',
    },
  },
  'myeongdong-shopping-street': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/2/23/Seoul-Myeongdong-02.jpg',
    credit: {
      author: 'by thelearnr',
      license: 'CC BY 2.0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Seoul-Myeongdong-02.jpg',
      licenseUrl: 'https://creativecommons.org/licenses/by/2.0',
    },
  },
  'namdaemun-market': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ec/Namdaemun_Market_Alley.jpg/1920px-Namdaemun_Market_Alley.jpg',
    credit: {
      author: 'Adbar',
      license: 'CC BY-SA 3.0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Namdaemun_Market_Alley.jpg',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0',
    },
  },
  'national-museum-of-korea': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/32/Front_view_of_national_museum_of_korea.jpg/1920px-Front_view_of_national_museum_of_korea.jpg',
    credit: {
      author: 'Jinah78',
      license: 'CC BY-SA 3.0',
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:Front_view_of_national_museum_of_korea.jpg',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0',
    },
  },
  'noryangjin-fish-market': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7c/Korea-Seoul-Noryangjin_Fish_Market-03.jpg/1920px-Korea-Seoul-Noryangjin_Fish_Market-03.jpg',
    credit: {
      author: 'Gaël Chardon',
      license: 'CC BY-SA 2.0',
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:Korea-Seoul-Noryangjin_Fish_Market-03.jpg',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/2.0',
    },
  },
  'oryukdo-skywalk': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/52/Oryukdo_Skywalk_in_Busan%2C_South_Korea.jpg/1920px-Oryukdo_Skywalk_in_Busan%2C_South_Korea.jpg',
    credit: {
      author: 'Choi2451',
      license: 'CC0',
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:Oryukdo_Skywalk_in_Busan,_South_Korea.jpg',
      licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/deed.en',
    },
  },
  'osulloc-tea-museum': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4f/Osulloc_Tea_Museum_%26_Fields%2C_Jeju.jpg/1920px-Osulloc_Tea_Museum_%26_Fields%2C_Jeju.jpg',
    credit: {
      author: 'Matt Kieffer',
      license: 'CC BY-SA 2.0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Osulloc_Tea_Museum_%26_Fields,_Jeju.jpg',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/2.0',
    },
  },
  'saebyeol-oreum': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7a/Saebyeol_Oreum_04.jpg/1920px-Saebyeol_Oreum_04.jpg',
    credit: {
      author: 'Grapesurgeon',
      license: 'CC BY-SA 4.0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Saebyeol_Oreum_04.jpg',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    },
  },
  'seogwipo-olle-market': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c0/Seogwipo_Maeil_Olle_Market_03.jpg/1920px-Seogwipo_Maeil_Olle_Market_03.jpg',
    credit: {
      author: 'Seefooddiet',
      license: 'CC BY-SA 4.0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Seogwipo_Maeil_Olle_Market_03.jpg',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    },
  },
  'seongeup-folk-village': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c5/Seongeup_Historic_Village.jpg/1920px-Seongeup_Historic_Village.jpg',
    credit: {
      author: 'Trainholic',
      license: 'CC BY-SA 4.0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Seongeup_Historic_Village.jpg',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    },
  },
  'seongsan-ilchulbong': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/61/Seongsan_Ilchulbong_from_the_air.jpg/1920px-Seongsan_Ilchulbong_from_the_air.jpg',
    credit: {
      author: 'Korea.net / Korean Culture and Information Service',
      license: 'CC BY-SA 2.0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Seongsan_Ilchulbong_from_the_air.jpg',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/2.0',
    },
  },
  seopjikoji: {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2c/Seopjikoji-ro%2C_Seongsan-eup%2C_Seogwipo-si%2C_Jeju-do%2C_South_Korea_-_panoramio.jpg/1920px-Seopjikoji-ro%2C_Seongsan-eup%2C_Seogwipo-si%2C_Jeju-do%2C_South_Korea_-_panoramio.jpg',
    credit: {
      author: 'song songroov',
      license: 'CC BY 3.0',
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:Seopjikoji-ro,_Seongsan-eup,_Seogwipo-si,_Jeju-do,_South_Korea_-_panoramio.jpg',
      licenseUrl: 'https://creativecommons.org/licenses/by/3.0',
    },
  },
  'seoul-forest': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Seoulforest_path01.jpg',
    credit: {
      author: 'Enigma7seven',
      license: 'CC BY-SA 3.0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Seoulforest_path01.jpg',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0',
    },
  },
  'shinsegae-centum-city': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/2/22/Shinsegae_in_Busan-_Guinness_World_Record.jpg',
    credit: {
      author: 'Kimberly Hiller',
      license: 'CC BY 2.0',
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:Shinsegae_in_Busan-_Guinness_World_Record.jpg',
      licenseUrl: 'https://creativecommons.org/licenses/by/2.0',
    },
  },
  'sinpo-international-market': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7a/Sinpo-market.jpg/1920px-Sinpo-market.jpg',
    credit: {
      author: 'Mming na',
      license: 'CC BY-SA 4.0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Sinpo-market.jpg',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    },
  },
  'songdo-central-park': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/cf/Songdo_Convensia_and_Central_Park_View.jpg/1920px-Songdo_Convensia_and_Central_Park_View.jpg',
    credit: {
      author: 'Ken Eckert',
      license: 'CC BY-SA 4.0',
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:Songdo_Convensia_and_Central_Park_View.jpg',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    },
  },
  'songjeong-beach': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/86/Songjeong_Beach_20220430_004.jpg/1920px-Songjeong_Beach_20220430_004.jpg',
    credit: {
      author: 'Mobius6',
      license: 'CC BY-SA 4.0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Songjeong_Beach_20220430_004.jpg',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    },
  },
  'songwol-dong-fairy-tale-village': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/78/Songwol-dong_Fairy_Tale_Village.jpg/1920px-Songwol-dong_Fairy_Tale_Village.jpg',
    credit: {
      author: 'Helenakfronczak',
      license: 'CC BY-SA 4.0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Songwol-dong_Fairy_Tale_Village.jpg',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    },
  },
  'sorae-ecological-park': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/25/Sunrise_In_The_Park_%28192216089%29.jpeg/1920px-Sunrise_In_The_Park_%28192216089%29.jpeg',
    credit: {
      author: 'Mathew Schwartz',
      license: 'CC BY 3.0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Sunrise_In_The_Park_(192216089).jpeg',
      licenseUrl: 'https://creativecommons.org/licenses/by/3.0',
    },
  },
  'starfield-coex-mall': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/68/COEX_Mall_Megabox_Cinema_Lobby_2016.jpg/1920px-COEX_Mall_Megabox_Cinema_Lobby_2016.jpg',
    credit: {
      author: 'Wpcpey',
      license: 'CC BY-SA 4.0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:COEX_Mall_Megabox_Cinema_Lobby_2016.jpg',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    },
  },
  'taejongdae-park': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/4/47/Korea-Busan-Taejongdae-03.jpg',
    credit: {
      author: '*intacto',
      license: 'CC BY 2.0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Korea-Busan-Taejongdae-03.jpg',
      licenseUrl: 'https://creativecommons.org/licenses/by/2.0',
    },
  },
  'tosokchon-samgyetang': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7d/Malbok_Tosokchon_Samgyetang_03.jpg/1920px-Malbok_Tosokchon_Samgyetang_03.jpg',
    credit: {
      author: 'Korea.net / Korean Culture and Information Service (Jeon Han)',
      license: 'CC BY-SA 2.0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Malbok_Tosokchon_Samgyetang_03.jpg',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/2.0',
    },
  },
  'udo-island': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/4/49/Udo_by_jeon.jpg',
    credit: {
      author: 'Libjbr',
      license: 'CC BY-SA 3.0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Udo_by_jeon.jpg',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0',
    },
  },
  'waveon-coffee': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9b/Waveon_Coffee_in_Gijang%2C_Busan.jpg/1920px-Waveon_Coffee_in_Gijang%2C_Busan.jpg',
    credit: {
      author: 'Choi2451',
      license: 'CC BY-SA 3.0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Waveon_Coffee_in_Gijang,_Busan.jpg',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0',
    },
  },
  'woljeong-ri-cafes': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/40/Jeju_cafe_overlooking_woljeongri_beach_jeju.jpg/1920px-Jeju_cafe_overlooking_woljeongri_beach_jeju.jpg',
    credit: {
      author: 'Sgroey',
      license: 'CC BY-SA 4.0',
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:Jeju_cafe_overlooking_woljeongri_beach_jeju.jpg',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    },
  },
  'wolmi-park': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a1/Wolmi_Park_Traditional_Garden_Section.jpg/1920px-Wolmi_Park_Traditional_Garden_Section.jpg',
    credit: {
      author: 'User:G43',
      license: 'CC BY-SA 3.0',
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:Wolmi_Park_Traditional_Garden_Section.jpg',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0',
    },
  },
  'wolmi-sea-train': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/30/Wolmi_Eunha_Rail_Incheon_Eunha_Station.jpg/1920px-Wolmi_Eunha_Rail_Incheon_Eunha_Station.jpg',
    credit: {
      author: 'Himuka tachibana',
      license: 'CC BY-SA 3.0',
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:Wolmi_Eunha_Rail_Incheon_Eunha_Station.jpg',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0',
    },
  },
  'wolmido-culture-street': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/%EC%9B%94%EB%AF%B8%EB%AC%B8%ED%99%94%EC%9D%98%EA%B1%B0%EB%A6%AC_%EB%B6%84%EC%88%98%EB%8C%80.jpg',
    credit: {
      author: '인천 중구청',
      license: 'KOGL Type 1',
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:%EC%9B%94%EB%AF%B8%EB%AC%B8%ED%99%94%EC%9D%98%EA%B1%B0%EB%A6%AC_%EB%B6%84%EC%88%98%EB%8C%80.jpg',
      licenseUrl: 'http://www.kogl.or.kr/info/licenseType1.do',
    },
  },
  'yeouido-hangang-park': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3a/Yeouido_Hangang_Park_from_Mapo_Bridge_1.jpg/1920px-Yeouido_Hangang_Park_from_Mapo_Bridge_1.jpg',
    credit: {
      author: 'kallerna',
      license: 'CC BY-SA 4.0',
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:Yeouido_Hangang_Park_from_Mapo_Bridge_1.jpg',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    },
  },
};
