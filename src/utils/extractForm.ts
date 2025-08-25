export function extractForm() {
  const inputs = document.querySelectorAll("input");

  console.log("inp", inputs);
  return Array.from(inputs).map((el) => ({
    tag: el.tagName.toLowerCase(),
    type: el.type || "text",
    id: el.id || null,
    name: el.getAttribute("name") || null,
    placeholder: el.placeholder || null,
    label:
      el.labels?.[0]?.innerText ||
      el.getAttribute("aria-label") ||
      el.getAttribute("title") ||
      null,
  }));
}
