// src/data/layoutPatterns.js
const tutorialBasic = [
  [
    '01111110',
    '11111111',
    '01111110'
  ],
  [
    '00111100',
    '01111110',
    '00111100'
  ],
  [
    '00011000',
    '00111100',
    '00011000'
  ]
];

const bridge = [
  [
    '000111000',
    '001111100',
    '011111110',
    '011111110',
    '001111100',
    '000111000'
  ],
  [
    '000011000',
    '000111000',
    '001111100',
    '001111100',
    '000111000',
    '000011000'
  ],
  [
    '000001000',
    '000011000',
    '000111000',
    '000011000',
    '000001000'
  ]
];

const courtyard = [
  [
    '000111000',
    '001111100',
    '011111110',
    '011001110',
    '011111110',
    '001111100',
    '000111000'
  ],
  [
    '000010000',
    '000111000',
    '001101100',
    '001111100',
    '001101100',
    '000111000',
    '000010000'
  ],
  [
    '000000000',
    '000011000',
    '000111000',
    '000111000',
    '000111000',
    '000011000',
    '000000000'
  ]
];

export const LAYOUT_PATTERNS = {
  tutorialBasic,
  bridge,
  courtyard
};

export const LAYOUT_KEYS = Object.keys(LAYOUT_PATTERNS);

export function pickRandomLayoutKey(excludeKey) {
  const candidates = excludeKey
    ? LAYOUT_KEYS.filter(key => key !== excludeKey)
    : LAYOUT_KEYS;
  const index = Math.floor(Math.random() * candidates.length);
  return candidates[index] ?? LAYOUT_KEYS[0];
}

export function patternToSlots(pattern) {
  const slots = [];
  pattern.forEach((layerRows, layer) => {
    layerRows.forEach((row, y) => {
      row.split('').forEach((cell, x) => {
        if (cell === '1') {
          slots.push({ layer, x, y });
        }
      });
    });
  });
  return slots;
}
