export function populateForm(fields: Record<string, string>) {
  const inputs = document.querySelectorAll<
    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  >("input, textarea, select");

  inputs.forEach((input) => {
    const key = input.name || input.id;

    if (key && fields[key] !== undefined) {
      // Fill value
      (input as HTMLInputElement | HTMLTextAreaElement).value = fields[key];

      // Dispatch events so frameworks (React, Angular, Vue) detect change
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
    }
  });
}
