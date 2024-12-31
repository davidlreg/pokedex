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
    loadedPkm = await fetchAllPokemonDetails(pokemonList);
  }
}

async function fetchPokedexData() {
  const response = await fetch(BASE_URL);
  const data = await response.json();
  return data.results; // Gibt eine Liste von Pokémon mit Namen und Detail-URLs zurück
}

async function fetchAllPokemonDetails(pokemonList) {
  const fetchPromises = pokemonList.map((pokemon) =>
    fetch(pokemon.url)
      .then((response) => response.json())
      .then((data) => ({
        name: pokemon.name,
        types: data.types ? data.types.map((type) => type.type.name) : [],
        imageUrl: data.sprites.front_default,
        id: data.id,
        abilities: data.abilities
          ? data.abilities.map((ability) => ability.ability.name)
          : [], // Fähigkeiten hinzufügen
      }))
  );

  return (await Promise.all(fetchPromises)).filter(
    (pokemon) => pokemon !== null
  );
}

// Funktionen zum rendern der Anzeige der Gesamt-Anzahl der Pokemon, der Pokemon-Karten sowie den dazugehörigen Details

function renderPokemonCards() {
  const container = document.getElementById("content");
  clearPokemonCards(); // Alte Karten löschen
  container.classList.add("pokemonContainer");

  // Nur die nächsten `limit` Pokémon aus dem Array rendern
  const startIndex = pokemonStartCount - 1;
  const pokemonToRender = loadedPkm.slice(startIndex, startIndex + limit);

  pokemonToRender.forEach((pokemonDetails, index) => {
    const cardId = pokemonStartCount + index;

    container.innerHTML += pokemonCardTemplate(
      cardId,
      pokemonDetails.name,
      pokemonDetails.id
    );
    insertTypes(pokemonDetails.types, cardId);
    insertPokemonImage(pokemonDetails.imageUrl, cardId, pokemonDetails.types);
  });

  // Aktualisiere den Startzähler
  pokemonStartCount += pokemonToRender.length;
}

function insertPokemonImage(imageUrl, cardId, types) {
  const pokemonPictureContainer = document.querySelector(`#picture-${cardId}`);
  pokemonPictureContainer.innerHTML = `<img src="${imageUrl}" alt="Pokemon Image" class="bg_${types[0]} fullWidth">`;
}

function insertTypes(types, cardId) {
  const typeContainer = document.querySelector(`#types-${cardId}`);
  const typeDescriptionContainer = document.querySelector(
    `#typeDescription-${cardId}`
  );

  types.forEach((type) => {
    const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1);
    typeContainer.innerHTML += `<img src="${typeToIcon[type]}" alt="${capitalizedType} Type" class="type-icon">`;
    typeDescriptionContainer.innerHTML += `<p class="typeDescription">${capitalizedType}</p>`;
  });
}

function renderTotalPokemonCount(pokemonList) {
  let totalPokemonCountElement = document.getElementById("totalPokemonCount");
  totalPokemonCountElement.innerHTML = `Total Pokemon Count: ${pokemonList.length}`;

  totalPokemonCount.push(pokemonList.length);
}

// Funktionen um nach einzelnen Pokemon zu suchen und ein User-Feedback zu erhalten wenn kein Pokemon mit dem Suchbegriff übereinstimmt

async function filterPokemon() {
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

  // Daten aus der API abrufen
  const allPokemonData = await fetch(BASE_URL);
  const data = await allPokemonData.json();

  // Pokémon anhand des Suchbegriffs filtern
  const filteredPokemon = data.results
    .filter((pokemon) => pokemon.name.toLowerCase().includes(searchInput))
    .slice(0, 10); // Nur die ersten 10 Ergebnisse

  // Keine Ergebnisse gefunden
  if (filteredPokemon.length === 0) {
    showNoResultsMessage(searchInput);
    showGoBackToStartButton();
    hideLoadMoreButton();
    return;
  }

  // Detaillierte Daten der gefilterten Pokémon abrufen und rendern
  const detailedPokemonList = await fetchAllPokemonDetails(filteredPokemon);
  hideLoadMoreButton();
  showGoBackToStartButton(); // Zeige den Button, da eine Suche erfolgreich war
  renderSearchResults(detailedPokemonList);
}

function renderSearchResults(detailedPokemonList) {
  const container = document.getElementById("content");
  clearPokemonCards(); // Alte Karten löschen

  // Suchergebnisse rendern
  detailedPokemonList.forEach((pokemonDetails, index) => {
    const cardId = index + 1; // Lokale Nummerierung für Suchergebnisse

    container.innerHTML += pokemonCardTemplate(
      cardId,
      pokemonDetails.name,
      pokemonDetails.id
    );
    insertTypes(pokemonDetails.types, cardId);
    insertPokemonImage(pokemonDetails.imageUrl, cardId, pokemonDetails.types);
  });
}

function showNoResultsMessage(searchInput) {
  const container = document.getElementById("content");
  container.innerHTML = `<p class="no-results-message">No Pokémon found that match “${searchInput}”.</p>`;
}

// Funktion um die nächsten 25 Pokemon aus der API abzurufen und ins DOM zu rendern

async function renderNextPokemon() {
  hideLoadMoreButton();
  showLoadingSpinner();

  const offset = loadedPkm.length;
  const nextPokemonUrl = `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`;
  const response = await fetch(nextPokemonUrl);
  const data = await response.json();
  const detailedPokemonList = await fetchAllPokemonDetails(data.results);

  // Pokémon-Karten ersetzen
  renderPokemonCards(detailedPokemonList);

  // Aktualisiere den Startzähler direkt nach dem Hinzufügen
  pokemonStartCount += limit;

  hideLoadingSpinner();
  showLoadMoreButton();
}

// Funktionen um mehr Informationen über einzelne Pokemon anzeigen zu lassen

async function openPokemonDetails(number) {
  const pkmDetailContainer = document.getElementById("detailedPkmContent");
  const currentPokemonInfoUrl = `https://pokeapi.co/api/v2/pokemon/${number}`;
  const response = await fetch(currentPokemonInfoUrl);
  const currentPokemonDetails = await response.json();

  // Extrahiere die Typen aus den Daten
  const types = currentPokemonDetails.types
    ? currentPokemonDetails.types.map((type) => type.type.name)
    : [];

  // Extrahiere die Abilites aus den Daten
  const abilities = currentPokemonDetails.abilities
    ? currentPokemonDetails.abilities.map((abilities) => abilities.ability.name)
    : [];

  // Setze den aktuellen Index für Navigation
  currentPokemonIndex = loadedPkm.findIndex((pokemon) => pokemon.id === number);

  pkmDetailContainer.innerHTML = "";
  pkmDetailContainer.innerHTML = renderDetailsPokemonCard(
    currentPokemonDetails,
    number,
    types,
    abilities,
    totalPokemonCount
  );

  showDetailedPkmContainer();
}

function showPreviousPokemon() {
  if (currentPokemonIndex > 0) {
    currentPokemonIndex--; // Index verringern
    const previousPokemon = loadedPkm[currentPokemonIndex];
    const { id, types } = previousPokemon;

    // Abilities aus den API-Daten extrahieren
    const abilities = previousPokemon.abilities || [];

    document.getElementById("detailedPkmContent").innerHTML =
      renderDetailsPokemonCard(
        previousPokemon,
        id,
        types,
        abilities,
        loadedPkm.length
      );
  } else {
    alert("This is the first Pokémon!"); // Optional: Begrenzung anzeigen
  }
}

function showNextPokemon() {
  if (currentPokemonIndex < loadedPkm.length - 1) {
    currentPokemonIndex++; // Index erhöhen
    const nextPokemon = loadedPkm[currentPokemonIndex];
    const { id, types } = nextPokemon;

    // Abilities aus den API-Daten extrahieren
    const abilities = nextPokemon.abilities || [];

    document.getElementById("detailedPkmContent").innerHTML =
      renderDetailsPokemonCard(
        nextPokemon,
        id,
        types,
        abilities,
        loadedPkm.length
      );
  } else {
    alert("This is the last Pokémon!"); // Optional: Begrenzung anzeigen
  }
}

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
