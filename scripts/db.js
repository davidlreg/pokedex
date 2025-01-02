const BASE_URL = "https://pokeapi.co/api/v2/pokemon?limit=100000&offset=0";
const limit = 25; // Anzahl der Pokémon pro Seite

// Globale Variablen
let loadedPkm = [];
let pokemonStartCount = 1;
let currentPokemonIndex = 0;

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
