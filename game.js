const GRID_SIZE = 10;
const MINE_COUNT = 15;

let grid = [];
let gameOver = false;
let isFlagMode = false;
let isFirstClick = true;

function startGame() {
    // Make the grid visible
    document.getElementById('grid').style.display = 'inline-grid';
    
    gameOver = false;
    isFirstClick = true;
    grid = [];
    
    // Create empty grid
    for (let i = 0; i < GRID_SIZE; i++) {
        grid[i] = [];
        for (let j = 0; j < GRID_SIZE; j++) {
            grid[i][j] = {
                isMine: false,
                revealed: false,
                flagged: false,
                neighborMines: 0
            };
        }
    }
    renderGrid();
}

function initializeMines(firstX, firstY) {
    // Place mines avoiding first click area
    let minesPlaced = 0;
    while (minesPlaced < MINE_COUNT) {
        const x = Math.floor(Math.random() * GRID_SIZE);
        const y = Math.floor(Math.random() * GRID_SIZE);
        
        if (!grid[x][y].isMine && !isSurrounding(x, y, firstX, firstY)) {
            grid[x][y].isMine = true;
            minesPlaced++;
        }
    }

    // Calculate neighbor mines
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            grid[i][j].neighborMines = countNeighborMines(i, j);
        }
    }
}

function isSurrounding(x, y, centerX, centerY) {
    // Check if coordinates are around center point
    return Math.abs(x - centerX) <= 1 && Math.abs(y - centerY) <= 1;
}

function countNeighborMines(x, y) {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (x + i >= 0 && x + i < GRID_SIZE && y + j >= 0 && y + j < GRID_SIZE) {
                if (grid[x + i][y + j].isMine) count++;
            }
        }
    }
    return count;
}

function revealCell(x, y) {
    // If game is over or cell is flagged, do nothing
    if (gameOver || grid[x][y].flagged) return;

    const cell = grid[x][y];

    // First click handling
    if (isFirstClick) {
        isFirstClick = false;
        initializeMines(x, y);
        cell.revealed = true;
        if (cell.neighborMines === 0) {
            revealSurroundingCells(x, y);
        }
    } 
    // Clicked on revealed number
    else if (cell.revealed && cell.neighborMines > 0) {
        const flagCount = countSurroundingFlags(x, y);
        
        // If flag count matches neighbor mines
        if (flagCount === cell.neighborMines) {
            if (checkFlagsCorrect(x, y)) {
                revealSurroundingCells(x, y);
            } else {
                gameOver = true;
                alert('Wrong Flag! Game Over!');
                revealAllMines();
            }
        }
    }
    // Normal cell reveal
    else if (!cell.revealed) {
        cell.revealed = true;
        if (cell.isMine) {
            gameOver = true;
            alert('Game Over!');
            revealAllMines();
            return;
        }
        if (cell.neighborMines === 0) {
            revealSurroundingCells(x, y);
        }
    }

    renderGrid();
    checkWin();
}

// Çevredeki bayrakları say
function countSurroundingFlags(x, y) {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (x + i >= 0 && x + i < GRID_SIZE && y + j >= 0 && y + j < GRID_SIZE) {
                if (grid[x + i][y + j].flagged) {
                    count++;
                }
            }
        }
    }
    return count;
}

// Bayrakların doğru konulup konulmadığını kontrol et
function checkFlagsCorrect(x, y) {
    // Check if all flags are correctly placed
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (x + i >= 0 && x + i < GRID_SIZE && y + j >= 0 && y + j < GRID_SIZE) {
                const cell = grid[x + i][y + j];
                if (cell.flagged && !cell.isMine) {
                    return false;
                }
            }
        }
    }
    return true;
}

// Çevredeki hücreleri aç
function revealSurroundingCells(x, y) {
    // Reveal all surrounding cells
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (x + i >= 0 && x + i < GRID_SIZE && y + j >= 0 && y + j < GRID_SIZE) {
                const cell = grid[x + i][y + j];
                if (!cell.revealed && !cell.flagged) {
                    cell.revealed = true;
                    if (cell.neighborMines === 0) {
                        revealSurroundingCells(x + i, y + j);
                    }
                }
            }
        }
    }
}

function revealAllMines() {
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            if (grid[i][j].isMine) {
                grid[i][j].revealed = true;
            }
        }
    }
    renderGrid();
}

function renderGrid() {
    const gridElement = document.getElementById('grid');
    gridElement.innerHTML = '';
    gridElement.style.gridTemplateColumns = `repeat(${GRID_SIZE}, 40px)`;

    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            
            if (grid[i][j].revealed) {
                cell.classList.add('revealed');
                if (grid[i][j].isMine) {
                    cell.classList.add('mine');
                    cell.textContent = '💣';
                } else if (grid[i][j].neighborMines > 0) {
                    cell.textContent = grid[i][j].neighborMines;
                    cell.setAttribute('data-neighbors', grid[i][j].neighborMines);
                }
            } else if (grid[i][j].flagged) {
                cell.classList.add('flagged');
                cell.textContent = '🚩';
            }

            cell.addEventListener('click', (e) => {
                if (isFlagMode) {
                    toggleFlag(i, j);
                } else {
                    revealCell(i, j);
                }
            });
            
            gridElement.appendChild(cell);
        }
    }
}

function toggleFlagMode() {
    isFlagMode = !isFlagMode;
    const flagBtn = document.querySelector('.flag-btn');
    const flagStatus = document.querySelector('.flag-status');
    
    flagBtn.classList.toggle('active');
    flagStatus.textContent = `FLAG: ${isFlagMode ? 'ON' : 'OFF'}`;
}

document.getElementById('darkmode-toggle').addEventListener('change', function() {
    document.body.classList.toggle('dark-mode');
});

function toggleFlag(x, y) {
    // Toggle flag if game is not over and cell is not revealed
    if (!gameOver && !grid[x][y].revealed) {
        grid[x][y].flagged = !grid[x][y].flagged;
        renderGrid();
    }
}

// Kazanma kontrolü ekleyelim
function checkWin() {
    // Check if all non-mine cells are revealed
    let allNonMinesRevealed = true;
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            const cell = grid[i][j];
            if (!cell.isMine && !cell.revealed) {
                allNonMinesRevealed = false;
                break;
            }
        }
    }
    
    if (allNonMinesRevealed) {
        gameOver = true;
        alert('Congratulations! You Won!');
    }
}

// Oyunu başlat
startGame(); 