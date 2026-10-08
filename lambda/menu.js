// Menu della mensa a ciclo di 4 settimane, da lunedì a venerdì.
// Ancora: la settimana che inizia lunedì 05/10/2026 è la Settimana II.

const MENU = [
  // Settimana I
  [
    { primo: 'Pasta con crema di lenticchie', secondo: null, contorno: 'Bis di verdure lessate (carote, fagiolini)' },
    { primo: 'Pasta alle melanzane', secondo: 'Robiola', contorno: 'Erbette lessate' },
    { primo: 'Risotto alle zucchine', secondo: 'Ceci al pomodoro', contorno: 'Pomodori in insalata' },
    { primo: 'Pasta al pesto genovese', secondo: 'Petto di pollo al limone', contorno: "Fagiolini all'olio" },
    { primo: 'Orzo risottato al pomodoro', secondo: 'Filetto di platessa gratinato', contorno: "Zucchine all'olio" },
  ],
  // Settimana II
  [
    { primo: 'Pasta al ragù di manzo', secondo: null, contorno: 'Bis di verdure lessate (carote, zucchine)' },
    { primo: 'Risotto giallo', secondo: 'Filetto di nasello gratinato alla mediterranea', contorno: "Biete all'olio" },
    { primo: 'Pasta pomodoro e basilico', secondo: 'Piselli brasati', contorno: "Carote all'olio" },
    { primo: 'Pasta al pesto genovese', secondo: 'Crescenza', contorno: "Fagiolini all'olio" },
    { primo: 'Farro alla pizzaiola', secondo: 'Filetto di merluzzo gratinato al forno', contorno: 'Spinaci lessati' },
  ],
  // Settimana III
  [
    { primo: 'Pizza margherita', secondo: null, contorno: 'Bis di verdure lessate (carote, fagiolini)' },
    { primo: 'Pasta zucchine e zafferano', secondo: 'Fagioli in umido agli aromi', contorno: 'Pomodori in insalata' },
    { primo: 'Riso al pomodoro e basilico', secondo: 'Fesa di tacchino al forno', contorno: "Fagiolini all'olio" },
    { primo: 'Pasta con crema di carote e porri', secondo: 'Frittata', contorno: "Zucchine all'olio" },
    { primo: 'Orzotto alle zucchine', secondo: 'Filetto di platessa gratinato con basilico e pomodorini', contorno: "Carote all'olio" },
  ],
  // Settimana IV
  [
    { primo: 'Risi e bisi', secondo: null, contorno: 'Bis di verdure lessate (carote, zucchine)' },
    { primo: 'Pasta con crema di fagiolini', secondo: 'Petto di pollo agli aromi', contorno: "Carote all'olio" },
    { primo: 'Pasta bio integrale al pomodoro e basilico', secondo: 'Ricotta', contorno: 'Spinaci lessati' },
    { primo: 'Pasta al pesto genovese', secondo: 'Frittata', contorno: "Fagiolini all'olio" },
    { primo: 'Farro al pomodoro', secondo: 'Filetto di merluzzo gratinato al rosmarino', contorno: "Zucchine all'olio" },
  ],
];

const ANCHOR_MONDAY_UTC = Date.UTC(2026, 9, 5); // lunedì 05/10/2026
const ANCHOR_WEEK = 1; // indice 0-based: Settimana II
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const SETTIMANE = ['uno', 'due', 'tre', 'quattro'];
const GIORNI = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];

// Data di calendario a Roma (il backend Alexa-hosted gira in UTC).
function romeDate(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Rome', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(now);
  const get = (type) => Number(parts.find((p) => p.type === type).value);
  return Date.UTC(get('year'), get('month') - 1, get('day'));
}

// Ora del giorno a Roma (0-23).
function romeHour(now = new Date()) {
  return Number(new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Rome', hour: '2-digit', hourCycle: 'h23',
  }).format(now));
}

function menuOf(dayUtc) {
  const weekday = new Date(dayUtc).getUTCDay(); // 0 = domenica
  if (weekday === 0 || weekday === 6) return { weekday, menu: null };
  const mondayUtc = dayUtc - (weekday - 1) * 24 * 60 * 60 * 1000;
  const weeksFromAnchor = Math.round((mondayUtc - ANCHOR_MONDAY_UTC) / WEEK_MS);
  const week = (((ANCHOR_WEEK + weeksFromAnchor) % 4) + 4) % 4;
  return { weekday, week, menu: MENU[week][weekday - 1] };
}

function dishes(menu) {
  const parts = [`Primo piatto: ${menu.primo}`];
  if (menu.secondo) parts.push(`Secondo piatto: ${menu.secondo}`);
  parts.push(`Contorno: ${menu.contorno}`);
  return parts.join(' - ');
}

// Oggi, più domani da lunedì a giovedì (il venerdì non anticipa il lunedì).
function speechFor(now = new Date()) {
  const today = romeDate(now);
  const { weekday, week, menu } = menuOf(today);
  if (!menu) return `Oggi è ${GIORNI[weekday]}, non c'è scuola.`;
  // Prima di mezzogiorno il pranzo deve ancora arrivare.
  const verb = romeHour(now) < 12 ? 'Figlio oggi a scuola mangerà' : 'oggi Figlio ha mangiato';
  let speech = `Oggi è ${GIORNI[weekday]} della settimana ${SETTIMANE[week]} e ${verb}: ${dishes(menu)}.`;
  if (weekday < 5) {
    const tomorrow = menuOf(today + 24 * 60 * 60 * 1000);
    speech += ` Domani, ${GIORNI[tomorrow.weekday]}, mangerà: ${dishes(tomorrow.menu)}.`;
  }
  return speech;
}

module.exports = { MENU, romeDate, romeHour, menuOf, speechFor };
