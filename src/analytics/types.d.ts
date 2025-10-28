declare module 'geoip-lite' {
  type GeoLocation = {
    range: [number, number];
    country: string;
    region: string;
    city: string;
    ll: [number, number];
    metro?: number;
    zip?: string;
  };

  function lookup(ip: string): GeoLocation | null;

  export { lookup };
}
