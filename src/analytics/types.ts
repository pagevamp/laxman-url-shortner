export type ParsedUserAgent = {
  family: string;
  major: string;
  minor: string;
  patch: string;
  source: string;
  device: {
    family: string;
    major: string;
    minor: string;
    patch: string;
  };
};
