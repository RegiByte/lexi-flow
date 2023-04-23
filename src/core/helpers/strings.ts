export const prefixClassName = (
  className: string,
  prefix?: string | null,
  separator: string | null | undefined = "-",
): string => {
  const concretePrefix = prefix ?? "";
  const concreteSeparator = concretePrefix === "" ? "" : separator;
  return className.startsWith(`${concretePrefix}${concreteSeparator}`)
    ? className
    : `${concretePrefix}${concreteSeparator}${className}`;
};
export const prefixClassNames = (classNames: string, prefix?: string, separator?: string): string => {
  prefix ??= "";
  separator ??= "-";
  return classNames
    .split(" ")
    .filter((word) => word !== "")
    .map((word, i) => prefixClassName(word, prefix!, separator!))
    .join(" ");
};
