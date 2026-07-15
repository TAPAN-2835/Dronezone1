export function getMapSearchUrl(location: string, city?: string): string {
  const query = encodeURIComponent(city ? `${location}, ${city}, India` : `${location}, India`);
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

export function getMapEmbedUrl(location: string, city?: string): string {
  const query = encodeURIComponent(city ? `${location}, ${city}, India` : `${location}, India`);
  return `https://maps.google.com/maps?q=${query}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
}
