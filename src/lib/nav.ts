/** Match nav links without highlighting parent routes on child pages. */
export function isNavActive(
  pathname: string,
  href: string,
  exactRoots: string[] = ["/dashboard", "/admin"]
): boolean {
  if (pathname === href) return true;
  if (exactRoots.includes(href)) return false;
  return pathname.startsWith(`${href}/`);
}
