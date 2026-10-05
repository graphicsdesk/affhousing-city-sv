/**
 * Resizer script to toggle between pre-generated SVG artboards for
 * responsiveness. Adapted from:
 * https://github.com/newsdev/ai2html/blob/gh-pages/_includes/resizer-script.html
 *
 * Each artboard is shown when the width of its container falls within its
 * breakpoint range below. Artboard 1 = desktop, 2 = tablet, 3 = mobile.
 */

import artboard1 from '../assets/artboard-1.svg';
import artboard2 from '../assets/artboard-2.svg';
import artboard3 from '../assets/artboard-3.svg';

const BREAKPOINTS = {
  1: { min: 600, max: Infinity },
  2: { min: 400, max: 599 },
  3: { min: 0, max: 399 },
};

const SVG_URLS = { 1: artboard1, 2: artboard2, 3: artboard3 };

/**
 * Inline each SVG into its artboard so the text picks up the page's fonts
 * (an SVG loaded through <img> can't use web fonts).
 */
function loadArtboards() {
  const artboards = document.querySelectorAll('.svg-artboard[data-artboard]');

  artboards.forEach(el => {
    fetch(SVG_URLS[el.getAttribute('data-artboard')])
      .then(res => res.text())
      .then(svg => {
        el.innerHTML = svg;
      });
  });
}

function resizer() {
  const containers = document.querySelectorAll('.svg-graphic');

  containers.forEach(container => {
    const width = container.getBoundingClientRect().width;
    const artboards = container.querySelectorAll('.svg-artboard[data-artboard]');

    artboards.forEach(el => {
      const range = BREAKPOINTS[el.getAttribute('data-artboard')];
      const visible = range && width >= range.min && width <= range.max;
      el.style.display = visible ? 'block' : 'none';
    });
  });
}

// Export SVG resizer initialization to page.js
export default function () {
  // only want one resizer on the page
  if (document.documentElement.classList.contains('svg-resizer-init')) return;
  document.documentElement.classList.add('svg-resizer-init');

  loadArtboards();
  resizer();
  window.addEventListener('resize', throttle(resizer, 200));
}

/**
 * Throttle function adapted from underscore.js.
 *
 * Copyright (c) 2009-2020 Jeremy Ashkenas, DocumentCloud and Investigative
 * Reporters & Editors
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 * Terms
 */

function throttle(func, wait, options = {}) {
  let timeout, context, args, result;
  let previous = 0;

  const now = Date.now || (() => new Date().getTime());

  const later = function () {
    previous = options.leading === false ? 0 : now();
    timeout = null;
    result = func.apply(context, args);
    if (!timeout) context = args = null;
  };

  const throttled = function () {
    const _now = now();
    if (!previous && options.leading === false) previous = _now;
    const remaining = wait - (_now - previous);
    context = this;
    args = arguments;
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = _now;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining);
    }
    return result;
  };

  return throttled;
}
