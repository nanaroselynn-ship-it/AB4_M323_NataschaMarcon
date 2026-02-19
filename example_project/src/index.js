const MSGS = {
  INCREASE: "INCREASE",
  DECREASE: "DECREASE",
};

function update(msg, model) {
  switch (msg) {
    case MSGS.INCREASE:
      return { ...model, count: model.count + 1 };
    case MSGS.DECREASE:
      return { ...model, count: model.count - 1 };
    default:
      return model;
  }
}

function el(tag, props = {}, children = []) {
  const element = document.createElement(tag);
  for (let key in props) {
    if (key.startsWith("on")) {
      element.addEventListener(key.slice(2).toLowerCase(), props[key]);
    } else {
      element[key] = props[key];
    }
  }
  children.forEach((child) => {
    if (typeof child === "string") {
      element.appendChild(document.createTextNode(child));
    } else {
      element.appendChild(child);
    }
  });
  return element;
}

const div = (props, children) => el("div", props, children);
const h2 = (props, children) => el("h2", props, [children]);
const button = (props, children) => el("button", props, [children]);

const btnStyle = "px-4 py-2 bg-blue-500 text-white rounded";

function view(dispatch, model) {
  return div({ className: "flex flex-col items-center gap-6" }, [
    h2({ className: "text-4xl font-bold" }, `Count: ${model.count}`),
    div({ className: "flex gap-4" }, [
      button(
        { className: btnStyle, onclick: () => dispatch(MSGS.INCREASE) },
        "+ Increase"
      ),
      button(
        { className: btnStyle, onclick: () => dispatch(MSGS.DECREASE) },
        "- Decrease"
      ),
    ]),
  ]);
}

function app(initModel, update, view, node) {
  let model = initModel;

  function dispatch(msg) {
    model = update(msg, model);
    render();
  }

  function render() {
    node.innerHTML = "";
    node.appendChild(view(dispatch, model));
  }

  render();
}

app({ count: 0 }, update, view, document.getElementById("app"));
