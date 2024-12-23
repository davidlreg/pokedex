function init() {
  console.log("Pokedex geladen!");
  fetchPokedexData();
}

let pokemonStartCount = 1;

const BASE_URL = "https://pokeapi.co/api/v2/pokemon?limit=100000&offset=0";

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
  let pokemonCounter = 1;

  if (!container) {
    console.error("Element mit ID 'content' nicht gefunden.");
    return;
  }

  container.classList.add("pokemonContainer");

  for (let i = 0; i < 25 && i < pokemonList.length; i++) {
    let pokemon = pokemonList[i];

    // Pokémon-Karte rendern
    container.innerHTML += pokemonCardTemplate(
      pokemonCounter,
      pokemon.name,
      pokemon.url
    );

    // Typen abrufen und in der Konsole ausgeben
    await fetchPokemonTypes(pokemon.url, pokemonCounter);

    pokemonCounter++;
  }
}

async function fetchPokemonTypes(pokemonUrl, cardId) {
  const responsePokemonTypes = await fetch(pokemonUrl);

  const pokemonTypeData = await responsePokemonTypes.json();
  const types = pokemonTypeData.types.map((type) => type.type.name);
  insertTypeIcons(types, cardId);
  // console.log(`Pokemon: ${pokemonTypeData.name}, Types: ${types.join(", ")}`);
}

function insertTypeIcons(types, cardId) {
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
