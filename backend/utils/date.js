const toSqlDateTime = (date = new Date()) => {
  const value = new Date(date);
  const pad = (part) => String(part).padStart(2, "0");

  return [
    value.getFullYear(),
    pad(value.getMonth() + 1),
    pad(value.getDate())
  ].join("-") + " " + [
    pad(value.getHours()),
    pad(value.getMinutes()),
    pad(value.getSeconds())
  ].join(":");
};

module.exports = { toSqlDateTime };
