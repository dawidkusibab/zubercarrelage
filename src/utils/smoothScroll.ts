/**
 * Smoothly scrolls to a section identified by a CSS selector (e.g. "#contact").
 * @param href    - A valid CSS selector string pointing to the target element.
 * @param offset  - Pixels to subtract from the element's top (for fixed headers). Default: 75.
 */
export function smoothScrollTo(href: string, offset = 75): void {
  const target = document.querySelector<HTMLElement>(href);
  if (target) {
    window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
  }
}
