import { Position, MarkerType } from '@xyflow/react';

export function getEdgeParams(source, target) {
  const sourceCenter = {
    x: source.internals.positionAbsolute.x + source.measured.width / 2,
    y: source.internals.positionAbsolute.y + source.measured.height / 2,
  };

  const targetCenter = {
    x: target.internals.positionAbsolute.x + target.measured.width / 2,
    y: target.internals.positionAbsolute.y + target.measured.height / 2,
  };

  const dx = targetCenter.x - sourceCenter.x;
  const dy = targetCenter.y - sourceCenter.y;

  const angle = Math.atan2(dy, dx);

  const sourceRadius = Math.min(source.measured.width, source.measured.height) / 2;
  const targetRadius = Math.min(target.measured.width, target.measured.height) / 2;

  const sx = sourceCenter.x + sourceRadius * Math.cos(angle);
  const sy = sourceCenter.y + sourceRadius * Math.sin(angle);
  const tx = targetCenter.x - targetRadius * Math.cos(angle);
  const ty = targetCenter.y - targetRadius * Math.sin(angle);

  return {
    sx,
    sy,
    tx,
    ty,
  };
}

export function createNodesAndEdges() {
  const nodes = [];
  const edges = [];
  const center = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

  nodes.push({ id: 'target', data: { label: 'Target' }, position: center });

  for (let i = 0; i < 8; i++) {
    const degrees = i * (360 / 8);
    const radians = degrees * (Math.PI / 180);
    const x = 250 * Math.cos(radians) + center.x;
    const y = 250 * Math.sin(radians) + center.y;

    nodes.push({ id: `${i}`, data: { label: 'Source' }, position: { x, y } });

    edges.push({
      id: `edge-${i}`,
      target: 'target',
      source: `${i}`,
      type: 'floating',
      markerEnd: {
        type: MarkerType.Arrow,
      },
    });
  }

  return { nodes, edges };
}

// Функция для преобразования цвета в HEX
export function toHexColor(color) {
  // Если цвет уже в HEX-формате и корректный, возвращаем его
  if (/^#[0-9A-F]{6}$/i.test(color)) {
    return color;
  }

  // Создаём временный элемент для получения цвета
  const tempDiv = document.createElement('div');
  tempDiv.style.backgroundColor = color;
  document.body.appendChild(tempDiv);
  const computedColor = window.getComputedStyle(tempDiv).backgroundColor;
  document.body.removeChild(tempDiv);

  // Парсим RGB-цвет (например, "rgb(255, 0, 0)") в HEX
  const rgbMatch = computedColor.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  if (rgbMatch) {
    const [, r, g, b] = rgbMatch;
    const toHex = (num) => parseInt(num).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  // Если цвет не распознан, возвращаем null
  return null;
}

// Функция для вычисления гармоничного цвета границы
export function getHarmoniousBorderColor(color) {
  // Преобразуем цвет в HEX
  const hexColor = toHexColor(color);
  if (!hexColor) {
    return null; // Возвращаем null, если цвет невалиден
  }
  
  // Парсим цвет в формате #RRGGBB
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Вычисляем яркость (luminance) для определения, тёмный или светлый цвет
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Если цвет светлый (luminance > 0.5), затемняем его, иначе осветляем
  const factor = luminance > 0.5 ? 0.7 : 1.3; // Затемнение на 30% или осветление на 30%

  const newR = Math.min(255, Math.max(0, Math.round(r * factor)));
  const newG = Math.min(255, Math.max(0, Math.round(g * factor)));
  const newB = Math.min(255, Math.max(0, Math.round(b * factor)));

  // Преобразуем обратно в hex
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}

// Функция для вычисления контрастного цвета текста
export function getContrastTextColor(bgColor) {
  const hexColor = toHexColor(bgColor);
  if (!hexColor) {
    return '#000000'; // Возвращаем чёрный по умолчанию, если цвет невалиден
  }

  // Парсим HEX-цвет
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Вычисляем яркость (luminance)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Если яркость меньше 0.5, возвращаем белый текст, иначе чёрный
  return luminance < 0.5 ? '#ffffff' : '#000000';
}