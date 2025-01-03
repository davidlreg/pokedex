function init() {
  loadAndShowPkm();
  document
    .getElementById("pokemonSearch")
    .addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault(); // Verhindert das Standard-Verhalten des Formulars
        filterPokemon(); // filterPokemon Funktion aufrufen
      }
    });
}

async function loadAndShowPkm() {
  hideLoadMoreButton();
  showLoadingSpinner();

  await loadAndPrepareData(); // Daten laden und in `loadedPkm` speichern
  renderPokemonCards(); // Karten aus `loadedPkm` rendern

  renderTotalPokemonCount(loadedPkm); // Gesamtzahl der Pokémon aktualisieren

  hideLoadingSpinner();
  showLoadMoreButton();
}

// Funktionen zum abrufen aller relevanten Informationen

async function loadAndPrepareData() {
  if (loadedPkm.length === 0) {
    const pokemonList = await fetchPokedexData();
    loadedPkm = await fetchPokemonDetails(pokemonList);
  }
}

async function fetchPokedexData() {
  const response = await fetch(BASE_URL);
  const data = await response.json();
  return data.results; // Gibt eine Liste von Pokémon mit Namen und Detail-URLs zurück
}

async function fetchPokemonDetails(pokemonList) {
  let currentPokemonDetails = [];

  const fetchPromises = pokemonList.map((pokemon) =>
    fetch(pokemon.url)
      .then((response) => response.json())
      .then((data) => {
        // Berechnung der zusätzlichen Werte
        const stats = {};
        data.stats.forEach((stat) => {
          stats[stat.stat.name] = stat.base_stat;
        });

        // Neues Pokémon-Objekt erstellen
        const pokemonDetails = {
          id: data.id,
          name: pokemon.name,
          normal_version_pic: data.sprites.front_default,
          types: data.types ? data.types.map((type) => type.type.name) : [],
          abilities: data.abilities
            ? data.abilities.map((ability) => ability.ability.name).join(", ")
            : "None",
          height: data.height / 10, // Konvertiert in Meter
          weight: data.weight / 10, // Konvertiert in Kilogramm
          hp: stats["hp"] || 0,
          attack: stats["attack"] || 0,
          defense: stats["defense"] || 0,
          sp_attack: stats["special-attack"] || 0,
          sp_def: stats["special-defense"] || 0,
          speed: stats["speed"] || 0,
          total:
            (stats["hp"] || 0) +
            (stats["attack"] || 0) +
            (stats["defense"] || 0) +
            (stats["special-attack"] || 0) +
            (stats["special-defense"] || 0) +
            (stats["speed"] || 0),
          shiny_version_pic: data.sprites.front_shiny,
        };

        // Pokémon-Objekt ins Array pushen
        currentPokemonDetails.push(pokemonDetails);

        return pokemonDetails;
      })
      .catch((error) => {
        console.error(`Error fetching data for ${pokemon.name}:`, error);
        return null;
      })
  );

  // Warten auf alle Promises
  await Promise.all(fetchPromises);

  // Das Array zurückgeben
  return currentPokemonDetails;
}

// Funktionen zum rendern der Anzeige der Gesamt-Anzahl der Pokemon, der Pokemon-Karten sowie den dazugehörigen Details

function renderPokemonCards() {
  const container = document.getElementById("content");
  clearPokemonCards(); // Alte Karten löschen
  container.classList.add("pokemonContainer");

  // Nur die nächsten `limit` Pokémon aus dem Array rendern
  const startIndex = pokemonStartCount - 1;
  const pokemonToRender = loadedPkm.slice(startIndex, startIndex + limit);

  pokemonToRender.forEach((loadedPkm, index) => {
    const cardId = pokemonStartCount + index;

    container.innerHTML += pokemonCardTemplate(
      cardId,
      loadedPkm.name,
      loadedPkm.id
    );
    insertPokemonImage(cardId, loadedPkm.normal_version_pic, loadedPkm.types);
    insertTypes(cardId, loadedPkm.types);
  });

  // Aktualisiere den Startzähler
  pokemonStartCount += pokemonToRender.length;
}

function insertPokemonImage(cardId, normal_version_pic, types) {
  const pokemonPictureContainer = document.querySelector(`#picture-${cardId}`);
  pokemonPictureContainer.innerHTML = `<img src="${normal_version_pic}" class="bg_${types[0]} fullWidth">`;
}

function insertTypes(cardId, types) {
  const typeContainer = document.querySelector(`#types-${cardId}`);
  const typeDescriptionContainer = document.querySelector(
    `#typeDescription-${cardId}`
  );

  types.forEach((type) => {
    const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1);
    typeContainer.innerHTML += `<img src="${typeToIcon[type]}" class="type-icon">`;
    typeDescriptionContainer.innerHTML += `<p class="typeDescription">${capitalizedType}</p>`;
  });
}

function renderTotalPokemonCount(loadedPkm) {
  let totalPokemonCountElement = document.getElementById("totalPokemonCount");
  totalPokemonCountElement.innerHTML = `Total Pokemon Count: ${loadedPkm.length}`;
}

// Funktionen um nach einzelnen Pokemon zu suchen und ein User-Feedback zu erhalten wenn kein Pokemon mit dem Suchbegriff übereinstimmt

function filterPokemon() {
  const searchInput = document
    .getElementById("pokemonSearch")
    .value.toLowerCase();

  // Überprüfung auf gültige Eingabe
  if (!searchInput) {
    alert("Please enter a search term.");
    return;
  } else if (searchInput.length < 3) {
    alert("At least 3 letters are required for the search.");
    return;
  }

  // Pokémon anhand des Suchbegriffs im `loadedPkm`-Array filtern
  const filteredPokemon = loadedPkm
    .filter((pokemon) => pokemon.name.toLowerCase().includes(searchInput))
    .slice(0, 10); // Nur die ersten 10 Ergebnisse

  // Keine Ergebnisse gefunden
  if (filteredPokemon.length === 0) {
    showNoResultsMessage(searchInput);
    showGoBackToStartButton();
    hideLoadMoreButton();
    return;
  }

  // Gefilterte Ergebnisse direkt rendern
  hideLoadMoreButton();
  showGoBackToStartButton(); // Zeige den Button, da eine Suche erfolgreich war
  renderSearchResults(filteredPokemon);
}

function renderSearchResults(filteredPokemon) {
  const container = document.getElementById("content");
  clearPokemonCards(); // Alte Karten löschen

  // Suchergebnisse rendern
  filteredPokemon.forEach((loadedPkm, index) => {
    const cardId = index + 1; // Lokale Nummerierung für Suchergebnisse

    container.innerHTML += pokemonCardTemplate(
      cardId,
      loadedPkm.name,
      loadedPkm.id
    );
    insertTypes(cardId, loadedPkm.types);
    insertPokemonImage(cardId, loadedPkm.normal_version_pic, loadedPkm.types);
  });
}

function showNoResultsMessage(searchInput) {
  const container = document.getElementById("content");
  container.innerHTML = `<p class="no-results-message">No Pokémon found that match “${searchInput}”.</p>`;
}

// Funktion um die nächsten 25 Pokemon aus der API abzurufen und ins DOM zu rendern

function renderNextPokemon() {
  hideLoadMoreButton();
  showLoadingSpinner();

  // Sortiere `loadedPkm` nach Pokémon-ID
  loadedPkm.sort((a, b) => a.id - b.id);

  // Nächste Pokémon aus dem `loadedPkm`-Array laden
  const startIndex = pokemonStartCount - 1;
  const nextPokemonList = loadedPkm.slice(startIndex, startIndex + limit);

  // Prüfe, ob es keine weiteren Pokémon mehr zu laden gibt
  if (startIndex >= loadedPkm.length) {
    hideLoadingSpinner();
    showGoBackToStartButton(); // Zeige "Go Back to Start"-Button
    return;
  }

  // Pokémon-Karten ersetzen
  renderPokemonCards(nextPokemonList);

  // Aktualisiere den Startzähler direkt nach dem Hinzufügen
  pokemonStartCount += nextPokemonList.length;

  // Prüfe, ob wir alle Pokémon geladen haben
  if (pokemonStartCount > loadedPkm.length) {
    hideLoadMoreButton();
    showGoBackToStartButton();
  } else {
    showLoadMoreButton();
  }

  hideLoadingSpinner();
}

// Funktionen um mehr Informationen über einzelne Pokemon anzeigen zu lassen

function openPokemonDetails(id) {
  const pkmDetailContainer = document.getElementById("detailedPkmContent");

  // Pokémon-Daten und Index basierend auf der ID finden
  currentPokemonIndex = loadedPkm.findIndex((pokemon) => pokemon.id === id);
  const currentPokemon = loadedPkm[currentPokemonIndex];
  currentPokemonId = currentPokemon.id;

  // Extrahiere Typen und andere Daten
  const types = currentPokemon.types || [];

  // Pokémon-Details rendern
  pkmDetailContainer.innerHTML = "";
  pkmDetailContainer.innerHTML = renderDetailsPokemonCard(
    currentPokemon,
    id,
    types,
    currentPokemonIndex
  );

  showDetailedPkmContainer();
  renderAboutSection();
}

function showNextPokemon() {
  if (currentPokemonIndex < loadedPkm.length - 1) {
    currentPokemonIndex++; // Index erhöhen
    const nextPokemon = loadedPkm[currentPokemonIndex];

    document.getElementById("detailedPkmContent").innerHTML =
      renderDetailsPokemonCard(
        nextPokemon,
        nextPokemon.id,
        nextPokemon.types,
        currentPokemonIndex
      );

    renderAboutSection(); // Höhe und Fähigkeiten weitergeben
  } else {
    alert("This is the last Pokémon!"); // Optional: Begrenzung anzeigen
  }
}

function showPreviousPokemon() {
  if (currentPokemonIndex > 0) {
    currentPokemonIndex--; // Index verringern
    const previousPokemon = loadedPkm[currentPokemonIndex];
    currentPokemonId = previousPokemon.id; // Lokalen Index auf die aktuelle ID setzen

    document.getElementById("detailedPkmContent").innerHTML =
      renderDetailsPokemonCard(
        previousPokemon,
        previousPokemon.id,
        previousPokemon.types,
        currentPokemonIndex
      );

    renderAboutSection(); // Höhe und Fähigkeiten weitergeben
  } else {
    alert("This is the first Pokémon!"); // Optional: Begrenzung anzeigen
  }
}

function renderAboutSection() {
  const pkmDetails = loadedPkm[currentPokemonIndex]; // Details für das aktuelle Pokémon holen
  const { height, weight, abilities = "" } = pkmDetails; // Default-Wert für abilities setzen

  const documentRef = document.getElementById("informationBox");
  documentRef.innerHTML = ""; // Platzhalter leeren
  documentRef.innerHTML = renderAboutSectionTemplate(height, weight, abilities);
}

function renderBaseStats() {
  documentRef = document.getElementById("informationBox");
  documentRef.innerHTML = "";
  documentRef.innerHTML = renderBaseStatsTemplate();
}

function showShinyVersion() {}

// Funktionen zum Ein- und Ausblenden vom Loading-Spinner & Load more Button & Go back to Start Button

function showLoadingSpinner() {
  let documentRef = document.getElementById("content");
  clearPokemonCards();
  documentRef.innerHTML = renderLoadingSpinner();
}

function hideLoadingSpinner() {
  const loadingSpinner = document.getElementById("loadingSpinner");
  if (loadingSpinner) {
    loadingSpinner.remove();
  }
}

function hideLoadMoreButton() {
  const button = document.getElementById("loadMoreButton");
  if (button) {
    button.classList.add("hidden");
  }
}

function showLoadMoreButton() {
  const button = document.getElementById("loadMoreButton");
  if (button) {
    button.classList.remove("hidden");
  }
}

function showGoBackToStartButton() {
  const button = document.getElementById("goBackToStartBtn");
  if (button) {
    button.classList.remove("hidden"); // Entfernt die "hidden"-Klasse, um den Button anzuzeigen
  }
}

function hideGoBackToStartButton() {
  const button = document.getElementById("goBackToStartBtn");
  if (button) {
    button.classList.add("hidden"); // Fügt die "hidden"-Klasse hinzu, um den Button zu verstecken
  }
}

function showDetailedPkmContainer() {
  const blackOverlay = document.getElementById("blackOverlay");
  if (blackOverlay) {
    blackOverlay.classList.remove("hidden");
    document.body.classList.add("no-scroll"); // Scrollen verhindern
  }
}

function hideDetailedPkmContainer() {
  const blackOverlay = document.getElementById("blackOverlay");
  if (blackOverlay) {
    blackOverlay.classList.add("hidden");
    document.body.classList.remove("no-scroll"); // Scrollen wieder aktivieren
  }
}

// Funktion zum löschen aller Elemente im Container "content" und um zur Startseite zurückzukehren

function clearPokemonCards() {
  const container = document.getElementById("content");
  container.innerHTML = "";
}

function resetToAllPokemon() {
  hideGoBackToStartButton(); // Verstecke den "Zurück"-Button
  hideDetailedPkmContainer();
  showLoadMoreButton(); // Zeige den "Load More"-Button wieder an
  clearPokemonCards(); // Alte Karten löschen
  pokemonStartCount = 1; // Zähler zurücksetzen
  renderPokemonCards(); // Zeige alle Pokémon aus `loadedPkm`
}
