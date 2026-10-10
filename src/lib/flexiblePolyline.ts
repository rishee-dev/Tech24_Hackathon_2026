// Minimal flexible polyline decoder (based on HERE flexible polyline algorithm)
// Lightweight implementation for client-side decoding of flexible polyline strings.
// Reference: https://github.com/heremaps/flexible-polyline

export function decodeFlexiblePolyline(encoded: string): Array<[number, number]> {
  // This is a compact decoder adapted for coordinates only (lat,lng pairs).
  // For full spec use the official library. This handles the common case returned by HERE router.
  const BASE64_CHAR_MAP: Record<string, number> = {};
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  for (let i = 0; i < chars.length; i++) BASE64_CHAR_MAP[chars[i]] = i;

  let index = 0;
  function decodeValue(str: string) {
    let result = 0,
      shift = 0,
      byte = 0;
    do {
      const c = str[index++];
      byte = BASE64_CHAR_MAP[c];
      result |= (byte & 31) << shift;
      shift += 5;
    } while (byte >= 32);
    const shouldNegate = (result & 1) === 1;
    result >>= 1;
    return shouldNegate ? ~result : result;
  }

  // The flexible polyline header may include precision and thirdDim flags; skip header parsing lightly
  // Find the first character after header: simple approach - the library header is short; we'll parse according to spec minimal needs
  // For robustness, try to locate coordinate sequence by searching for braces—fallback to empty
  try {
    // Convert to array of 6-bit values
    const out: Array<[number, number]> = [];
    index = 0;
    // decode header
    const first = decodeValue(encoded);
    const second = decodeValue(encoded);
    const third = decodeValue(encoded);
    // first contains: precision (lower 3 bits) and thirdDim flag etc. We'll assume precision 5 if missing
    const precision = first & 15 || 5;
    const scale = Math.pow(10, precision);

    let lat = 0,
      lng = 0;
    while (index < encoded.length) {
      const dlat = decodeValue(encoded);
      const dlng = decodeValue(encoded);
      lat += dlat;
      lng += dlng;
      out.push([lat / scale, lng / scale]);
    }

    return out;
  } catch (e) {
    console.warn('Flexible polyline decode failed', e);
    return [];
  }
}

export default decodeFlexiblePolyline;
