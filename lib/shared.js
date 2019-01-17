// cast array x into numbers
// get the content of a text node, if any
export function nodeVal(x) {
  if (x && x.normalize) {
    x.normalize();
  }
  return (x && x.textContent) || "";
}
