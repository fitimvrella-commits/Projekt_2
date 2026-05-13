// ============================================
// ELEMENTE UND VARIABLEN
// ============================================
 
const jahrInput = document.querySelector('#jahr-input');
const suchenButton = document.querySelector('#suchen-button');
const statusText = document.querySelector('#status-text');
 
const startSlider = document.querySelector('#start-jahr');
const endSlider = document.querySelector('#end-jahr');
const rangeTrack = document.querySelector('#range-track');
const startLabel = document.querySelector('#start-label');
const endLabel = document.querySelector('#end-label');
const zeitraumLabel = document.querySelector('#zeitraum-label');
 
const zahlGesamt = document.querySelector('#zahl-gesamt');
const zahlMaenner = document.querySelector('#zahl-maenner');
const zahlFrauen = document.querySelector('#zahl-frauen');
const zahlArbeitslos = document.querySelector('#zahl-arbeitslos');
const zahlArbeitslose = document.querySelector('#zahl-arbeitslose-absolut');
 
const subGesamt = document.querySelector('#sub-gesamt');
const subMaenner = document.querySelector('#sub-maenner');
const subFrauen = document.querySelector('#sub-frauen');
const subArbeitslose = document.querySelector('#sub-arbeitslose');
 
const suizidChart = document.querySelector('#suizid-chart');
const arbeitslosChart = document.querySelector('#arbeitslos-chart');
const vergleichChart = document.querySelector('#vergleich-chart');
 
const filterAlle = document.querySelector('#filter-alle');
const filterMaenner = document.querySelector('#filter-maenner');
const filterFrauen = document.querySelector('#filter-frauen');
 
const minJahr = 1991;
const maxJahr = 2024;
 
let chartSuizid = null;
let chartArbeitslos = null;
let chartVergleich = null;
 
let suizidDatenGlobal = null;
let quoteAlleJahreGlobal = null;
let erwerbAlleJahreGlobal = null;
 
let aktuellesJahr = null;
let aktuellerFilter = 'alle';
let startJahr = 1991;
let endJahr = 2024;
 
 
// ============================================
// HILFSFUNKTIONEN
// ============================================
 
// Statusmeldung unter dem Eingabefeld anzeigen
function statusAnzeigen(text, typ) {
    statusText.textContent = text;
    statusText.className = 'status-text';
 
    if (typ === 'fehler') statusText.classList.add('fehler');
    if (typ === 'erfolg') statusText.classList.add('erfolg');
}
 
// Spinner in alle Karten setzen während Daten laden
function ladezustandAnzeigen() {
    var spinner = '<div class="spinner"></div>';
 
    zahlGesamt.innerHTML = spinner;
    zahlMaenner.innerHTML = spinner;
    zahlFrauen.innerHTML = spinner;
    zahlArbeitslos.innerHTML = spinner;
    zahlArbeitslose.innerHTML = spinner;
}
 
// Alle Karten auf den Ausgangszustand zurücksetzen
function zahlenZuruecksetzen() {
    zahlGesamt.textContent = '–';
    zahlMaenner.textContent = '–';
    zahlFrauen.textContent = '–';
    zahlArbeitslos.textContent = '–';
    zahlArbeitslose.textContent = '–';
 
    subGesamt.textContent = '';
    subMaenner.textContent = '';
    subFrauen.textContent = '';
    subArbeitslose.textContent = '';
}
 
// Aktiven Filter-Button visuell markieren
function aktivePillSetzen(button) {
    filterAlle.classList.remove('active');
    filterMaenner.classList.remove('active');
    filterFrauen.classList.remove('active');
    button.classList.add('active');
}
 
// Plugin: Rote vertikale Linie beim gewählten Jahr im Chart
function jahresLinieErstellen(jahre, jahr, idName) {
    return {
        id: idName,
        afterDraw: function (chart) {
            if (jahr === null) return;
 
            var index = jahre.indexOf(String(jahr));
            if (index === -1) return;
 
            var x = chart.scales.x.getPixelForValue(index);
            var ctx = chart.ctx;
 
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(x, chart.scales.y.top);
            ctx.lineTo(x, chart.scales.y.bottom);
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#dc2626';
            ctx.setLineDash([6, 4]);
            ctx.stroke();
            ctx.restore();
        }
    };
}
 
// Wiederverwendbare Chart-Optionen (heller Stil)
function chartOptionen(legendeAnzeigen, prozentAchse) {
    return {
        responsive: true,
        interaction: { mode: 'index', intersect: false },
        elements: {
            line: { borderWidth: 2.5, tension: 0.3 },
            point: { radius: 0, hoverRadius: 5 }
        },
        scales: {
            y: {
                ticks: {
                    color: '#999',
                    font: { size: 11 },
                    callback: function (value) {
                        if (prozentAchse) return value + ' %';
                        return value;
                    }
                },
                grid: { color: '#eee' },
                border: { display: false }
            },
            x: {
                ticks: { color: '#999', font: { size: 11 } },
                grid: { color: '#eee' },
                border: { display: false }
            }
        },
        plugins: {
            legend: {
                display: legendeAnzeigen,
                position: 'bottom',
                labels: {
                    color: '#1a1a1a',
                    font: { size: 12 },
                    padding: 24,
                    boxWidth: 16,
                    boxHeight: 2
                }
            }
        }
    };
}
 
 
// ============================================
// API-FUNKTIONEN
// ============================================
 
// Generische Funktion: Daten von einer URL laden
// async function mit try/catch wie im Kurs-Cheatsheet
async function datenLaden(url) {
    try {
        var response = await fetch(url);
        if (!response.ok) throw new Error('API konnte nicht geladen werden');
        return await response.json();
    } catch (error) {
        console.error(error);
        return false;
    }
}
 
// Suizid-Daten laden
function suizidDatenLaden() {
    return datenLaden('https://suizid.mezaciru.myhostpoint.ch/api/');
}
 
// Arbeitslosenquote laden (einzelnes Jahr oder Bereich wie '1991:2024')
function arbeitslosenquoteLaden(jahr) {
    var url = 'https://api.worldbank.org/v2/country/CHE/indicator/SL.UEM.TOTL.ZS?format=json&date=' + jahr;
    return datenLaden(url);
}
 
// Erwerbsbevölkerung laden (für Berechnung der absoluten Arbeitslosenzahl)
function erwerbsbevoelkerungLaden(jahr) {
    var url = 'https://api.worldbank.org/v2/country/CHE/indicator/SL.TLF.TOTL.IN?format=json&date=' + jahr;
    return datenLaden(url);
}
 
 
// ============================================
// ZEITRAUM FILTERN
// ============================================
 
// Range-Slider visuell aktualisieren
function sliderAktualisieren() {
    startJahr = Number(startSlider.value);
    endJahr = Number(endSlider.value);
 
    if (startJahr > endJahr) {
        startJahr = endJahr;
        startSlider.value = startJahr;
    }
 
    var startProzent = ((startJahr - minJahr) / (maxJahr - minJahr)) * 100;
    var endProzent = ((endJahr - minJahr) / (maxJahr - minJahr)) * 100;
 
    rangeTrack.style.background =
        'linear-gradient(to right, #e8e8e6 ' + startProzent + '%, #1d4ed8 ' +
        startProzent + '%, #1d4ed8 ' + endProzent + '%, #e8e8e6 ' + endProzent + '%)';
 
    startLabel.textContent = startJahr;
    endLabel.textContent = endJahr;
    zeitraumLabel.textContent = startJahr + '–' + endJahr;
}
 
// Einträge nach gewähltem Zeitraum filtern
// .filter() gibt ein neues Array zurück mit allen Einträgen die die Bedingung erfüllen
function datenNachZeitraumFiltern(eintraege) {
    return eintraege.filter(function (eintrag) {
        var jahr = Number(eintrag.jahr || eintrag.date);
        return jahr >= startJahr && jahr <= endJahr;
    });
}
 
// Suizid-Daten nach Zeitraum filtern (alle drei Kategorien)
function suizidDatenFiltern(daten) {
    return {
        daten: {
            gesamt: datenNachZeitraumFiltern(daten.daten.gesamt),
            maenner: datenNachZeitraumFiltern(daten.daten.maenner),
            frauen: datenNachZeitraumFiltern(daten.daten.frauen)
        }
    };
}
 
 
// ============================================
// CHARTS ERSTELLEN
// ============================================
 
// Suizid-Liniendiagramm erstellen (mit Filter für Geschlecht)
function suizidDiagrammErstellen(daten, jahr, filter) {
    var gefiltert = suizidDatenFiltern(daten);
 
    var jahre = gefiltert.daten.gesamt.map(function (eintrag) {
        return String(eintrag.jahr);
    });
    var gesamt = gefiltert.daten.gesamt.map(function (eintrag) {
        return eintrag.anzahl;
    });
    var maenner = gefiltert.daten.maenner.map(function (eintrag) {
        return eintrag.anzahl;
    });
    var frauen = gefiltert.daten.frauen.map(function (eintrag) {
        return eintrag.anzahl;
    });
 
    var datasets = [];
 
    if (filter === 'alle') {
        datasets.push({
            label: 'Gesamt',
            data: gesamt,
            borderColor: '#999999',
            borderDash: [4, 4],
            backgroundColor: 'transparent'
        });
    }
 
    if (filter === 'alle' || filter === 'maenner') {
        datasets.push({
            label: 'Männer',
            data: maenner,
            borderColor: '#1d4ed8',
            backgroundColor: 'transparent'
        });
    }
 
    if (filter === 'alle' || filter === 'frauen') {
        datasets.push({
            label: 'Frauen',
            data: frauen,
            borderColor: '#1a1a1a',
            backgroundColor: 'transparent'
        });
    }
 
    if (chartSuizid !== null) chartSuizid.destroy();
 
    chartSuizid = new Chart(suizidChart, {
        type: 'line',
        data: { labels: jahre, datasets: datasets },
        options: chartOptionen(true),
        plugins: [jahresLinieErstellen(jahre, jahr, 'linieSuizid')]
    });
}
 
// Arbeitslosigkeits-Diagramm erstellen (mit blauer Fläche)
function arbeitslosDiagrammErstellen(daten, jahr) {
    var eintraege = datenNachZeitraumFiltern(daten[1].slice().reverse());
 
    var jahre = eintraege.map(function (eintrag) {
        return eintrag.date;
    });
    var werte = eintraege.map(function (eintrag) {
        return eintrag.value;
    });
 
    if (chartArbeitslos !== null) chartArbeitslos.destroy();
 
    chartArbeitslos = new Chart(arbeitslosChart, {
        type: 'line',
        data: {
            labels: jahre,
            datasets: [{
                label: 'Arbeitslosenquote %',
                data: werte,
                borderColor: '#1d4ed8',
                backgroundColor: 'rgba(29, 78, 216, 0.08)',
                fill: true
            }]
        },
        options: chartOptionen(false, true),
        plugins: [jahresLinieErstellen(jahre, jahr, 'linieArbeitslos')]
    });
}
 
// Vergleichs-Diagramm erstellen (indexierte Werte, Startwert 100)
function vergleichDiagrammErstellen(suizidDaten, arbeitslosDaten, erwerbsDaten, jahr) {
    var jahre = [];
    var suizide = [];
    var arbeitslose = [];
 
    var suizidEintraege = datenNachZeitraumFiltern(suizidDaten.daten.gesamt);
    var arbeitslosEintraege = datenNachZeitraumFiltern(arbeitslosDaten[1].slice().reverse());
    var erwerbsEintraege = datenNachZeitraumFiltern(erwerbsDaten[1].slice().reverse());
 
    suizidEintraege.forEach(function (eintrag) {
        var jahrText = String(eintrag.jahr);
        var quote = arbeitslosEintraege.find(function (item) {
            return item.date === jahrText;
        });
        var erwerb = erwerbsEintraege.find(function (item) {
            return item.date === jahrText;
        });
 
        if (quote && erwerb && quote.value !== null && erwerb.value !== null) {
            jahre.push(jahrText);
            suizide.push(eintrag.anzahl);
            arbeitslose.push(Math.round(erwerb.value * quote.value / 100));
        }
    });
 
    if (suizide.length === 0 || arbeitslose.length === 0) return;
 
    var suizidIndex = suizide.map(function (wert) {
        return Math.round(wert / suizide[0] * 100);
    });
    var arbeitslosIndex = arbeitslose.map(function (wert) {
        return Math.round(wert / arbeitslose[0] * 100);
    });
 
    if (chartVergleich !== null) chartVergleich.destroy();
 
    chartVergleich = new Chart(vergleichChart, {
        type: 'line',
        data: {
            labels: jahre,
            datasets: [
                {
                    label: 'Suizide Gesamt · Index',
                    data: suizidIndex,
                    borderColor: '#1a1a1a',
                    backgroundColor: 'transparent'
                },
                {
                    label: 'Arbeitslose · Index',
                    data: arbeitslosIndex,
                    borderColor: '#1d4ed8',
                    borderDash: [4, 4],
                    backgroundColor: 'transparent'
                }
            ]
        },
        options: chartOptionen(true),
        plugins: [jahresLinieErstellen(jahre, jahr, 'linieVergleich')]
    });
}
 
 
// ============================================
// DATEN ANZEIGEN
// ============================================
 
// Hauptfunktion: Wird beim Klick auf "Daten laden" ausgeführt
async function jahrAnzeigen() {
    var jahr = Number(jahrInput.value);
 
    // Validierung
    if (jahrInput.value === '' || jahr < 1991 || jahr > 2024) {
        statusAnzeigen('Bitte gib ein Jahr zwischen 1991 und 2024 ein.', 'fehler');
        return;
    }
 
    aktuellesJahr = jahr;
    ladezustandAnzeigen();
    statusAnzeigen('Daten werden geladen …', '');
 
    // Suizid-Daten laden (nur beim ersten Mal, danach aus dem Cache)
    if (!suizidDatenGlobal) suizidDatenGlobal = await suizidDatenLaden();
 
    if (!suizidDatenGlobal) {
        zahlenZuruecksetzen();
        statusAnzeigen('Die Suiziddaten konnten nicht geladen werden.', 'fehler');
        return;
    }
 
    // Daten für das gewählte Jahr suchen
    // .find() durchsucht ein Array und gibt den ersten Treffer zurück
    var gesamt = suizidDatenGlobal.daten.gesamt.find(function (eintrag) {
        return eintrag.jahr === jahr;
    });
    var maenner = suizidDatenGlobal.daten.maenner.find(function (eintrag) {
        return eintrag.jahr === jahr;
    });
    var frauen = suizidDatenGlobal.daten.frauen.find(function (eintrag) {
        return eintrag.jahr === jahr;
    });
 
    if (!gesamt || !maenner || !frauen) {
        zahlenZuruecksetzen();
        statusAnzeigen('Für dieses Jahr sind keine vollständigen Daten vorhanden.', 'fehler');
        return;
    }
 
    // Zahlen in die Karten schreiben
    zahlGesamt.textContent = gesamt.anzahl.toLocaleString('de-CH');
    zahlMaenner.textContent = maenner.anzahl.toLocaleString('de-CH');
    zahlFrauen.textContent = frauen.anzahl.toLocaleString('de-CH');
 
    // Untertitel aktualisieren
    subGesamt.textContent = 'Jahr ' + jahr;
    subMaenner.textContent = Math.round(maenner.anzahl / gesamt.anzahl * 100) + ' % der Fälle';
    subFrauen.textContent = Math.round(frauen.anzahl / gesamt.anzahl * 100) + ' % der Fälle';
 
    // Arbeitslosenquote laden
    var quoteDaten = await arbeitslosenquoteLaden(jahr);
    var quote = quoteDaten && quoteDaten[1] && quoteDaten[1][0].value;
 
    if (quote) {
        zahlArbeitslos.textContent = quote.toFixed(1) + ' %';
 
        // Absolute Anzahl Arbeitslose berechnen
        var erwerbsDaten = await erwerbsbevoelkerungLaden(jahr);
        var erwerb = erwerbsDaten && erwerbsDaten[1] && erwerbsDaten[1][0].value;
 
        if (erwerb) {
            zahlArbeitslose.textContent = Math.round(erwerb * quote / 100).toLocaleString('de-CH');
            subArbeitslose.textContent = 'Berechnet aus Erwerbsbevölkerung × Quote';
        }
    }
 
    // Alle Diagramme aktualisieren
    alleDiagrammeAktualisieren();
    statusAnzeigen('Daten für ' + jahr + ' wurden geladen.', 'erfolg');
}
 
// Alle drei Diagramme neu zeichnen
function alleDiagrammeAktualisieren() {
    if (suizidDatenGlobal) {
        suizidDiagrammErstellen(suizidDatenGlobal, aktuellesJahr, aktuellerFilter);
    }
 
    if (quoteAlleJahreGlobal && quoteAlleJahreGlobal[1]) {
        arbeitslosDiagrammErstellen(quoteAlleJahreGlobal, aktuellesJahr);
    }
 
    if (suizidDatenGlobal && quoteAlleJahreGlobal && erwerbAlleJahreGlobal) {
        vergleichDiagrammErstellen(
            suizidDatenGlobal,
            quoteAlleJahreGlobal,
            erwerbAlleJahreGlobal,
            aktuellesJahr
        );
    }
}
 
 
// ============================================
// EVENTS
// ============================================
 
// Enter-Taste im Eingabefeld
jahrInput.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') jahrAnzeigen();
});
 
// Klick auf "Daten laden"
suchenButton.addEventListener('click', jahrAnzeigen);
 
// Range-Slider: Startjahr ändern
startSlider.addEventListener('input', function () {
    sliderAktualisieren();
    alleDiagrammeAktualisieren();
});
 
// Range-Slider: Endjahr ändern
endSlider.addEventListener('input', function () {
    if (Number(endSlider.value) < Number(startSlider.value)) {
        endSlider.value = startSlider.value;
    }
    sliderAktualisieren();
    alleDiagrammeAktualisieren();
});
 
// Filter: Alle anzeigen
filterAlle.addEventListener('click', function () {
    aktuellerFilter = 'alle';
    aktivePillSetzen(filterAlle);
    alleDiagrammeAktualisieren();
});
 
// Filter: Nur Männer anzeigen
filterMaenner.addEventListener('click', function () {
    aktuellerFilter = 'maenner';
    aktivePillSetzen(filterMaenner);
    alleDiagrammeAktualisieren();
});
 
// Filter: Nur Frauen anzeigen
filterFrauen.addEventListener('click', function () {
    aktuellerFilter = 'frauen';
    aktivePillSetzen(filterFrauen);
    alleDiagrammeAktualisieren();
});
 
 
// ============================================
// START: Wird beim Laden der Seite ausgeführt
// ============================================
 
async function start() {
    sliderAktualisieren();
    statusAnzeigen('Grunddaten werden geladen …', '');
 
    // Alle Daten einmalig laden
    suizidDatenGlobal = await suizidDatenLaden();
    quoteAlleJahreGlobal = await arbeitslosenquoteLaden('1991:2024');
    erwerbAlleJahreGlobal = await erwerbsbevoelkerungLaden('1991:2024');
 
    // Diagramme beim Seitenaufruf anzeigen
    alleDiagrammeAktualisieren();
    statusAnzeigen('Wähle einen Zeitraum oder gib ein Jahr ein.', '');
}
 
start();