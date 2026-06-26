const React = require("react");

function makeIcon(name) {
  const Icon = (props) =>
    React.createElement("icon", { "data-icon": name, ...props });
  Icon.displayName = name;
  return Icon;
}

const IoFilterOutline = makeIcon("IoFilterOutline");
const IoFilterSharp = makeIcon("IoFilterSharp");

module.exports = {
  __esModule: true,
  IoFilterOutline,
  IoFilterSharp,
  // Generic fallback so any other icon import still works.
  default: makeIcon("Icon"),
};
