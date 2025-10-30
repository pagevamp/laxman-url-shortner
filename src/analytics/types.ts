export type ParsedUserAgent = {
  browser: SubString;
  source: string;
  device: SubString;
};

interface SubString {
  family: string;
  major: string;
  minor: string;
  patch: string;
}
