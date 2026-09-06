export function extractGenderRangeSegment(rangeText, gender) {
  if (!rangeText) return '';
  const text = String(rangeText);
  const hasMale = /\bM\s*:/i.test(text);
  const hasFemale = /\bF\s*:/i.test(text);
  if (!hasMale || !hasFemale) return text;

  const parts = text.split(/\||\n/).map((part) => part.trim());
  const male = parts.find((part) => /^M\s*:/i.test(part));
  const female = parts.find((part) => /^F\s*:/i.test(part));
  const chosen = gender === 'F' ? female : male;
  return (chosen || text).replace(/^[MF]\s*:\s*/i, '');
}

export function parseNumericBounds(rangeText) {
  if (!rangeText) return null;
  const text = String(rangeText).trim();

  let match = text.match(/(-?\d+(?:\.\d+)?)\s*(?:-|to)\s*(-?\d+(?:\.\d+)?)/i);
  if (match) return { low: parseFloat(match[1]), high: parseFloat(match[2]) };

  match = text.match(/(?:<=|≤|up\s*to)\s*(-?\d+(?:\.\d+)?)/i);
  if (match) return { low: -Infinity, high: parseFloat(match[1]) };

  match = text.match(/^<\s*(-?\d+(?:\.\d+)?)/);
  if (match) return { low: -Infinity, high: parseFloat(match[1]) };

  match = text.match(/(?:>=|≥)\s*(-?\d+(?:\.\d+)?)/);
  if (match) return { low: parseFloat(match[1]), high: Infinity };

  match = text.match(/^>\s*(-?\d+(?:\.\d+)?)/);
  if (match) return { low: parseFloat(match[1]), high: Infinity };

  return null;
}

export function parseNumericValue(value) {
  if (value === undefined || value === null) return null;
  const cleaned = String(value).replace(/,/g, '').trim();
  const match = cleaned.match(/-?\d+(?:\.\d+)?/);
  if (!match) return null;
  return parseFloat(match[0]);
}

export function isAbnormalResult(test, gender) {
  if (!test || !test.value) return false;

  const rangeSegment = extractGenderRangeSegment(test.referenceRange, gender);
  const bounds = parseNumericBounds(rangeSegment);
  const numericValue = parseNumericValue(test.value);
  if (bounds && numericValue !== null) {
    return numericValue < bounds.low || numericValue > bounds.high;
  }

  if (Array.isArray(test.abnormalOptions) && test.abnormalOptions.length) {
    return test.abnormalOptions.some((option) => option.trim().toLowerCase() === String(test.value).trim().toLowerCase());
  }

  return false;
}

export function isCriticalResult(test, gender) {
  if (!test || !test.value) return false;

  const hasCriticalLow = test.criticalLow !== undefined && test.criticalLow !== null && test.criticalLow !== '';
  const hasCriticalHigh = test.criticalHigh !== undefined && test.criticalHigh !== null && test.criticalHigh !== '';
  if (hasCriticalLow || hasCriticalHigh) {
    const numericValue = parseNumericValue(test.value);
    if (numericValue === null) return false;
    if (hasCriticalLow && numericValue < parseFloat(test.criticalLow)) return true;
    if (hasCriticalHigh && numericValue > parseFloat(test.criticalHigh)) return true;
    return false;
  }

  if (Array.isArray(test.criticalOptions) && test.criticalOptions.length) {
    return test.criticalOptions.some((option) => option.trim().toLowerCase() === String(test.value).trim().toLowerCase());
  }

  return false;
}

export function evaluateFormula(formula, component) {
  if (!formula || !component) return '';

  let missing = false;
  const expression = String(formula).replace(/\{([a-zA-Z0-9_-]+)\}/g, (match, id) => {
    const sibling = component.tests?.find((item) => item.id === id);
    const numericValue = sibling ? parseNumericValue(sibling.value) : null;
    if (numericValue === null) {
      missing = true;
      return '0';
    }
    return numericValue;
  });

  if (missing) return '';
  if (!/^[\d\s+\-*/().]+$/.test(expression)) return '';

  try {
    const result = Function(`"use strict"; return (${expression});`)();
    if (typeof result !== 'number' || !isFinite(result)) return '';
    return String(Math.round(result * 100) / 100);
  } catch (err) {
    return '';
  }
}

export function recalculateComponentFormulas(component) {
  if (!component || !Array.isArray(component.tests)) return component;
  const updatedTests = component.tests.map((test) => {
    if (test.formula) {
      const computed = evaluateFormula(test.formula, component);
      return { ...test, value: computed };
    }
    return test;
  });
  return { ...component, tests: updatedTests };
}
