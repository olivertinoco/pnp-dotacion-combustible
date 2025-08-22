export const getTimestamp = () => {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");

  const year = now.getFullYear();
  const month = pad(now.getMonth() + 1);
  const day = pad(now.getDate());
  const hour = pad(now.getHours());
  const minute = pad(now.getMinutes());
  const second = pad(now.getSeconds());
  const millis = String(now.getMilliseconds()).padStart(3, "0");

  return `${year}${month}${day}.${hour}.${minute}.${second}.${millis}`;
};
