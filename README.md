# Menu Mensa — skill Alexa

Skill Alexa privata in italiano che risponde alla domanda "cos'ha mangiato oggi Figlio a scuola?"
con il menu della mensa del giorno, per esempio:

> Oggi è mercoledì della settimana due e Figlio ha mangiato: Primo piatto: Pasta pomodoro e
> basilico - Secondo piatto: Piselli brasati - Contorno: Carote all'olio. Domani, giovedì,
> mangerà: Primo piatto: Pasta al pesto genovese - Secondo piatto: Crescenza - Contorno: Fagiolini all'olio.

- Da lunedì a giovedì dice anche il menu di domani; il venerdì no (non anticipa il lunedì).

- Menu a ciclo di **4 settimane**, da lunedì a venerdì. Sabato e domenica: "Oggi è sabato, non c'è scuola."
- La settimana corrente si calcola da una data di riferimento (ancora): ogni lunedì si passa alla
  settimana successiva, dopo la quarta si torna alla prima. Le vacanze non interrompono il ciclo.
- Data calcolata sul fuso `Europe/Rome` (il backend Alexa-hosted gira in UTC).
- Backend **Alexa-hosted** (gratuito, nessun server da gestire). La skill resta in modalità
  sviluppo: non va pubblicata e funziona su tutti gli Echo collegati allo stesso account Amazon.

## Struttura

| File | Contenuto |
|---|---|
| `lambda/menu.js` | Menu delle 4 settimane, calcolo della settimana, testo della risposta |
| `lambda/index.js` | Handler Alexa (apertura, domanda, aiuto, stop, fallback) |
| `lambda/package.json` | Dipendenze (`ask-sdk-core`) |
| `lambda/test.js` | Test del calcolo delle settimane (`node test.js`) |
| `skill-package/interactionModels/custom/it-IT.json` | Modello di interazione: nome di invocazione e frasi |
| `skill-package/skill.json` | Manifest della skill |

## 1. Personalizza prima di installare

Tutto si cambia in due file.

**`lambda/menu.js`**

1. `MENU`: 4 blocchi (Settimana I…IV), ognuno con 5 righe (lunedì…venerdì). Ogni riga ha
   `primo`, `secondo`, `contorno`. Se un giorno non ha il secondo, scrivi `secondo: null`: la
   risposta lo salta.
2. `ANCHOR_MONDAY_UTC`: il **lunedì** di una settimana di cui conosci il numero.
   Attenzione: in `Date.UTC(anno, mese, giorno)` il mese parte da 0 (gennaio = 0, ottobre = 9).
3. `ANCHOR_WEEK`: il numero di quella settimana, partendo da 0 (Settimana I = 0, II = 1, III = 2, IV = 3).

   Esempio: "mercoledì 07/10/2026 è in Settimana II" diventa
   `ANCHOR_MONDAY_UTC = Date.UTC(2026, 9, 5)` (lunedì 05/10) e `ANCHOR_WEEK = 1`.
4. Per cambiare il nome del bambino nella risposta, sostituisci `Figlio` nella funzione `speechFor`.

**`skill-package/interactionModels/custom/it-IT.json`**

- `invocationName`: il nome con cui chiami la skill (ora `menu mensa`). Regole Amazon: tutto
  minuscolo; un nome di **due** parole non può contenere articoli o preposizioni ("di", "a", "la"…).
  Un nome senza preposizioni (es. `menu mensa`) viene riconosciuto meglio.
- `samples`: le frasi che dici **dopo** il nome della skill. Se cambi il nome del bambino,
  cambialo anche qui.

Verifica il calcolo (serve Node.js):

```sh
cd lambda && node test.js
```

Deve stampare la risposta di alcune date e alla fine `OK`. Se cambi l'ancora, aggiorna anche le
date attese in `test.js`.

## 2. Crea la skill su Amazon

1. Apri https://developer.amazon.com/alexa/console/ask ed entra con **lo stesso account Amazon
   degli Echo di casa** (se non hai un account sviluppatore, la registrazione è gratuita).
2. Clicca **Create Skill**.
3. Nome: `Menu Mensa`. Lingua principale: **Italian (IT)**.
4. Tipo di esperienza: **Other**. Modello: **Custom**. Backend: **Alexa-hosted (Node.js)**.
5. Template: **Start from Scratch**. Conferma con **Create Skill** e aspetta un paio di minuti.

## 3. Carica il modello di interazione

1. Nella scheda **Build**, apri **Interaction Model → JSON Editor**.
2. Seleziona tutto il testo (Ctrl+A), cancellalo e incolla l'intero contenuto di
   `skill-package/interactionModels/custom/it-IT.json`.
3. Clicca **Save**, poi **Build skill**. Aspetta circa un minuto il messaggio **Build Successful**.
4. Controlla in **Invocations → Skill Invocation Name** che il nome sia quello giusto
   (`menu mensa`).

## 4. Carica il codice

1. Apri la scheda **Code**.
2. Apri `lambda/index.js`, seleziona tutto, cancella e incolla il contenuto di `lambda/index.js`
   di questo repository.
3. Crea il file del menu: icona **Create File** in alto a sinistra, percorso `lambda/menu.js`.
   Incolla il contenuto di `lambda/menu.js` di questo repository.
4. `lambda/package.json` lascialo com'è: il template contiene già `ask-sdk-core`.
   Anche `util.js` e `local-debugger.js` possono restare.
5. Clicca **Save**, poi **Deploy**. Aspetta **Deployment successful**.

## 5. Attiva e prova

1. Apri la scheda **Test**.
2. In alto, **Skill testing is enabled in**: scegli **Development**. Deve restare così: finché è su
   Development la skill è attiva sul tuo account, senza scadenza.
3. Nel simulatore scrivi (senza "Alexa"): `apri menu mensa` oppure
   `chiedi a menu mensa cosa ha mangiato oggi`.
4. Deve rispondere con il menu di oggi. Nel pannello **JSON Input** compare la richiesta.

Da questo momento funziona su tutti gli Echo dell'account:

- "Alexa, apri menu mensa"
- "Alexa, chiedi a menu mensa cos'ha mangiato oggi"

## 6. Frase corta senza nome della skill (routine)

Alexa non avvia una skill privata senza il suo nome. Per dire solo "Alexa, cos'ha mangiato oggi
Figlio" serve una routine nell'app Alexa sul telefono:

1. **Altro → Routine → +**.
2. Nome: `Mensa`.
3. **Quando succede questo → Voce**: scrivi `cos'ha mangiato oggi figlio` (senza "Alexa").
4. **Aggiungi azione → Personalizzata**: scrivi `chiedi a menu mensa cos'ha mangiato oggi`.
5. Se chiede da quale dispositivo rispondere: **Il dispositivo con cui parli**.
6. **Salva**.

La routine scatta solo con la frase **esatta**. "cos'ha" e "cosa ha" sono frasi diverse: aggiungi
una frase vocale (o una routine con la stessa azione) per ogni variante che usi, per esempio:

- `cosa ha mangiato oggi figlio`
- `che cosa ha mangiato oggi figlio`
- `che cosa c'era di menu oggi a scuola`
- `cosa c'era oggi in mensa`

Il simulatore della console può non eseguire le routine: provale su un Echo o con il microfono
dell'app Alexa.

## Aggiornare il menu in futuro

1. Modifica `lambda/menu.js` (menu o ancora) e verifica con `node test.js`.
2. In console, scheda **Code**: incolla il nuovo `lambda/menu.js`, **Save**, **Deploy**.
   Non serve rifare la Build: il modello di interazione non cambia.

Se invece cambi `it-IT.json` (nome o frasi), rifai il punto 3 (Save + Build skill).

## Problemi frequenti

| Sintomo | Causa | Soluzione |
|---|---|---|
| "Purtroppo non so come aiutarti" e **JSON Input vuoto** | Alexa non ha riconosciuto il nome: la skill non è stata chiamata | Controlla il nome in Invocations, rifai **Build skill**, ricarica la pagina (F5), prova `apri menu mensa` |
| Funziona con "cos'ha…" ma non con "cosa ha…" | La routine accetta solo la frase esatta | Aggiungi la variante alla routine |
| Nome di invocazione con "di" non riconosciuto | Le preposizioni rendono il nome meno affidabile | Usa un nome senza preposizioni, es. `menu mensa` |
| Menu della settimana sbagliata | Ancora errata, o la scuola ha riallineato il ciclo dopo le vacanze | Correggi `ANCHOR_MONDAY_UTC` / `ANCHOR_WEEK` in `menu.js` e rifai il Deploy |
| "Si è verificato un problema con la risposta della skill" | Errore nel codice incollato | Scheda **Code → CloudWatch Logs** per l'errore; reincolla i file interi |

---

Made with love ❤️ - [DLLFPP](https://buymeacoffee.com/dllfpp)
