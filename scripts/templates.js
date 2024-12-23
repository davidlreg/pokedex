function pokemonCardTemplate(number, name) {
  return `
     <div class="pokemonCard">
      <h2><span>#${number}</span> ${name}</h2>
      <div class="pokemonImg" id="picture-${number}"></div>
      <div class="types" id="types-${number}"></div>
    </div>
    `;
}
