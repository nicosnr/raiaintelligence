// Static reference data: Kenya's 47 counties (per the Constitution, First Schedule).
// Neutral civic info only — capital, region, code. No politicians named.

export type County = {
  code: number;
  name: string;
  capital: string;
  region: "Coast" | "North Eastern" | "Eastern" | "Central" | "Rift Valley" | "Western" | "Nyanza" | "Nairobi";
  facts: string[];
};

export const COUNTIES: County[] = [
  { code: 1, name: "Mombasa", capital: "Mombasa", region: "Coast", facts: ["Major sea port", "Smallest county by area"] },
  { code: 2, name: "Kwale", capital: "Kwale", region: "Coast", facts: ["Diani beach", "Titanium mining"] },
  { code: 3, name: "Kilifi", capital: "Kilifi", region: "Coast", facts: ["Coastal tourism", "Cashew & coconut"] },
  { code: 4, name: "Tana River", capital: "Hola", region: "Coast", facts: ["Tana River basin", "Pastoralist & farming mix"] },
  { code: 5, name: "Lamu", capital: "Lamu", region: "Coast", facts: ["UNESCO Old Town", "LAPSSET corridor port"] },
  { code: 6, name: "Taita-Taveta", capital: "Voi", region: "Coast", facts: ["Tsavo parks", "Mining & sisal"] },
  { code: 7, name: "Garissa", capital: "Garissa", region: "North Eastern", facts: ["Tana River crossing", "Livestock economy"] },
  { code: 8, name: "Wajir", capital: "Wajir", region: "North Eastern", facts: ["Arid lands", "Cross-border trade"] },
  { code: 9, name: "Mandera", capital: "Mandera", region: "North Eastern", facts: ["Tri-border with Ethiopia & Somalia"] },
  { code: 10, name: "Marsabit", capital: "Marsabit", region: "Eastern", facts: ["Largest by area in north", "Wind power (Lake Turkana)"] },
  { code: 11, name: "Isiolo", capital: "Isiolo", region: "Eastern", facts: ["LAPSSET node", "Gateway to the north"] },
  { code: 12, name: "Meru", capital: "Meru", region: "Eastern", facts: ["Miraa & tea", "Mt. Kenya foothills"] },
  { code: 13, name: "Tharaka-Nithi", capital: "Chuka", region: "Eastern", facts: ["Coffee, tea, dairy"] },
  { code: 14, name: "Embu", capital: "Embu", region: "Eastern", facts: ["Tea & coffee", "Seven Forks dams nearby"] },
  { code: 15, name: "Kitui", capital: "Kitui", region: "Eastern", facts: ["Coal reserves studied", "Charcoal & livestock"] },
  { code: 16, name: "Machakos", capital: "Machakos", region: "Eastern", facts: ["Konza Technopolis", "Industrial parks"] },
  { code: 17, name: "Makueni", capital: "Wote", region: "Eastern", facts: ["Mango value chain", "Sand harvesting"] },
  { code: 18, name: "Nyandarua", capital: "Ol Kalou", region: "Central", facts: ["Aberdare highlands", "Potatoes & dairy"] },
  { code: 19, name: "Nyeri", capital: "Nyeri", region: "Central", facts: ["Coffee & tea", "Mt. Kenya base"] },
  { code: 20, name: "Kirinyaga", capital: "Kerugoya", region: "Central", facts: ["Mwea rice scheme"] },
  { code: 21, name: "Murang'a", capital: "Murang'a", region: "Central", facts: ["Coffee, tea, avocados"] },
  { code: 22, name: "Kiambu", capital: "Kiambu", region: "Central", facts: ["Coffee & tea", "Nairobi metro"] },
  { code: 23, name: "Turkana", capital: "Lodwar", region: "Rift Valley", facts: ["Largest county by area", "Oil & geothermal potential"] },
  { code: 24, name: "West Pokot", capital: "Kapenguria", region: "Rift Valley", facts: ["Cherengani Hills"] },
  { code: 25, name: "Samburu", capital: "Maralal", region: "Rift Valley", facts: ["Wildlife conservancies"] },
  { code: 26, name: "Trans Nzoia", capital: "Kitale", region: "Rift Valley", facts: ["Maize breadbasket"] },
  { code: 27, name: "Uasin Gishu", capital: "Eldoret", region: "Rift Valley", facts: ["Athletics hub", "Maize & dairy"] },
  { code: 28, name: "Elgeyo-Marakwet", capital: "Iten", region: "Rift Valley", facts: ["Home of champions"] },
  { code: 29, name: "Nandi", capital: "Kapsabet", region: "Rift Valley", facts: ["Tea estates"] },
  { code: 30, name: "Baringo", capital: "Kabarnet", region: "Rift Valley", facts: ["Lake Baringo & Bogoria"] },
  { code: 31, name: "Laikipia", capital: "Rumuruti", region: "Rift Valley", facts: ["Conservancies & ranching"] },
  { code: 32, name: "Nakuru", capital: "Nakuru", region: "Rift Valley", facts: ["4th city status", "Lake Nakuru NP"] },
  { code: 33, name: "Narok", capital: "Narok", region: "Rift Valley", facts: ["Maasai Mara", "Wheat & tourism"] },
  { code: 34, name: "Kajiado", capital: "Kajiado", region: "Rift Valley", facts: ["Magadi soda", "Nairobi metro"] },
  { code: 35, name: "Kericho", capital: "Kericho", region: "Rift Valley", facts: ["Tea heartland"] },
  { code: 36, name: "Bomet", capital: "Bomet", region: "Rift Valley", facts: ["Tea & dairy"] },
  { code: 37, name: "Kakamega", capital: "Kakamega", region: "Western", facts: ["Kakamega rainforest", "Sugar belt"] },
  { code: 38, name: "Vihiga", capital: "Mbale", region: "Western", facts: ["Densely populated"] },
  { code: 39, name: "Bungoma", capital: "Bungoma", region: "Western", facts: ["Mt. Elgon foothills", "Sugar & maize"] },
  { code: 40, name: "Busia", capital: "Busia", region: "Western", facts: ["Uganda border", "Cross-border trade"] },
  { code: 41, name: "Siaya", capital: "Siaya", region: "Nyanza", facts: ["Lake Victoria shoreline"] },
  { code: 42, name: "Kisumu", capital: "Kisumu", region: "Nyanza", facts: ["3rd city", "Lake port"] },
  { code: 43, name: "Homa Bay", capital: "Homa Bay", region: "Nyanza", facts: ["Fishing economy", "Ruma NP"] },
  { code: 44, name: "Migori", capital: "Migori", region: "Nyanza", facts: ["Gold mining", "Tanzania border"] },
  { code: 45, name: "Kisii", capital: "Kisii", region: "Nyanza", facts: ["Soapstone", "Tea & bananas"] },
  { code: 46, name: "Nyamira", capital: "Nyamira", region: "Nyanza", facts: ["Tea & dairy"] },
  { code: 47, name: "Nairobi", capital: "Nairobi", region: "Nairobi", facts: ["Capital city", "Seat of national government"] },
];

export const REGIONS = ["Coast","North Eastern","Eastern","Central","Rift Valley","Western","Nyanza","Nairobi"] as const;
