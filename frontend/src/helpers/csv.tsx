export function truncate(value: string, length: number, endWith?: string) {
  return value.length > length
    ? value.substring(0, length) + (endWith || "")
    : value;
}

export function divNewlines(value: string) {
  const strings = value.split("\n");

  return (
    <>
      {strings.map((part) => {
        return <div>{part}</div>;
      })}
    </>
  );
}
