export const checkUrl = (expiryTime: Date) => {
  console.log(expiryTime, new Date(Date.now()));
  if (expiryTime < new Date(Date.now())) {
    return false;
  }
  return true;
};
