import loader from '@assemblyscript/loader';
import './style.css';

// Подключение модуля Wasm

loader.instantiate(fetch('./build/optimized.wasm'), {}).then(({ exports }) => {
  // Функции Wasm

  const { sum, Int32Array_ID, returnArr, getClearArray } = exports;
  const { __newArray, __getArray, __getArrayView, __pin, __unpin } = exports;

  const array = __pin(__newArray(Int32Array_ID, [1, 2, 3]));

  const result = returnArr(array);
  const getArrayRes = __getArray(result);

  console.log(getArrayRes);

  __unpin(array);

  // Константы и настройки

  let isMouseDown = false;
  let canvas = document.createElement('canvas');
  let ctx = canvas.getContext('2d');
  let currentColor = '#000000';
  const currentBg = 'white';
  const currentSize = 2;
  const canvasSize = 80; // поле 80x80

  // Создать поле

  createCanvas();

  // Кнопки

  document.getElementById('clear').addEventListener('click', createCanvas);

  document
    .getElementById('colorpicker')
    .addEventListener('change', function () {
      currentColor = this.value;
    });

  // Преобразование в вектор
  const toImage = () => {
    const input = __getArray(__pin(getClearArray(canvasSize)));
    const data = ctx.getImageData(0, 0, canvasSize, canvasSize);

    function getPixel(imgData, index) {
      let i = index * 4,
        d = imgData.data;
      return [d[i], d[i + 1], d[i + 2], d[i + 3]]; // массив [R,G,B,A]
    }

    function getPixelXY(imgData, x, y) {
      return getPixel(imgData, y * imgData.width + x);
    }

    for (let x = 0, indexInput = 0; x < canvasSize; x++) {
      for (let y = 0; y < canvasSize; y++, indexInput++) {
        let rgba = getPixelXY(data, x, y);
        if (JSON.stringify(rgba) != JSON.stringify([255, 255, 255, 255])) {
          input[indexInput] = 1;
        }
      }
    }

    console.log(input);

    __unpin(input);
  };

  document.getElementById('train').addEventListener('click', toImage);

  // Рисование

  canvas.addEventListener('mousedown', (event) => mousedown(canvas, event));
  canvas.addEventListener('mousemove', (event) => mousemove(canvas, event));
  canvas.addEventListener('mouseup', () => mouseup());

  // Создание поля

  function createCanvas() {
    canvas.id = 'canvas';
    canvas.width = parseInt(canvasSize);
    canvas.height = parseInt(canvasSize);
    canvas.style.zIndex = 8;
    canvas.style.border = '1px solid';
    ctx.fillStyle = currentBg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    let main = document.getElementById('main');
    main.appendChild(canvas);
  }

  // Загрузка рисунка

  function load() {
    linesArray = JSON.parse(localStorage.savedCanvas);
    let lines = JSON.parse(localStorage.getItem('savedCanvas'));
    for (let i = 1; i < lines.length; i++) {
      ctx.beginPath();
      ctx.moveTo(linesArray[i - 1].x, linesArray[i - 1].y);
      ctx.lineWidth = linesArray[i].size;
      ctx.lineCap = 'round';
      ctx.strokeStyle = linesArray[i].color;
      ctx.lineTo(linesArray[i].x, linesArray[i].y);
      ctx.stroke();
    }
  }

  // Позиция мыши

  function getMousePos(canvas, evt) {
    let rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top,
    };
  }

  // Кнопка мыши зажата

  function mousedown(canvas, evt) {
    isMouseDown = true;
    let currentPosition = getMousePos(canvas, evt);
    ctx.moveTo(currentPosition.x, currentPosition.y);
    ctx.beginPath();
    ctx.lineWidth = currentSize;
    ctx.lineCap = 'round';
    ctx.strokeStyle = currentColor;
  }

  // Процесс рисования

  function mousemove(canvas, evt) {
    if (isMouseDown) {
      let currentPosition = getMousePos(canvas, evt);
      ctx.lineTo(currentPosition.x, currentPosition.y);
      ctx.stroke();
    }
  }

  // Кнопку мыши отпустили

  const mouseup = () => {
    isMouseDown = false;
  };
});
