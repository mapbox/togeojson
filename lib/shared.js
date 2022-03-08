/**
 * cast array x into numbers
 * get the content of a text node, if any
 *
 * @param {Element | null} x
 */
export function nodeVal(x) {
  if (x && x.normalize) {
    x.normalize();
  }
  return (x && x.textContent) || "";
}

/**
 * one Y child of X, if any, otherwise null
 *
 * @param {Element} x
 * @param {string} y
 * @returns {Element | null}
 */
export function get1(x, y) {
  const n = x.getElementsByTagName(y);
  return n.length ? n[0] : null;
}

