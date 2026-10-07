const assert = require('node:assert');
const { menuOf, speechFor } = require('./menu');

const d = (y, m, g) => Date.UTC(y, m - 1, g);
const cases = [
  [d(2026, 10, 7), 1, 'Pasta pomodoro e basilico'], // mer, Sett. II (ancora)
  [d(2026, 10, 5), 1, 'Pasta al ragù di manzo'],   // lun, Sett. II
  [d(2026, 10, 12), 2, 'Pizza margherita'],        // lun, Sett. III
  [d(2026, 10, 19), 3, 'Risi e bisi'],             // lun, Sett. IV
  [d(2026, 10, 26), 0, 'Pasta con crema di lenticchie'], // lun, Sett. I
  [d(2026, 9, 28), 0, 'Pasta con crema di lenticchie'],  // lun prima dell'ancora, Sett. I
  [d(2026, 11, 2), 1, 'Pasta al ragù di manzo'],   // lun, di nuovo Sett. II
  [d(2027, 3, 29), 2, 'Pizza margherita'],         // lun 29/03/2027 (+25 sett.), dopo il cambio ora legale
];
for (const [day, week, primo] of cases) {
  const r = menuOf(day);
  if (week !== null) {
    assert.strictEqual(r.week, week, new Date(day).toISOString());
    assert.ok(r.menu.primo.startsWith(primo));
  }
}
assert.strictEqual(menuOf(d(2026, 10, 7)).menu.primo, 'Pasta pomodoro e basilico');
assert.strictEqual(menuOf(d(2026, 10, 10)).menu, null); // sabato
assert.strictEqual(menuOf(d(2026, 10, 11)).menu, null); // domenica

// 23:30 UTC del 06/10 è già mercoledì 07/10 a Roma.
console.log(speechFor(new Date('2026-10-06T23:30:00Z')));
console.log(speechFor(new Date('2026-10-12T10:00:00Z')));
console.log(speechFor(new Date('2026-10-10T10:00:00Z')));
console.log('OK');
