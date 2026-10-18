const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const gridRows = 12;
const gridCols = 12;
const words = ["apple", "peach", "pear", "strawberry", "watermelon", "grapes", "kiwi", "banana", "pineapple", "mango"];
const gridContainer = document.querySelector(".grid-container");
let isSelecting = false;
let dragStart = null;
let activePointerId = null;
let selectedCells = [];
const foundWords = new Set();

function createGrid() {
    for (let i = 0; i < gridRows * gridCols; i++) {
        const cell = document.createElement("div");
        cell.classList.add("grid-cell");
        cell.dataset.row = Math.floor(i / gridCols);
        cell.dataset.col = i % gridCols;
        cell.textContent = "A";
        gridContainer.appendChild(cell);
    }
}

function clearSelection() {
    selectedCells.forEach(cell => cell.classList.remove("selected"));
    selectedCells = [];
}

function updateSelection(cell) {
    if (!isSelecting || !dragStart) return;

    const path = getCellsInLine(dragStart, cell);
    if (!path.length) return;

    selectedCells.forEach(el => el.classList.remove("selected"));
    selectedCells = path;
    selectedCells.forEach(el => el.classList.add("selected"));
}

function getCellsInLine(startCell, endCell) {
    const startRow = Number(startCell.dataset.row);
    const startCol = Number(startCell.dataset.col);
    const endRow = Number(endCell.dataset.row);
    const endCol = Number(endCell.dataset.col);
    const rowDistance = endRow - startRow;
    const colDistance = endCol - startCol;

    if (rowDistance !== 0 &&
        colDistance !== 0 &&
        Math.abs(rowDistance) !== Math.abs(colDistance)
    ) {
        return [];
    }

    const length = Math.max(Math.abs(rowDistance), Math.abs(colDistance));
    const rowStep = Math.sign(rowDistance);
    const colStep = Math.sign(colDistance);
    const cells = [];
    for (let i = 0; i <= length; i++) {
        const row = startRow + i * rowStep;
        const col = startCol + i * colStep;
        const index = row * gridCols + col;
        cells.push(gridContainer.children[index]);
    }

    return cells;
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

const allCells = document.querySelectorAll(".grid-cell");

allCells.forEach(cell => {
    cell.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        isSelecting = true;
        activePointerId = event.pointerId;
        dragStart = cell;
        clearSelection();
        selectedCells = [cell];
        cell.classList.add("selected");
    });
});

document.addEventListener("pointermove", (event) => {
    if (!isSelecting || event.pointerId !== activePointerId) return;

    const cell = document.elementFromPoint(event.clientX, event.clientY)?.closest(".grid-cell");
    if (cell instanceof HTMLElement) {
        updateSelection(cell);
    }
});

document.addEventListener("pointerup", (event) => {
    if (!isSelecting || event.pointerId !== activePointerId) return;

    isSelecting = false;
    activePointerId = null;

    const selectedWord = selectedCells
    .map(cell => cell.textContent.trim())
    .join("")
    .toLowerCase();

    const reversedWord = [...selectedWord].reverse().join("");

    const match = words.find(word =>
        word === selectedWord || word === reversedWord
    );

    if (match) {
        foundWords.add(match);
        selectedCells[0].classList.add("found-endpoint");
        selectedCells[selectedCells.length - 1].classList.add("found-endpoint");

        selectedCells.forEach(cell => {
            cell.classList.add("found");
            cell.classList.remove("selected");
        });

        const wordItem = document.querySelector(`[data-word="${match}"]`);
        if (wordItem) {
            wordItem.classList.add("crossed-out")
        }

        if (foundWords.size === words.length) {
            alert("Congratulations! You found all the words!");
        }

    } else {
        selectedCells.forEach(cell => cell.classList.remove("selected"));
    }

    selectedCells = [];
    dragStart = null;
});

document.addEventListener("pointercancel", (event) => {
    if (!isSelecting || event.pointerId !== activePointerId) return;

    isSelecting = false;
    activePointerId = null;
    dragStart = null;
    clearSelection();
});

shuffle();

const resetButton = document.querySelector("#reset-btn");
resetButton.addEventListener("click", () => {
    isSelecting = false;
    dragStart = null;
    selectedCells = [];

    document.querySelectorAll(".grid-cell").forEach(cell => {
        cell.classList.remove("selected");
        cell.classList.remove("found");
        cell.classList.remove("found-endpoint");
    });

    foundWords.clear();
    shuffle();
    displayWordBank();
});

const wordBank = document.querySelector("#word-bank-list");

function displayWordBank () {
    wordBank.innerHTML = "";

    for (let i = 0; i < words.length; i++) {
        const listItem = document.createElement("li");
        listItem.textContent = words[i].toUpperCase();
        listItem.dataset.word = words[i];

        wordBank.appendChild(listItem);
    }
}

displayWordBank();