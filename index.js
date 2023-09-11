import scrollIntoView from "./scrollIntoView.js";

window.scrollIntoView = scrollIntoView;

document.addEventListener("DOMContentLoaded", () => {
  ui();
})

function nsResolver(prefix) {
  const ns = {
    svg: "http://www.w3.org/2000/svg"
  };
  return ns[prefix] || null;
}

function handleFileContent(content) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, "text/xml");
    const errorNode = doc.querySelector('parsererror');
    if (errorNode) {
        throw "Failed to parse SVG";
    }
    return doc;
}

function handleFileUpload(file) {
    file.text().then(handleFileContent).catch(alert).then((svgDoc) => {
      const svgFrame = document.getElementById("svg-target");
      svgFrame.appendChild(svgDoc.activeElement);

      const details = document.getElementById("node-listing-details");
      details.classList.remove("hidden");
    }).catch(alert);
}

function ui() {
  const dragTarget = document.getElementById("drag-target");
  const fileInput = document.getElementById("svg-file");
  const queryForm = document.getElementById("query-form");

  fileInput.addEventListener("change", (e) => {
    if (fileInput.files) {
      if(fileInput.files.length > 1) {
        alert("Only 1 file at a time!");
        return;
      }
      [...fileInput.files].forEach((file, i) => {
        if (file.name.endsWith(".svg")) {
          handleFileUpload(file);
        }
      });
    }
  });

  dragTarget.addEventListener("drop", (e) => {
    e.preventDefault();
    dragTarget.classList.remove("dragging");

    if (e.dataTransfer.files) {
      if(e.dataTransfer.files.length > 1) {
        alert("Only 1 file at a time!");
        return;
      }
      [...e.dataTransfer.files].forEach((file, i) => {
        console.log(file.type);
        if (file.name.endsWith(".svg")) {
          handleFileUpload(file);
        }
      });
    }
  });

  dragTarget.addEventListener("dragenter", (e) => {
    e.preventDefault();
    dragTarget.classList.add("dragging");
  });
  dragTarget.addEventListener("dragover", (e) => {
    e.preventDefault();
  });
  dragTarget.addEventListener("dragleave", (e) => {
    e.preventDefault();
    dragTarget.classList.remove("dragging");
  });

  dragTarget.classList.remove("disabled");

  queryForm.addEventListener("submit", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const nodeQueryInput = queryForm.elements.namedItem("node-xpath")
    const titleQueryInput = queryForm.elements.namedItem("title-xpath");

    const nodeQuery = nodeQueryInput.value;
    const titleQuery = titleQueryInput.value;
    const nodeListing = document.getElementById("node-listing");
    const svg = document.getElementById("svg-target").children[0];

    nodeListing.replaceChildren();
    const xpathResult = document.evaluate(nodeQuery, svg, nsResolver, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
    const nodeMap = [];
    for (let i = 0; i < xpathResult.snapshotLength; i++) {
      const node = xpathResult.snapshotItem(i);
      const title = document.evaluate(titleQuery, node, nsResolver, XPathResult.STRING_TYPE, null);

      const li = document.createElement("li");
      const button = document.createElement("button");
      button.textContent = title.stringValue;
      button.type = "button";
      button.value = node.id;
      button.addEventListener("click", (e) => {
        const n = document.getElementById(button.value);
        scrollIntoView(n);
      });
      li.appendChild(button);
      nodeMap.push([title.stringValue, li])
    }
    nodeMap.sort((a, b) => a > b ? 1 : a < b ? -1 : 0).forEach((n) => {
      nodeListing.appendChild(n[1]);
    });
  });
}
