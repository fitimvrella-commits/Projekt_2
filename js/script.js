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
const suizidChart = document.querySelector('#suizid-chart');
const arbeitslosChart = document.querySelector('#arbeitslos-chart');
 
 
// ============================================
// SCHRITT 2: Funktionen definieren
// ============================================
 
// Funktion: Suizid-Daten von der API laden
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
 
// Funktion: Liniendiagramm erstellen
let chart = null;
 
function diagrammErstellen(daten, gewaehltesJahr) {
    const jahre = daten.daten.gesamt.map(function (eintrag) {
        return eintrag.jahr;
    });
    const gesamt = daten.daten.gesamt.map(function (eintrag) {
        return eintrag.anzahl;
    });
    const maenner = daten.daten.maenner.map(function (eintrag) {
        return eintrag.anzahl;
    });
    const frauen = daten.daten.frauen.map(function (eintrag) {
        return eintrag.anzahl;
    });
 
    if (chart !== null) {
        chart.destroy();
    }
 
    const roteLinie = {
        id: 'roteLinie',
        afterDraw: function (chart) {
            if (gewaehltesJahr === null) return;
            const index = jahre.indexOf(Number(gewaehltesJahr));
            if (index === -1) return;
 
            const xScale = chart.scales.x;
            const yScale = chart.scales.y;
            const x = xScale.getPixelForValue(index);
            const ctx = chart.ctx;
 
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(x, yScale.top);
            ctx.lineTo(x, yScale.bottom);
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#dc2626';
            ctx.setLineDash([6, 4]);
            ctx.stroke();
            ctx.restore();
        }
    };
 
    chart = new Chart(suizidChart, {
        type: 'line',
        data: {
            labels: jahre,
            datasets: [
                {
                    label: 'Gesamt',
                    data: gesamt,
                    borderColor: '#999999',
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    borderDash: [4, 4],
                    tension: 0.3,
                    pointRadius: 0,
                    pointHoverRadius: 5
                },
                {
                    label: 'Männer',
                    data: maenner,
                    borderColor: '#1d4ed8',
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    tension: 0.3,
                    pointRadius: 0,
                    pointHoverRadius: 5
                },
                {
                    label: 'Frauen',
                    data: frauen,
                    borderColor: '#1a1a1a',
                    backgroundColor: 'transparent',
                    borderWidth: 2.5,
                    tension: 0.3,
                    pointRadius: 0,
                    pointHoverRadius: 5
                }
            ]
        },
        options: {
            responsive: true,
            interaction: { mode: 'index', intersect: false },
            scales: {
                y: {
                    ticks: { color: '#999', font: { size: 11 } },
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
                    display: true,
                    position: 'bottom',
                    labels: {
                        color: '#1a1a1a',
                        font: { size: 12 },
                        padding: 24,
                        usePointStyle: false,
                        boxWidth: 16,
                        boxHeight: 2
                    }
                }
            }
        },
        plugins: [roteLinie]
    });
}
 
// Funktion: Arbeitslosigkeits-Diagramm erstellen
let chartArbeitslos = null;
 
function arbeitslosDiagrammErstellen(daten, gewaehltesJahr) {
    const eintraege = daten[1].slice().reverse();
    const jahre = eintraege.map(function (eintrag) {
        return eintrag.date;
    });
    const werte = eintraege.map(function (eintrag) {
        return eintrag.value;
    });
 
    if (chartArbeitslos !== null) {
        chartArbeitslos.destroy();
    }
 
    const roteLinie = {
        id: 'roteLinieArbeitslos',
        afterDraw: function (chart) {
            if (gewaehltesJahr === null) return;
            const index = jahre.indexOf(String(gewaehltesJahr));
            if (index === -1) return;
 
            const xScale = chart.scales.x;
            const yScale = chart.scales.y;
            const x = xScale.getPixelForValue(index);
            const ctx = chart.ctx;
 
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(x, yScale.top);
            ctx.lineTo(x, yScale.bottom);
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#dc2626';
            ctx.setLineDash([6, 4]);
            ctx.stroke();
            ctx.restore();
        }
    };
 
    chartArbeitslos = new Chart(arbeitslosChart, {
        type: 'line',
        data: {
            labels: jahre,
            datasets: [
                {
                    label: 'Arbeitslosenquote %',
                    data: werte,
                    borderColor: '#1d4ed8',
                    backgroundColor: 'rgba(29, 78, 216, 0.08)',
                    borderWidth: 2,
                    tension: 0.3,
                    pointRadius: 0,
                    pointHoverRadius: 5,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    ticks: { color: '#999', font: { size: 11 }, callback: function (value) { return value + '%'; } },
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
                legend: { display: false }
            }
        },
        plugins: [roteLinie]
    });
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
suchenButton.addEventListener('click', async function () {
 
    const jahr = jahrInput.value;
 
    if (jahr === '') {
        alert('Bitte gib ein Jahr ein (1991–2024)');
        return;
    }
 
    if (jahr < 1991 || jahr > 2024) {
        alert('Bitte gib ein Jahr zwischen 1991 und 2024 ein.');
        return;
    }
 
    // Ladeanimation in alle Karten setzen
    zahlGesamt.innerHTML = '<div class="spinner"></div>';
    zahlMaenner.innerHTML = '<div class="spinner"></div>';
    zahlFrauen.innerHTML = '<div class="spinner"></div>';
    zahlArbeitslos.innerHTML = '<div class="spinner"></div>';
    zahlArbeitslose.innerHTML = '<div class="spinner"></div>';
 
    // --- SUIZID-API ---
    const daten = await datenLaden();
 
    const gesamt = daten.daten.gesamt.find(function (eintrag) {
        return eintrag.jahr == jahr;
    });
    const maenner = daten.daten.maenner.find(function (eintrag) {
        return eintrag.jahr == jahr;
    });
    const frauen = daten.daten.frauen.find(function (eintrag) {
        return eintrag.jahr == jahr;
    });
 
    if (gesamt === undefined) {
        alert('Keine Daten für das Jahr ' + jahr + ' vorhanden.');
        return;
    }
 
    zahlGesamt.textContent = gesamt.anzahl;
    zahlMaenner.textContent = maenner.anzahl;
    zahlFrauen.textContent = frauen.anzahl;
 
    // Untertitel der Karten aktualisieren
    document.querySelector('#sub-gesamt').textContent = 'Jahr ' + jahr;
    document.querySelector('#sub-maenner').textContent = Math.round(maenner.anzahl / gesamt.anzahl * 100) + ' % der Fälle';
    document.querySelector('#sub-frauen').textContent = Math.round(frauen.anzahl / gesamt.anzahl * 100) + ' % der Fälle';
 
    // Liniendiagramm aktualisieren
    diagrammErstellen(daten, jahr);
 
    // --- WORLD BANK API ---
    const wbDaten = await worldBankLaden(jahr);
 
    if (wbDaten && wbDaten[1]) {
        const arbeitslosenquote = wbDaten[1][0].value;
        zahlArbeitslos.textContent = arbeitslosenquote + '%';
    }
 
    // Arbeitslosigkeits-Diagramm mit roter Linie aktualisieren
    const wbAlleJahre = await worldBankLaden('1991:2024');
    if (wbAlleJahre && wbAlleJahre[1]) {
        arbeitslosDiagrammErstellen(wbAlleJahre, jahr);
    }
 
    // Absolute Anzahl Arbeitslose berechnen
    const erwerbsData = await erwerbsbevoelkerungLaden(jahr);
    if (erwerbsData && erwerbsData[1] && wbDaten && wbDaten[1]) {
        const erwerbsbevoelkerung = erwerbsData[1][0].value;
        const quote = wbDaten[1][0].value;
        const anzahlArbeitslose = Math.round(erwerbsbevoelkerung * quote / 100);
        zahlArbeitslose.textContent = anzahlArbeitslose.toLocaleString('de-CH');
        document.querySelector('#sub-arbeitslose').textContent = quote + ' % Quote';
    }
});
 
 
// ============================================
// SCHRITT 4: Diagramm beim Seitenaufruf laden
// ============================================
async function startDiagramm() {
    const daten = await datenLaden();
    if (daten) {
        diagrammErstellen(daten, null);
    }
    const wbDaten = await worldBankLaden('1991:2024');
    if (wbDaten && wbDaten[1]) {
        arbeitslosDiagrammErstellen(wbDaten, null);
    }
}
 
startDiagramm();