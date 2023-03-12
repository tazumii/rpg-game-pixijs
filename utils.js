export function NormalizeVector(vector) {
    let magnitude = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
    (vector.x = vector.x / magnitude), (vector.y = vector.y / magnitude);
  }
  