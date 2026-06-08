export function formatCash(amount: number): string {
  if (amount % 1 === 0) {
    return `$${amount.toLocaleString()}`;
  }
  return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function scrambleOptions(sequence: string[], allSymbols: string[]): string[] {
  const decoys = allSymbols.filter(s => !sequence.includes(s));
  const chosenDecoys: string[] = [];
  const availableDecoys = [...decoys];
  while (chosenDecoys.length < Math.min(3, availableDecoys.length)) {
    const idx = Math.floor(Math.random() * availableDecoys.length);
    chosenDecoys.push(availableDecoys[idx]);
    availableDecoys.splice(idx, 1);
  }

  const pool = [...sequence, ...chosenDecoys];
  let shuffled = [...pool];
  let attempts = 0;
  while (attempts < 10) {
    shuffled.sort(() => Math.random() - 0.5);
    let isIdentical = true;
    for (let i = 0; i < sequence.length; i++) {
      if (shuffled[i] !== sequence[i]) {
        isIdentical = false;
        break;
      }
    }
    if (!isIdentical) {
      break;
    }
    attempts++;
  }

  if (attempts >= 10 && shuffled.length > 1) {
    const temp = shuffled[0];
    shuffled[0] = shuffled[1];
    shuffled[1] = temp;
  }

  return shuffled;
}

