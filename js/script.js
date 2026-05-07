// ============================================
// SCRIPT.JS — Das Gehirn unserer Webseite
// ============================================


// ============================================
// SCHRITT 1: HTML-Elemente finden
// ============================================
// document.querySelector() durchsucht das HTML und gibt uns das Element zurück.
// '#id' = sucht nach einer ID, '.klasse' = sucht nach einer Klasse

const jahrInput = document.querySelector('#jahr-input');
const suchenButton = document.querySelector('#suchen-button');
const zahlGesamt = document.querySelector('#zahl-gesamt');
const zahlMaenner = document.querySelector('#zahl-maenner');
const zahlFrauen = document.querySelector('#zahl-frauen');
const zahlArbeitslos = document.querySelector('#zahl-arbeitslos');
const zahlArbeitslose = document.querySelector('#zahl-arbeitslose-absolut');


// ============================================
// SCHRITT 2: Funktionen definieren
// ============================================

// Funktion: Suizid-Daten von der API laden
// async function = asynchrone Funktion (wartet auf Antwort vom Server)
// try/catch = versuche etwas, und fange Fehler ab falls es nicht klappt
async function datenLaden() {
    const url = 'https://suizid.mezaciru.myhostpoint.ch/api/';
    try {
        const response = await fetch(url);
        return await response.json();
    } catch (error) {
        console.error(error);
        return false;
    }
}

// Funktion: Arbeitslosenquote von der World Bank API laden
// Der Parameter "jahr" wird in die URL eingesetzt
async function worldBankLaden(jahr) {
    const url = 'https://api.worldbank.org/v2/country/CHE/indicator/SL.UEM.TOTL.ZS?format=json&date=' + jahr;
    try {
        const response = await fetch(url);
        return await response.json();
    } catch (error) {
        console.error(error);
        return false;
    }
}

// Funktion: Erwerbsbevölkerung von der World Bank API laden
// Damit berechnen wir die absolute Anzahl Arbeitslose
async function erwerbsbevoelkerungLaden(jahr) {
    const url = 'https://api.worldbank.org/v2/country/CHE/indicator/SL.TLF.TOTL.IN?format=json&date=' + jahr;
    try {
        const response = await fetch(url);
        return await response.json();
    } catch (error) {
        console.error(error);
        return false;
    }
}


// ============================================
// SCHRITT 3: Events (auf Interaktion reagieren)
// ============================================

// Enter-Taste im Eingabefeld löst den Button-Klick aus
jahrInput.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        suchenButton.click();
    }
});

// Klick auf den "Daten laden"-Button
// async function = weil wir darin await brauchen (für die API-Aufrufe)
suchenButton.addEventListener('click', async function () {

    // Wert aus dem Eingabefeld holen
    const jahr = jahrInput.value;

    // Prüfen ob etwas eingegeben wurde
    if (jahr === '') {
        alert('Bitte gib ein Jahr ein (1991–2024)');
        return;
    }

// Prüfen ob das Jahr im gültigen Bereich liegt
    if (jahr < 1991 || jahr > 2024) {
        alert('Bitte gib ein Jahr zwischen 1991 und 2024 ein.');
        return;
    }

    // --- SUIZID-API ---

    // Daten von der API laden
    const daten = await datenLaden();

    // Das richtige Jahr aus den Daten suchen
    // .find() durchsucht ein Array und gibt den ersten Treffer zurück
    const gesamt = daten.daten.gesamt.find(function (eintrag) {
        return eintrag.jahr == jahr;
    });
    const maenner = daten.daten.maenner.find(function (eintrag) {
        return eintrag.jahr == jahr;
    });
    const frauen = daten.daten.frauen.find(function (eintrag) {
        return eintrag.jahr == jahr;
    });

    // Prüfen ob das Jahr in den Daten existiert
    if (gesamt === undefined) {
        alert('Keine Daten für das Jahr ' + jahr + ' vorhanden.');
        return;
    }

    // Zahlen in die Karten schreiben
    // .textContent ersetzt den Text eines HTML-Elements
    zahlGesamt.textContent = gesamt.anzahl;
    zahlMaenner.textContent = maenner.anzahl;
    zahlFrauen.textContent = frauen.anzahl;

    // --- WORLD BANK API ---

    // Arbeitslosenquote laden
    const wbDaten = await worldBankLaden(jahr);

    // Wert auslesen und in die Karte schreiben
    // wbDaten[1] = Array mit Daten, [0] = erster Eintrag, .value = der Wert
    if (wbDaten && wbDaten[1]) {
        const arbeitslosenquote = wbDaten[1][0].value;
        zahlArbeitslos.textContent = arbeitslosenquote + '%';
    }

    // Absolute Anzahl Arbeitslose laden
   const erwerbsData = await erwerbsbevoelkerungLaden(jahr);
    if (erwerbsData && erwerbsData[1] && wbDaten && wbDaten[1]) {
        const erwerbsbevoelkerung = erwerbsData[1][0].value;
        const quote = wbDaten[1][0].value;
        const anzahlArbeitslose = Math.round(erwerbsbevoelkerung * quote / 100);
        zahlArbeitslose.textContent = anzahlArbeitslose.toLocaleString('de-CH');
    }
});