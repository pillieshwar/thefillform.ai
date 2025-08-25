(() => {
  console.log("Form extractor script injected ✅");

  const inputs = document.querySelectorAll<
    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  >("input, textarea, select");

  const schema = Array.from(inputs).map((el) => {
    return {
      tag: el.tagName.toLowerCase(),
      type: (el as HTMLInputElement).type || "text",
      id: el.id || null,
      name: el.getAttribute("name") || null,
      placeholder: el.getAttribute("placeholder") || null,
      label:
        el.labels?.[0]?.innerText ||
        el.getAttribute("aria-label") ||
        el.getAttribute("title") ||
        null,
    };
  });

  chrome.runtime.sendMessage({ type: "FORM_SCHEMA", schema });
})();
