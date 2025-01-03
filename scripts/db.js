const BASE_URL = "https://pokeapi.co/api/v2/pokemon?limit=100000&offset=0";
const limit = 30; // Anzahl der Pokémon pro Seite

// Globale Variablen
let loadedPkm = [];
let pokemonStartCount = 1;
let currentPokemonIndex = 0;
let currentPokemonId = 0;
const fallbackImage = "./assets/img/fallback_img_not_found.png";

const typeToIcon = {
  bug: "./assets/pokemonTypes/bug.svg",
  dark: "./assets/pokemonTypes/dark.svg",
  dragon: "./assets/pokemonTypes/dragon.svg",
  electric: "./assets/pokemonTypes/electric.svg",
  fairy: "./assets/pokemonTypes/fairy.svg",
  fighting: "./assets/pokemonTypes/fighting.svg",
  fire: "./assets/pokemonTypes/fire.svg",
  flying: "./assets/pokemonTypes/flying.svg",
  ghost: "./assets/pokemonTypes/ghost.svg",
  grass: "./assets/pokemonTypes/grass.svg",
  ground: "./assets/pokemonTypes/ground.svg",
  ice: "./assets/pokemonTypes/ice.svg",
  normal: "./assets/pokemonTypes/normal.svg",
  poison: "./assets/pokemonTypes/poison.svg",
  psychic: "./assets/pokemonTypes/psychic.svg",
  rock: "./assets/pokemonTypes/rock.svg",
  steel: "./assets/pokemonTypes/steel.svg",
  water: "./assets/pokemonTypes/water.svg",
};
