// fetch(`https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1`)
//   .then((res) => res.json())
//   .then((data) => {
//     const deckId = data.deck_id;
//     console.log(deckId);
//   });

let deckId;

const newDeck = "https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1";

const fetchDeck = async () => {
  const data = await fetch(newDeck).then((res) => res.json());
  deckId = data.deck_id;
  console.log(deckId);
};

const fetchCard = async () => {
  try {
    const res = await fetch(
      `https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`
    );

    const data = await res.json();
    console.log(data);
  } catch (err) {
    console.log(err);
  }
};

fetchDeck();
console.log(deckId);
