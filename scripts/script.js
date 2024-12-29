let pokemonStartCount = 1;

const BASE_URL = "https://pokeapi.co/api/v2/pokemon?limit=100000&offset=0";

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

  const pokemonList = await fetchPokedexData();
  console.log(pokemonList);

  const detailedPokemonList = await fetchAllPokemonDetails(pokemonList);

  hideLoadingSpinner();
  renderTotalPokemonCount(pokemonList);
  renderPokemonCards(detailedPokemonList);
  showLoadMoreButton();
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
        imageUrl: data.sprites.front_default || "default_image_url.png",
      }))
      .catch((error) => {
        console.error(`Failed to fetch details for ${pokemon.name}:`, error);
        return null; // Fehlerhafte Pokémon ignorieren
      })
  );

  return (await Promise.all(fetchPromises)).filter(
    (pokemon) => pokemon !== null
  );
}

function renderTotalPokemonCount(pokemonList) {
  let totalPokemonCountElement = document.getElementById("totalPokemonCount");
  totalPokemonCountElement.innerHTML = `Total Pokemon Count: ${pokemonList.length}`;
}

function renderPokemonCards(detailedPokemonList) {
  const container = document.getElementById("content");
  clearPokemonCards(); // Alte Karten löschen
  container.classList.add("pokemonContainer");

  detailedPokemonList.slice(0, 25).forEach((pokemonDetails, index) => {
    const cardId = pokemonStartCount + index;
    container.innerHTML += pokemonCardTemplate(cardId, pokemonDetails.name);
    insertTypes(pokemonDetails.types, cardId);
    insertPokemonImage(pokemonDetails.imageUrl, cardId, pokemonDetails.types);
  });
}

function insertPokemonImage(imageUrl, cardId, types) {
  const pokemonPictureContainer = document.querySelector(`#picture-${cardId}`);
  pokemonPictureContainer.innerHTML = `<img src="${imageUrl}" alt="Pokemon Image" class="bg_${types[0]} fullWidth">`;
}

function insertTypes(types, cardId) {
  if (!types || types.length === 0) {
    console.warn(`No types found for cardId: ${cardId}`);
    return;
  }

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

async function filterPokemon() {
  const searchInput = document
    .getElementById("pokemonSearch")
    .value.toLowerCase();
  const allPokemonData = await fetch(BASE_URL);
  const data = await allPokemonData.json();

  if (!searchInput) {
    const detailedPokemonList = await fetchAllPokemonDetails(data.results);
    renderPokemonCards(detailedPokemonList);
    return;
  } else if (searchInput.length < 3) {
    alert("At least 3 letters are required for the search.");
    return;
  }

  const filteredPokemon = data.results.filter((pokemon) =>
    pokemon.name.toLowerCase().includes(searchInput)
  );

  if (filteredPokemon.length === 0) {
    showNoResultsMessage(searchInput);
  } else {
    const detailedPokemonList = await fetchAllPokemonDetails(filteredPokemon);
    renderPokemonCards(detailedPokemonList); // Lokale Nummerierung in renderPokemonCards
  }
}

function showNoResultsMessage(searchInput) {
  const container = document.getElementById("content");
  container.innerHTML = `<p class="no-results-message">No Pokémon found that match “${searchInput}”.</p>`;
}

async function renderNextPokemon() {
  hideLoadMoreButton();
  showLoadingSpinner();

  const limit = 25; // Anzahl der Pokémon pro Seite
  const offset = pokemonStartCount - 1; // Aktueller Startpunkt

  const nextPokemonUrl = `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`;
  console.log(`Lade Pokémon ab Offset ${offset} mit Limit ${limit}`);

  const response = await fetch(nextPokemonUrl);
  const data = await response.json();
  const detailedPokemonList = await fetchAllPokemonDetails(data.results);

  const container = document.getElementById("content");

  // Pokémon-Karten ersetzen
  renderPokemonCards(detailedPokemonList);

  // Aktualisiere den Startzähler direkt nach dem Hinzufügen
  pokemonStartCount += limit;

  hideLoadingSpinner();
  showLoadMoreButton();
}

// Funktion um mehr Informationen über einzelne Pokemon anzeigen zu lassen

/*
async function openPokemonDetails(number) {
  const mainContainer = document.getElementById("mainContainer");
  const currentPokemonInfoUrl = `https://pokeapi.co/api/v2/pokemon/${number}`;
  const response = await fetch(currentPokemonInfoUrl);
  const currentPokemonDetails = await response.json();

  mainContainer.innerHTML = "";
  mainContainer.innerHTML = renderDetailsPokemonCard(
    currentPokemonDetails,
    number
  );

  console.log(currentPokemonDetails);
}
*/

// Funktionen zum Ein- und Ausblenden vom Loading-Spinner & Load more Button

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

// Funktion zum löschen aller Elemente im Container "content"

function clearPokemonCards() {
  const container = document.getElementById("content");
  container.innerHTML = "";
}
