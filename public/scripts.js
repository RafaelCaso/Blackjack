const hit = $(".hit");
const deal = $(".deal");
const stay = $(".stay");
const userCardBox = $(".userCardBox");
const dealerCardBox = $(".dealerCardBox");
const modal = $(".modal");
const overlay = $(".overlay");
const btnCloseModal = $(".close-modal");
const backOfCard = "./images/back.jpeg";

// give option to play with more decks and change deck_count
var deckCount = 6;
var newDeck = `https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=${deckCount}`;

// append scores to totals and reduce totals to determine winner
var userTotal = [];
var dealerTotal = [];

// declare variable to set image of first card dealt to dealer (face down)
// reveal card when player stays
let hiddenCard;

// asynchronous function to obtain deck_id. Game functionality wrapped in asynchronous function to avoid issues with reducing total scores before api has responded and pushed value to total
const fetchDeck = async () => {
  const data = await fetch(newDeck).then((res) => res.json());
  const id = await data.deck_id;
  return id;
};

(async () => {
  const game = await fetchDeck().then((res) => {
    // calls api and pushes value of card to total and appends image to player's/dealer's card box

    const fetchCard = async (player, total) => {
      try {
        // res = response from fetchDeck async function
        const result = await fetch(
          `https://deckofcardsapi.com/api/deck/${res}/draw/?count=1`
        );

        const data = await result.json();
        let card = data.cards[0];
        let value = card.value;
        let image = card.image;

        // checks if this is first card dealt to dealer. If so, appends hidden card to dealer's card box and pushes value to total
        if (player === dealerCardBox && total.length === 0) {
          hiddenCard = image;

          player.append(
            `<img src="${backOfCard}" class="backOfCard card" alt="dealer's unknown card">`
          );

          if (value === "JACK" || value === "QUEEN" || value === "KING") {
            total.push(10);
          } else if (value === "ACE") {
            // this is going to get messy. Need to adjust for aces being 1's if necessary. Will add this functionality elsewhere
            total.push(11);
          } else {
            total.push(parseInt(value));
          }
        } else {
          if (value === "JACK" || value === "QUEEN" || value === "KING") {
            total.push(10);
          } else if (value === "ACE") {
            // this is going to get messy. Need to adjust for aces being 1's if necessary. Will add this functionality elsewhere
            total.push(11);
          } else {
            total.push(parseInt(value));
          }

          player.append(`<img src="${image}" class="card" alt="${value}">`);
        }
      } catch (err) {
        console.log(err);
      }
      return true;
    };

    // consts seems pointless but this is the only way I could get app to wait for values to be pushed to totals before checking for natural 21s
    const init = async () => {
      const u1 = await fetchCard(userCardBox, userTotal);
      const u2 = await fetchCard(dealerCardBox, dealerTotal);
      const u3 = await fetchCard(userCardBox, userTotal);
      const u4 = await fetchCard(dealerCardBox, dealerTotal);
      return true;
    };
    hit.click(() => {
      fetchCard(userCardBox, userTotal).then(async (res) => {
        if (res === true) {
          addTotal().then(async (scores) => {
            if (scores[0] > 21 && userTotal.includes(11)) {
              let ace = userTotal.indexOf(11);
              userTotal.splice(ace, 1);
              userTotal.push(1);
            } else if (scores[0] > 21) {
              // change this for modal window later
              console.log("Bust, you lose.");
              setTimeout(() => {
                reset();
              }, 2000);
            } else if (scores[0] === 21) {
              // change this for modal window
              // change this to run dealerTurn code as dealer can still potentially tie you
              console.log("21! You win!");
              setTimeout(() => {
                reset();
              }, 2000);
            }
          });
        }
      });
    });

    // this is ugly but it finally works. AFTER api responds and values are pushed to totals it will automatically check for a natural 21 as per rules of Blackjack
    deal.click(async () => {
      deal.addClass("hidden");
      hit.removeClass("hidden");
      stay.removeClass("hidden");
      const dealt = await init().then((res) => {
        if (res === true) {
          addTotal().then(async (scores) => {
            let userScore = scores[0];
            let dealerScore = scores[1];
            if (userScore === 21 && dealerScore === 21) {
              revealHiddenCard();
              console.log("Double Blackjack. Split pot");
            } else if (dealerScore === 21) {
              revealHiddenCard();
              console.log("Dealer has Blackjack. You lose");
            } else if (userScore === 21) {
              console.log("BlackJack! You win!");
            } else if (userScore > 21) {
              let ace = userTotal.indexOf(11);
              userTotal.splice(ace, 1);
              userTotal.push(1);
            } else {
              void 0;
            }
          });
        }
      });
    });

    stay.click(() => {
      revealHiddenCard();
      setTimeout(() => {
        reset();
      }, 1000);
    });
  });
})();

// not sure if async necessary
const addTotal = async () => {
  let userScore = await userTotal.reduce((a, v) => a + v);
  let dealerScore = await dealerTotal.reduce((a, v) => a + v);
  return [userScore, dealerScore];
};

function reset() {
  deal.removeClass("hidden");
  hit.addClass("hidden");
  stay.addClass("hidden");
  userCardBox.empty();
  dealerCardBox.empty();
  userTotal = [];
  dealerTotal = [];
}

function revealHiddenCard() {
  $(".backOfCard").remove();
  dealerCardBox.prepend(`<img src="${hiddenCard}" alt="revealed card">`);
}
