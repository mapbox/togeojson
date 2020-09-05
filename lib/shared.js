// cast array x into numbers
// get the content of a text node, if any
export function nodeVal(x) {
  if (x && x.normalize) {
    x.normalize();
  }
  return (x && x.textContent) || "";
}

// one Y child of X, if any, otherwise null
export function get1(x, y) {
  const n = x.getElementsByTagName(y);
  return n.length ? n[0] : null;
}