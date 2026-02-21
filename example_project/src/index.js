// Message types (it describes what can happen in the app)
const MSGS = {
  SET_NAME: "SET_NAME", // User types in name input
  SET_CAL: "SET_CAL", // User types in calories input 
  ADD: "ADD", // User clicks add button 
  CLEAR: "CLEAR", // User clicks clear all 
  REMOVE: "REMOVE", // User deletes one entry
};

// Initial state of the application (Model) 
const initModel = { name: "", cal: "", entries: [], nextId: 1 };
 
// PURE function, checks if the input are valid
const isValid = (name, cal) => name.trim() !== "" && Number.isFinite(+cal) && +cal >= 0;
const total = (entries) => entries.reduce((s, e) => s + e.cal, 0);

// PURE function, updates the model based a message
function update(msg, m) {
  switch (msg.type) {
    case MSGS.SET_NAME:
      // Return new model with updated name
      return { ...m, name: msg.value };

    case MSGS.SET_CAL:
      // Return new model with updated calorie value
      return { ...m, cal: msg.value };

    case MSGS.ADD:
      // If inout invalid, return unchanged model 
      if (!isValid(m.name, m.cal)) return m;
      // Return new model  with new entry added
      return {
        ...m,
        entries: [...m.entries, { id: m.nextId, name: m.name.trim(), cal: +m.cal }],
        nextId: m.nextId + 1,
        name: "",
        cal: "",
      };

    case MSGS.REMOVE:
      // Remove entry with matching ID
      return { ...m, entries: m.entries.filter((e) => e.id !== msg.id) };

    case MSGS.CLEAR:
      // Remove all entries
      return { ...m, entries: [] };

    default:
      return m;
  }
}
 // PURE function, create the HMTL UI based on the model 
function view(m) {
  // Generate table rows 
  const rows =
    m.entries.length === 0
      ? `<tr><td colspan="3" class="p-2 text-gray-500">Noch keine Einträge.</td></tr>`
      : m.entries
          .map(
            (e) => `
            <tr class="border-t">
              <td class="p-2">${escapeHtml(e.name)}</td>
              <td class="p-2">${e.cal}</td>
              <td class="p-2">
                <button data-remove="${e.id}"
                  class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded">
                  Löschen
                </button>
              </td>
            </tr>`
          )
          .join("");
// Return full HTML string
  return `
    <div class="flex flex-col gap-4">
      <h2 class="text-3xl font-bold">Kalorienzähler</h2>

      <div class="flex flex-col gap-2">
        <input id="name" class="border rounded px-3 py-2" placeholder="Menüname" />
        <input id="cal" class="border rounded px-3 py-2" type="number" placeholder="Kalorien" />

        <div class="flex gap-3">
          <button id="add"
            class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded disabled:opacity-50">
            Hinzufügen
          </button>
          <button id="clear"
            class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded">
            Alles löschen
          </button>
        </div>
      </div>

      <table class="w-full border rounded overflow-hidden">
        <thead class="bg-gray-100">
          <tr>
            <th class="text-left p-2">Menü</th>
            <th class="text-left p-2">Kalorien</th>
            <th class="text-left p-2">Aktion</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
        <tfoot class="bg-gray-50 border-t font-bold">
          <tr>
            <td class="p-2">Total</td>
            <td class="p-2">${total(m.entries)}</td>
            <td class="p-2"></td>
          </tr>
        </tfoot>
      </table>
    </div>
  `;
}
// Prevents HTML injections from user input
function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
 // MAIN application function
function app(node) {
  let model = initModel;
// Only re-render when table changes 
  const shouldRender = (type) =>
    type === MSGS.ADD || type === MSGS.REMOVE || type === MSGS.CLEAR;
// Updates Add button disabled state 
  const syncUI = () => {
    const addBtn = node.querySelector("#add");
    if (addBtn) addBtn.disabled = !isValid(model.name, model.cal);
  };
// Render UI into DOM
  const render = (focusAfter = false) => {
    node.innerHTML = view(model);
// Fill inputs from model 
    node.querySelector("#name").value = model.name;
    node.querySelector("#cal").value = model.cal;

    syncUI();

    if (focusAfter) node.querySelector("#name")?.focus();
  };
// Handles state updates 
  const dispatch = (msg) => {
    model = update(msg, model);

    if (shouldRender(msg.type)) {

      const focusAfter = msg.type === MSGS.ADD || msg.type === MSGS.CLEAR;
      render(focusAfter);
    } else {

      syncUI();
    }
  };
// Handle click events 
  node.addEventListener("click", (e) => {
    const t = e.target;

    if (t.id === "add") dispatch({ type: MSGS.ADD });
    if (t.id === "clear") dispatch({ type: MSGS.CLEAR });


    const removeBtn = t.closest?.("[data-remove]");
    if (removeBtn) dispatch({ type: MSGS.REMOVE, id: Number(removeBtn.dataset.remove) });
  });

  node.addEventListener("input", (e) => {
    if (e.target.id === "name") dispatch({ type: MSGS.SET_NAME, value: e.target.value });
    if (e.target.id === "cal") dispatch({ type: MSGS.SET_CAL, value: e.target.value });
  });

  render(true);
}

app(document.getElementById("app"));
