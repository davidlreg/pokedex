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
    totalPokemonCountElement.innerHTML = `Total Pokemon Count: ${data.count}`;

    // Ergebnis in der Konsole ausgeben
    console.log({
      count: data.count, // Gesamtanzahl der Pokemon
      results: data.results, // Liste der Pokemon mit Namen und URLs
    });
  } catch (error) {
    // Fehler behandeln und ausgeben
    console.error("Fehler beim Abrufen der Daten:", error);
  }
}
