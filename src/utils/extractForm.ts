export function extractForm() {
  const inputs = document.querySelectorAll("input");

  return Array.from(inputs).map((el) => {
    let labels: string[] = [];

    // Case 1: explicit <label for=...>
    if (el.id) {
      document.querySelectorAll(`label[for="${el.id}"]`).forEach((lbl) => {
        labels.push(lbl.textContent.trim());
      });
    }

    // Case 2: input wrapped in <label>
    const wrapperLabel = el.closest("label");
    if (wrapperLabel) {
      labels.push(wrapperLabel.textContent.trim());
    }

    // Case 3: aria-labelledby
    const aria = el.getAttribute("aria-labelledby");
    if (aria) {
      aria.split(" ").forEach((id: string) => {
        const lbl = document.getElementById(id);
        if (lbl) labels.push(lbl.textContent.trim());
      });
    }

    // Deduplicate + drop blanks
    labels = Array.from(new Set(labels.filter(Boolean)));

    // Build object
    const raw: Record<string, unknown> = {
      id: el.id || undefined,
      name: el.getAttribute("name") ?? undefined,
      type: el.type || "text",
      labels: labels.length > 0 ? labels : undefined,
    };

    // Drop null/empty/undefined fields
    const cleaned = Object.fromEntries(
      Object.entries(raw).filter(([_, v]) => {
        if (v == null) return false;
        if (typeof v === "string" && v.trim() === "") return false;
        if (Array.isArray(v) && v.length === 0) return false;
        return true;
      })
    );

    return cleaned;
  });
}
