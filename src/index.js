import loader from '@assemblyscript/loader';
import './style.css';

// Подключение модуля Wasm
loader.instantiate(fetch('./build/optimized.wasm')).then(({ exports }) => {
  // Функции Wasm
  const { Int32Array_ID, toImage, InitWeight } = exports;
  const { __newArray, __getArray, __pin, __unpin } = exports;

  // Константы и настройки
  let isMouseDown = false;
  let weights = [];
  let canvas = document.createElement('canvas');
  let ctx = canvas.getContext('2d');
  let currentColor = '#000000';
  const currentBg = 'white';
  const currentSize = 2;
  const canvasSize = 150; // поле

  // Кнопки
  const crossBtn = document.getElementById('cross');
  const circleBtn = document.getElementById('circle');
  const predictBtn = document.getElementById('predict');

  const buttonControl = (enable) => {
    if (enable) {
      crossBtn.disabled = false;
      circleBtn.disabled = false;
    } else {
      crossBtn.disabled = true;
      circleBtn.disabled = true;
    }
  };

  // Создать поле
  createCanvas();

  // Ивенты
  document.getElementById('clear').addEventListener('click', createCanvas);

  document.getElementById('load').addEventListener('change', (e) => load(e));

  document
    .getElementById('save')
    .addEventListener('click', () => save(weights));

  document
    .getElementById('colorpicker')
    .addEventListener('change', function () {
      currentColor = this.value;
    });

  // Преобразование в вектор
  const Train = () => {
    const data = ctx.getImageData(0, 0, canvasSize, canvasSize);
    // const arr = Array.from(data.data);

    // const array = __pin(__newArray(Int32Array_ID, arr));
    // const input = __getArray(__pin(toImage(array, canvasSize)));

    // console.log(input);

    // __unpin(array);
    // __unpin(input);

    const arr = __getArray(InitWeight(canvasSize));
    console.log(arr);
    weights = arr;
  };

  document.getElementById('init').addEventListener('click', Train);

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
    buttonControl(false);
  }

  // Загрузка весов
  function load(e) {
    const file = e.target.files[0];

    let reader = new FileReader();

    reader.readAsText(file);

    reader.onload = function () {
      let res = reader.result;

      res = res.split(',');
      res = res.map((e) => Number(e));

      console.log('Загруженные веса:');
      console.log(res);
    };

    reader.onerror = function () {
      console.log(reader.error);
    };
  }

  // Сохранение весов
  const save = (content) => {
    const a = document.createElement('a');

    const file = new Blob([content], { type: 'text/plain' });

    a.href = URL.createObjectURL(file);
    a.download = 'weights.txt';
    a.click();

    URL.revokeObjectURL(a.href);
  };

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
    buttonControl(true);
  };
});
