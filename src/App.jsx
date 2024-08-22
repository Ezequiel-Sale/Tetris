import { useEffect, useState } from "react";
import "./App.css";
import Swal from "sweetalert2";

function App() {
  const [score, setScore] = useState(0);
  useEffect(() => {
    const canvas = document.querySelector("canvas");
    const context = canvas.getContext("2d");
    const $score = document.querySelector("span");

    const BLOCK_SIZE = 20;
    const BOARD_WIDTH = 14;
    const BOARD_HEIGHT = 30;

    let score = 0;

    canvas.width = BLOCK_SIZE * BOARD_WIDTH;
    canvas.height = BLOCK_SIZE * BOARD_HEIGHT;

    context.scale(BLOCK_SIZE, BLOCK_SIZE);

    const board = createBoard(BOARD_WIDTH, BOARD_HEIGHT);

    function createBoard(width, height) {
      return Array(height)
        .fill()
        .map(() => Array(width).fill(0));
    }

    const piece = {
      position: { x: 6, y: 0 },
      shape: [
        [1, 1],
        [1, 1],
      ],
      color: "orange",
    };

    const PIECES = [
      {
        shape: [
          [1, 1],
          [1, 1],
        ],
        color: "yellow",
      },
      {
        shape: [[1, 1, 1, 1]],
        color: "cyan",
      },
      {
        shape: [
          [0, 1, 0],
          [1, 1, 1],
        ],
        color: "purple",
      },
      {
        shape: [
          [1, 1, 0],
          [0, 1, 1],
        ],
        color: "green",
      },
      {
        shape: [
          [1, 0],
          [1, 0],
          [1, 1],
        ],
        color: "red",
      },
      {
        shape: [
          [0, 1],
          [0, 1],
          [1, 1],
        ],
        color: "blue",
      },
      {
        shape: [
          [0, 1, 1],
          [1, 1, 0],
        ],
        color: "orange",
      },
    ];

    let dropCounter = 0;
    let lastTime = 0;
    let dropInterval = 1000;
    function update(time = 0) {
      const deltaTime = time - lastTime;
      lastTime = time;

      dropCounter += deltaTime;

      if (dropCounter > dropInterval) {
        piece.position.y++;
        dropCounter = 0;

        if (checkcollision()) {
          piece.position.y--;
          solidifyPiece();
          removeRows();
        }
      }

      draw();
      window.requestAnimationFrame(update);
    }

    function draw() {
      context.fillStyle = "#000";
      context.fillRect(0, 0, canvas.width, canvas.height);
    
      board.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value) {
            context.fillStyle = value; 
            context.fillRect(x, y, 1, 1);
          }
        });
      });
    
      piece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value) {
            context.fillStyle = piece.color;
            context.fillRect(piece.position.x + x, piece.position.y + y, 1, 1);
          }
        });
      });
    
      $score.innerText = score;
    }

    function adjustSpeed() {
      if (score % 50 === 0 && score !== 0) {
        dropInterval = Math.max(100, dropInterval - 100); // Reduce el intervalo de caída, pero no menos de 100ms
      }
    }

    function movePieceLeft() {
      piece.position.x--;
      if (checkcollision()) {
        piece.position.x++;
      }
    }

    function movePieceRight() {
      piece.position.x++;
      if (checkcollision()) {
        piece.position.x--;
      }
    }

    function movePieceDown() {
      piece.position.y++;
      if (checkcollision()) {
        piece.position.y--;
        solidifyPiece();
        removeRows();
      }
    }
    function rotatePiece() {
      const rotated = [];
      for (let i = 0; i < piece.shape[0].length; i++) {
        const row = [];
        for (let j = piece.shape.length - 1; j >= 0; j--) {
          row.push(piece.shape[j][i]);
        }
        rotated.push(row);
      }
      const previousShape = piece.shape;
      piece.shape = rotated;

      if (checkcollision()) {
        piece.shape = previousShape;
      }
    }

    document.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") movePieceLeft();
      if (e.key === "ArrowRight") movePieceRight();
      if (e.key === "ArrowDown") movePieceDown();
      if (e.key === "ArrowUp") rotatePiece();
    });

    function checkcollision() {
      return piece.shape.find((row, y) => {
        return row.find((value, x) => {
          return (
            value !== 0 &&
            board[y + piece.position.y]?.[x + piece.position.x] !== 0
          );
        });
      });
    }

    function solidifyPiece() {
      piece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value === 1) {
            board[y + piece.position.y][x + piece.position.x] = piece.color;
          }
        });
      });
    
      piece.position.x = Math.floor(BOARD_WIDTH / 2 - 2);
      piece.position.y = 0;
      const randomIndex = Math.floor(Math.random() * PIECES.length);
      piece.shape = PIECES[randomIndex].shape;
      piece.color = PIECES[randomIndex].color;
    
      if (checkcollision()) {
        Swal.fire({
          title: "Perdiste!",
          text: `Tu puntaje fue de ${score}`,
          background: "#000",
          color: "#fff",
          width: 300,
          confirmButtonText: "Reintentar",
          position: "center",
        });
        board.forEach((row) => row.fill(0));
        score = 0;
      }
    }

    document
      .getElementById("arrowLeft")
      .addEventListener("click", movePieceLeft);
    document
      .getElementById("arrowRight")
      .addEventListener("click", movePieceRight);
    document.getElementById("turnPiece").addEventListener("click", rotatePiece);
    document
      .getElementById("arrowDown")
      .addEventListener("click", movePieceDown);
    function removeRows() {
      const rowsToRemove = [];

      board.forEach((row, y) => {
        if (row.every((value) => value !== 0)) {
          rowsToRemove.push(y);
        }
      });
      rowsToRemove.forEach((y) => {
        board.splice(y, 1);
        const newRow = Array(BOARD_WIDTH).fill(0);
        board.unshift(newRow);
        setScore((score += 10));
      });
      adjustSpeed();
    }

    const $section = document.querySelector("section");
    $section.addEventListener("click", () => {
      update();
      $section.remove();
      const audio = new window.Audio("./tetris.mp3");
      audio.volume = 0.5;
      audio.play();
    });
  }, []);

  return (
    <>
      <div>
        <strong className="score">
          Puntuación: <span>{score}</span>
        </strong>
        <div>
            <section>
              <span>COMENZAR JUEGO</span>
            </section>
          <canvas></canvas>
        </div>
        <div className="controls">
          <label>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M5 12l14 0" />
              <path d="M5 12l6 6" />
              <path d="M5 12l6 -6" />
            </svg>
            <input type="button" id="arrowLeft" hidden />
          </label>
          <label>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M12 5l0 14" />
              <path d="M18 13l-6 6" />
              <path d="M6 13l6 6" />
            </svg>
            <input type="button" id="arrowDown" hidden />
          </label>
          <label>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M5 12l14 0" />
              <path d="M13 18l6 -6" />
              <path d="M13 6l6 6" />
            </svg>
            <input type="button" id="arrowRight" hidden />
          </label>
          <label>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M19.933 13.041a8 8 0 1 1 -9.925 -8.788c3.899 -1 7.935 1.007 9.425 4.747" />
              <path d="M20 4v5h-5" />
            </svg>
            <input type="button" id="turnPiece" hidden />
          </label>
        </div>
      </div>
    </>
  );
}

export default App;
