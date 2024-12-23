let pokemonStartCount = 1;

const BASE_URL = "https://pokeapi.co/api/v2/pokemon?limit=100000&offset=0";

const typeToIcon = {
  bug: "./assets/img/pokemonTypes/bug.svg",
  dark: "./assets/img/pokemonTypes/dark.svg",
  dragon: "./assets/img/pokemonTypes/dragon.svg",
  electric: "./assets/img/pokemonTypes/electric.svg",
  fairy: "./assets/img/pokemonTypes/fairy.svg",
  fighting: "./assets/img/pokemonTypes/fighting.svg",
  fire: "./assets/img/pokemonTypes/fire.svg",
  flying: "./assets/img/pokemonTypes/flying.svg",
  ghost: "./assets/img/pokemonTypes/ghost.svg",
  grass: "./assets/img/pokemonTypes/grass.svg",
  ground: "./assets/img/pokemonTypes/ground.svg",
  ice: "./assets/img/pokemonTypes/ice.svg",
  normal: "./assets/img/pokemonTypes/normal.svg",
  poison: "./assets/img/pokemonTypes/poison.svg",
  psychic: "./assets/img/pokemonTypes/psychic.svg",
  rock: "./assets/img/pokemonTypes/rock.svg",
  steel: "./assets/img/pokemonTypes/steel.svg",
  water: "./assets/img/pokemonTypes/water.svg",
};

function init() {
  fetchPokedexData();
  console.log("Pokedex geladen!");
}

async function fetchPokedexData() {
  // Daten von der API abrufen
  const response = await fetch(BASE_URL);

  // JSON-Daten parsen
  const data = await response.json();

  // Gesamtanzahl der Pokemon im HTML anzeigen
  let totalPokemonCountElement = document.getElementById("totalPokemonCount");
  if (totalPokemonCountElement) {
    totalPokemonCountElement.innerHTML = `Total Pokemon Count: ${data.count}`;
  } else {
    console.warn("Element mit ID 'totalPokemonCount' nicht gefunden.");
  }

  // Ergebnis in der Konsole ausgeben
  console.log({
    count: data.count, // Gesamtanzahl der Pokemon
    results: data.results, // Liste der Pokemon mit Namen und URLs
  });

  renderPokemonCards(data.results);
}

async function renderPokemonCards(pokemonList) {
  let container = document.getElementById("content");

  container.classList.add("pokemonContainer");

  // Neue Pokémon-Karten hinzufügen
  for (let i = 0; i < 25 && i < pokemonList.length; i++) {
    let pokemon = pokemonList[i];

    // Pokémon-Karte rendern
    container.innerHTML += pokemonCardTemplate(
      pokemonStartCount,
      pokemon.name,
      pokemon.url
    );

    // Details (Typen und Bilder) laden
    await fetchPokemonDetails(pokemon.url, pokemonStartCount);

    pokemonStartCount++;
  }
}

async function fetchPokemonDetails(pokemonUrl, cardId) {
  const responsePokemonDetails = await fetch(pokemonUrl);

  const pokemonDetails = await responsePokemonDetails.json();
  const types = pokemonDetails.types.map((type) => type.type.name);
  const pokemonImg = pokemonDetails.sprites.front_default;

  insertTypeIcons(types, cardId);
  insertPokemonImage(pokemonImg, cardId);
}

function insertTypeIcons(types, cardId) {
  const typeContainer = document.querySelector(`#types-${cardId}`);

  if (!typeContainer) {
    console.error(`Container für Typen nicht gefunden: #types-${cardId}`);
    return;
  }

  // Symbole hinzufügen
  types.forEach((type) => {
    if (typeToIcon[type]) {
      typeContainer.innerHTML += `<img src="${typeToIcon[type]}" alt="${type} Type" class="type-icon">`;
    } else {
      console.warn(`Kein Symbol für Typ "${type}" gefunden.`);
    }
  });
}

function insertPokemonImage(imageUrl, cardId) {
  const pokemonPictureContainer = document.querySelector(`#picture-${cardId}`);

  if (!pokemonPictureContainer) {
    console.error(`Container für Typen nicht gefunden: #types-${cardId}`);
    return;
  }

  if (imageUrl) {
    pokemonPictureContainer.innerHTML = `<img src="${imageUrl}" alt="Pokemon Image" class="pokemon-img">`;
  } else {
    console.warn(`Kein Bild für Karte ${cardId} verfügbar.`);
    pokemonPictureContainer.innerHTML = `<p>Bild nicht verfügbar</p>`;
  }
}

async function renderNextPokemon() {
  const offset = pokemonStartCount - 1; // Start-Index berechnen
  const limit = 25; // Anzahl der Pokémon pro Seite

  // API-URL mit Offset und Limit
  const nextPokemonUrl = `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`;

  try {
    const nextPokemonResponse = await fetch(nextPokemonUrl);

    if (!nextPokemonResponse.ok) {
      throw new Error(`HTTP-Fehler! Status: ${nextPokemonResponse.status}`);
    }

    const data = await nextPokemonResponse.json();

    // Alte Karten entfernen
    clearPokemonCards();

    // Nächste Pokémon laden und rendern
    renderPokemonCards(data.results);
  } catch (error) {
    console.error("Fehler beim Laden der nächsten Pokémon:", error);
  }
}

function clearPokemonCards() {
  const container = document.getElementById("content");

  if (container) {
    container.innerHTML = ""; // Entferne alle Karten
  } else {
    console.error("Container mit ID 'content' nicht gefunden.");
  }
}
