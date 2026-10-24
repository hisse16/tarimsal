export const PLANT_LIBRARY: { [category: string]: string[] } = {
  "Sebzeler": [
    "Domates", "Biber", "Patlıcan", "Salatalık", "Kabak", "Taze Fasulye", "Bezelye", "Barbunya",
    "Ispanak", "Marul", "Maydanoz", "Roka", "Tere", "Dereotu", "Nane", "Pazı", "Lahana",
    "Brokoli", "Karnabahar", "Pırasa", "Kereviz", "Enginar", "Kuşkonmaz", "Bamya", "Pancar",
    "Havuç", "Turp", "Şalgam", "Soğan", "Sarımsak", "Patates", "Yer Elması"
  ],
  "Meyveler & Bağ": [
    "Elma", "Armut", "Ayva", "Ceviz", "Badem", "Fındık", "Antep Fıstığı", "Kestane",
    "Kiraz", "Vişne", "Kayısı", "Şeftali", "Erik", "Zeytin", "İncir", "Nar", "Nektarin",
    "Portakal", "Mandalina", "Limon", "Greyfurt", "Muz", "Üzüm (Bağ)", "Çilek", "Böğürtlen",
    "Ahududu", "Yaban Mersini", "Kivi", "Avokado", "Trabzon Hurması", "Hünnap"
  ],
  "Tahıllar & Baklagiller": [
    "Buğday", "Arpa", "Yulaf", "Çavdar", "Mısır", "Çeltik (Pirinç)", "Kuru Fasulye",
    "Mercimek", "Nohut", "Burçak", "Soya Fasulyesi", "Bakla"
  ],
  "Endüstri & Yağ Bitkileri": [
    "Ayçiçeği", "Pamuk", "Tütün", "Şeker Pancarı", "Kanola", "Aspir", "Keten", "Kenevir",
    "Susam", "Yer Fıstığı"
  ],
  "Tıbbi Aromatik & Yem": [
    "Lavanta", "Kekik", "Adaçayı", "Biberiye", "Papatya", "Safran", "Kimyon", "Anason",
    "Yonca", "Fiğ", "Korunga", "Silajlık Mısır", "Yem Şalgamı", "Gül (Yağlık)", "Çay"
  ]
};

export const ALL_PLANTS: string[] = Object.values(PLANT_LIBRARY).flat().sort();

export function getCropCategory(plantName: string): string {
  for (const [cat, plants] of Object.entries(PLANT_LIBRARY)) {
    if (plants.includes(plantName)) {
      return cat;
    }
  }
  return "Sebzeler";
}

export function calculatePlantStage(plantName: string, sowingDateStr: string): string {
  const sowingDate = new Date(sowingDateStr);
  const today = new Date();
  const timeDiff = today.getTime() - sowingDate.getTime();
  const daysPassed = Math.floor(timeDiff / (1000 * 3600 * 24));

  if (daysPassed < 0) {
    return "Planlama Aşamasında";
  }

  const category = getCropCategory(plantName);

  if (category === "Meyveler & Bağ") {
    if (daysPassed < 180) return "Yeni Dikim / Adaptasyon";
    if (daysPassed < 730) return "Gençlik / Vejetatif Gelişim";
    return "Olgunluk / Verim Dönemi";
  } else if (category === "Tahıllar & Baklagiller" || category === "Endüstri & Yağ Bitkileri") {
    if (daysPassed < 15) return "Çimlenme & Çıkış";
    if (daysPassed < 60) return "Kardeşlenme & Sapa Kalkma";
    if (daysPassed < 90) return "Başaklanma & Çiçeklenme";
    return "Tane Doldum / Hasat Dönemi";
  } else {
    // Sebzeler and Tıbbi Aromatik
    if (daysPassed < 10) return "Çimlenme / İlk Köklenme";
    if (daysPassed < 45) return "Erken Vejetatif Gelişim";
    if (daysPassed < 75) return "Çiçeklenme & Meyve Bağlama";
    return "Olgunluk / Hasat Dönemi";
  }
}

export function getMlStageLabel(rawStage: string): 'Yeni Ekilmiş' | 'Gelişim' | 'Çiçeklenme' | 'Meyve/Hasat' {
  const mapping: { [key: string]: 'Yeni Ekilmiş' | 'Gelişim' | 'Çiçeklenme' | 'Meyve/Hasat' } = {
    "Çimlenme / İlk Köklenme": "Yeni Ekilmiş",
    "Erken Vejetatif Gelişim": "Gelişim",
    "Çiçeklenme & Meyve Bağlama": "Çiçeklenme",
    "Olgunluk / Hasat Dönemi": "Meyve/Hasat",
    "Yeni Dikim / Adaptasyon": "Yeni Ekilmiş",
    "Gençlik / Vejetatif Gelişim": "Gelişim",
    "Olgunluk / Verim Dönemi": "Meyve/Hasat",
    "Çimlenme & Çıkış": "Yeni Ekilmiş",
    "Kardeşlenme & Sapa Kalkma": "Gelişim",
    "Başaklanma & Çiçeklenme": "Çiçeklenme",
    "Tane Doldum / Hasat Dönemi": "Meyve/Hasat",
    "Planlama Aşamasında": "Yeni Ekilmiş"
  };
  return mapping[rawStage] || "Gelişim";
}

const KC_TABLE: { [cat: string]: { [stage: string]: number } } = {
  "Sebzeler": {
    "Yeni Ekilmiş": 0.45,
    "Gelişim": 0.75,
    "Çiçeklenme": 1.10,
    "Meyve/Hasat": 0.85,
  },
  "Meyveler & Bağ": {
    "Yeni Ekilmiş": 0.40,
    "Gelişim": 0.65,
    "Çiçeklenme": 0.90,
    "Meyve/Hasat": 0.75,
  },
  "Tahıllar & Baklagiller": {
    "Yeni Ekilmiş": 0.35,
    "Gelişim": 0.70,
    "Çiçeklenme": 1.15,
    "Meyve/Hasat": 0.50,
  },
  "Endüstri & Yağ Bitkileri": {
    "Yeni Ekilmiş": 0.35,
    "Gelişim": 0.75,
    "Çiçeklenme": 1.10,
    "Meyve/Hasat": 0.55,
  },
  "Tıbbi Aromatik & Yem": {
    "Yeni Ekilmiş": 0.40,
    "Gelişim": 0.70,
    "Çiçeklenme": 0.95,
    "Meyve/Hasat": 0.70,
  }
};

export function getKc(plantName: string, mlStage: string): number {
  const cat = getCropCategory(plantName);
  const catTable = KC_TABLE[cat] || KC_TABLE["Sebzeler"];
  return catTable[mlStage] || 0.60;
}

export function getPlantMlInt(plantName: string): number {
  const cat = getCropCategory(plantName);
  const mapping: { [key: string]: number } = {
    "Sebzeler": 0,
    "Tıbbi Aromatik & Yem": 0,
    "Meyveler & Bağ": 1,
    "Tahıllar & Baklagiller": 2,
    "Endüstri & Yağ Bitkileri": 3,
  };
  return mapping[cat] ?? 0;
}

export function getSoilMlInt(soilType: string): number {
  return soilType === "Kumlu" ? 0 : soilType === "Killi" ? 2 : 1;
}

export function getStageMlInt(mlStage: string): number {
  const stages = ["Yeni Ekilmiş", "Gelişim", "Çiçeklenme", "Meyve/Hasat"];
  const idx = stages.indexOf(mlStage);
  return idx === -1 ? 1 : idx;
}

export interface IrrigationPredictionResult {
  waterAmount: number;
  timeOfDay: string;
  report: string;
}

export function predictIrrigation(params: {
  temp: number;
  humidity: number;
  daysAgo: number;
  soilType: string;
  plantName: string;
  mlStage: string;
  pastRain: number[];
  futureRain: number;
}): IrrigationPredictionResult {
  const { temp, humidity, daysAgo, soilType, plantName, mlStage, pastRain, futureRain } = params;

  const kc = getKc(plantName, mlStage);
  const et0 = Math.max(1.5, (temp * 0.2) - (humidity * 0.02));
  const sumPastRain = pastRain.slice(0, 3).reduce((a, b) => a + b, 0);

  const etc = et0 * kc;
  let targetWater = (etc * 5) + (daysAgo * 4) - (sumPastRain * 0.8) - (futureRain * 1.2) + (temp * 0.5);
  targetWater = Math.max(0, Math.min(60, targetWater));
  const waterAmount = Math.round(targetWater * 10) / 10;

  let timeIdx = 2; // Default "akşam serinliğinde"
  if (futureRain > 15) {
    timeIdx = 4; // "sulamayı erteleyerek"
  } else if (temp > 32) {
    timeIdx = 0; // "sabah erken saatlerde"
  }

  const timeSlots: { [key: number]: string } = {
    0: "sabah erken saatlerde",
    1: "öğleden sonra",
    2: "akşam serinliğinde",
    3: "gece saatlerinde",
    4: "sulamayı erteleyerek"
  };
  const timeOfDay = timeSlots[timeIdx];

  const rainText = futureRain > 0
    ? `Önümüzdeki tahminlerde ~${futureRain.toFixed(1)}mm yağış beklendiği ve ET0 = ${et0.toFixed(1)} mm/gün olduğu için; `
    : `Önümüzdeki günlerde kayda değer yağış beklenmediği ve ET0 = ${et0.toFixed(1)} mm/gün olduğu için; `;

  const report = `Yapay Zeka Saha Raporu: ${plantName} ürününüz '${mlStage}' evresinde, ${soilType} toprakta, Kc = ${kc.toFixed(2)} ile değerlendirildi. Son 3 günlük yağış yükü ${sumPastRain.toFixed(1)} mm and ${daysAgo} gündür sulama yapılmadı. ${rainText}Sulamayı ${timeOfDay === "sulamayı erteleyerek" ? "yapmamanızı ve ertelemenizi" : `**${timeOfDay}** yapmanizi`} ve **m² başına ${waterAmount} litre su** vermenizi öneririz.`;

  return {
    waterAmount,
    timeOfDay,
    report
  };
}

export const KOTU_SOZLER = [
  "orospu", "orospunun", "orospular", "piç", "piçi", "piçler", "ibne", "ibneler", "puşt", "puştlar",
  "gavat", "kavat", "pezevenk", "pezo", "kahpe", "kahpeler", "göt", "götlek", "götveren", "götü",
  "amcık", "amcıklama", "amcıksın", "yarrak", "yarak", "daşşak", "taşşak", "tassak", "amına", "amını",
  "amk", "aq", "amg", "mq", "mk", "sik", "siki", "sikik", "sikiş", "sikişmek", "siktir", "siktirgit",
  "sokuk", "sokarim", "sokarım", "sokayım", "sokayim", "sikem", "sikeyim", "sikeyim",
  "göte", "götünden", "bok", "boktan", "boku", "boklu", "orostopol", "meme", "memeucu", "kaltak",
  "sürtük", "godoş", "orospu çocuğu", "orospu cocugu", "orospu evladı", "amık", "göt kafalı", "pust",
  "lan", "ulan", "len", "it", "itler", "köpek", "it soyu", "it dölü", "döl", "şerefsiz", "şerefsizler",
  "haysiyetsiz", "namussuz", "soysuz", "kansız", "alçak", "adi", "adiler", "leş", "leşler", "gerzek",
  "geri zekalı", "gerizekalı", "aptal", "aptallar", "salak", "salaklar", "salakça", "dangalak",
  "budala", "ahmak", "sersem", "embesil", "hödük", "öküz", "odun", "sığır", "eşek", "eşşek",
  "uyuz", "manyak", "ezik", "kek", "keko", "apaçi", "lavuk", "zibidi", "gıcık", "çakal",
  "ukala", "şımarık", "densiz", "edepsiz", "terbiyesiz", "saygısız", "pislik", "rezil", "rüsva",
  "yalancı", "hain", "korkak", "beceriksiz", "çürük", "mal", "mallar", "malkafa", "andaval",
  "keriz", "enayi", "salak", "zoppa", "moron", "yavşak", "yavsak", "gevşek", "gevsek", "çomar",
  "beleşçi", "götelek"
];

export function censorText(text: string): string {
  if (!text) return "";
  let censored = text;

  for (const word of KOTU_SOZLER) {
    const escapedWord = word.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const charPatterns = Array.from(escapedWord).map(char => {
      const lower = char.toLowerCase();
      if (lower === 'c' || lower === 'ç') return '[cçÇC]';
      if (lower === 's' || lower === 'ş') return '[sşŞS]';
      if (lower === 'i' || lower === 'ı') return '[iıİI1!]';
      if (lower === 'g' || lower === 'ğ') return '[gğĞG]';
      if (lower === 'o' || lower === 'ö') return '[oöÖO0]';
      if (lower === 'u' || lower === 'ü') return '[uüÜU]';
      if (lower === 'a') return '[aA4@]';
      if (lower === 'e') return '[eE3]';
      return lower;
    });

    const regexPattern = charPatterns.join('[\\s._-]*');
    const boundaryPattern = word.length <= 3 
      ? `\\b${regexPattern}\\b` 
      : regexPattern;

    try {
      const regex = new RegExp(boundaryPattern, 'gi');
      censored = censored.replace(regex, (match) => '*'.repeat(match.length));
    } catch (e) {
      const simpleRegex = new RegExp(escapedWord, 'gi');
      censored = censored.replace(simpleRegex, (match) => '*'.repeat(match.length));
    }
  }

  return censored;
}
