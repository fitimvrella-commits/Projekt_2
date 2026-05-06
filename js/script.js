// ============================================
// SCRIPT.JS — Das Gehirn unserer Webseite
// ============================================
// Jede Zeile die mit // anfängt ist ein Kommentar.
// Der Browser ignoriert Kommentare komplett.
// Sie sind nur für UNS damit wir den Code verstehen.


// console.log() gibt Text in der Browser-Konsole aus.
// So testen wir ob Sachen funktionieren.
// Öffne die Konsole: Rechtsklick → Untersuchen → Tab "Console"
console.log('Script geladen!');


// ============================================
// SCHRITT 1: HTML-Elemente finden
// ============================================
// document.querySelector() durchsucht das HTML
// und gibt uns das Element zurück.
// '#jahr-input' heisst: finde das Element mit id="jahr-input"

const jahrInput = document.querySelector('#jahr-input');
const suchenButton = document.querySelector('#suchen-button');

// Auch die 3 Zahlen-Felder holen wir uns schon:
const zahlGesamt = document.querySelector('#zahl-gesamt');
const zahlMaenner = document.querySelector('#zahl-maenner');
const zahlFrauen = document.querySelector('#zahl-frauen');


// ============================================
// FUNKTION: Daten von der Suizid-API laden
// ============================================
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


// ============================================
// SCHRITT 2: Auf Button-Klick reagieren
// ============================================
// addEventListener('click', ...) = "Wenn jemand klickt, dann..."
// function() { } = der Code der beim Klick ausgeführt wird

suchenButton.addEventListener('click', async function () {

    // .value = was im Eingabefeld steht
    const jahr = jahrInput.value;

    // Prüfen: Hat der User überhaupt was eingegeben?
    if (jahr === '') {
        alert('Bitte gib ein Jahr ein (1970–2024)');
        return;  // return = sofort aufhören
    }

    // In der Konsole ausgeben was eingegeben wurde
    console.log('Gewähltes Jahr:', jahr);


// API aufrufen und Daten holen
    const daten = await datenLaden();
    console.log('Daten von API:', daten);
    // das richtige jahr aus den daten suchen
    //.find() = durchsucht ein array und gibt das erste Element zurück, das die Bedingung erfüllt
    const gesamt = daten.daten.gesamt.find(function (eintrag) {
        return eintrag.jahr == jahr;
    });
    const maenner = daten.daten.maenner.find(function (eintrag) {
        return eintrag.jahr == jahr;
    });
    const frauen = daten.daten.frauen.find(function (eintrag) {
        return eintrag.jahr == jahr;
    });

    // ergebnis in der Console Prüfen
    console.log('Gesamt:', gesamt);
    console.log('Männer:', maenner);
    console.log('Frauen:', frauen);

    // Zahlen in die Karten schreiben
    // .textContent ersetzt den Text eines HTML-Elements
    zahlGesamt.textContent = gesamt.anzahl;
    zahlMaenner.textContent = maenner.anzahl;
    zahlFrauen.textContent = frauen.anzahl;

});