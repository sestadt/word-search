const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const gridRows = 12;
const gridCols = 12;
const words = ["apple", "peach", "pear", "strawberry", "watermelon", "grapes", "kiwi", "banana", "pineapple", "mango"];
const gridContainer = document.querySelector(".grid-container");
let isSelecting = false;
let dragStart = null;
let selectedCells = [];
const foundWords = new Set();

function createGrid() {
    gridContainer.style.gridTemplateColumns = `repeat(${gridCols}, 20px)`;
    gridContainer.style.gridTemplateRows = `repeat(${gridRows}, 20px)`;

    for (let i = 0; i < gridRows * gridCols; i++) {
        const cell = document.createElement("div");
        cell.classList.add("grid-cell");
        cell.dataset.row = Math.floor(i / gridCols);
        cell.dataset.col = i % gridCols;
        cell.textContent = "A";
        gridContainer.appendChild(cell);
    }
}

function shuffle () {
    const cells = document.querySelectorAll(".grid-cell");

    for (let i = 0; i < cells.length; i++) {
        cells[i].textContent = "";
        cells[i].classList.remove("selected");
    }

    const directions = [
        [0, 1],
        [1, 0],
        [1, 1],
    ];

    for (const word of words) {
        let placed = false;
        let attempts = 0;

        while (!placed && attempts < 1000) {
            attempts++;

            const [rowStep, colStep] = directions[Math.floor(Math.random() * directions.length)];
            const randomRow = Math.floor(Math.random() * gridRows);
            const randomCol = Math.floor(Math.random() * gridCols);
            const endRow = randomRow + (word.length - 1) * rowStep;
            const endCol = randomCol + (word.length - 1) * colStep;

            if (endRow >= gridRows || endCol >= gridCols) {
                continue;
            }

            let canPlace = true;

            for (let i = 0; i < word.length; i++) {
                const row = randomRow + i * rowStep;
                const col = randomCol + i * colStep;
                const index = row * gridCols + col;
                const letter = word[i].toUpperCase();

                if (cells[index].textContent !== "" && cells[index].textContent !== letter) {
                    canPlace = false;
                    break;
                }
            }

            if (!canPlace) {
                continue;
            }

            for (let i = 0; i < word.length; i++) {
                const row = randomRow + i * rowStep;
                const col = randomCol + i * colStep;
                const index = row * gridCols + col;
                cells[index].textContent = word[i].toUpperCase();
            }

            placed = true;
        }
    }

    for (let i = 0; i < cells.length; i++) {
        if (cells[i].textContent === "") {
            cells[i].textContent = alphabet[Math.floor(Math.random() * alphabet.length)];
        }
    }
}

createGrid();
shuffle();

const resetButton = document.querySelector("#reset-btn");
resetButton.addEventListener("click", () => {
    shuffle();
    displayWordBank();
});

const wordBank = document.querySelector("#word-bank-list");

function displayWordBank () {
    wordBank.innerHTML = "";

    for (let i = 0; i < words.length; i++) {
        const listItem = document.createElement("li");
        listItem.textContent = words[i].toUpperCase();
        listItem.addEventListener("click", () => {
            listItem.classList.toggle("crossed-out");
        });

        wordBank.appendChild(listItem);
    }
}

displayWordBank();
