fetch('http://localhost:5173/')
  .then(res => res.text())
  .then(text => {
    console.log("CONTAINS BUTTON:", text.includes('id="sidebar-game-arena-btn"'));
    console.log("CONTAINS JS:", text.includes('src="/src/main.js"'));
  })
  .catch(err => console.error(err));
