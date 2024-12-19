function init() {
  console.log("Pokedex geladen!");
  fetchPokedexData();
}

const BASE_URL = "https://pokeapi.co/api/v2/pokemon?limit=100000&offset=0";

async function fetchPokedexData() {
  try {
    // Daten von der API abrufen
    const response = await fetch(BASE_URL);

    // Fehler prüfen
    if (!response.ok) {
      throw new Error(`HTTP-Fehler! Status: ${response.status}`);
    }

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
  } catch (error) {
    // Fehler behandeln und ausgeben
    console.error("Fehler beim Abrufen der Daten:", error);
  }
}

function renderPokemonCards(pokemonList) {
  let container = document.getElementById("content");

  if (!container) {
    console.error("Element mit ID 'content' nicht gefunden.");
    return;
  }

  container.classList.add("pokemonContainer");

  for (let i = 0; i < 25 && i < pokemonList.length; i++) {
    const pokemon = pokemonList[i];
    container.innerHTML += pokemonCardTemplate(pokemon.name, pokemon.url);
  }
}
