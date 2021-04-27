import hljs from "highlight.js/lib/core";

import javascript from "highlight.js/lib/languages/javascript";
import json from "highlight.js/lib/languages/json";
import bash from "highlight.js/lib/languages/bash";
import htmlbars from "highlight.js/lib/languages/htmlbars";
import ini from "highlight.js/lib/languages/ini";
import yaml from "highlight.js/lib/languages/yaml";
import markdown from "highlight.js/lib/languages/markdown";
import python from "highlight.js/lib/languages/python";

hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("json", json);
hljs.registerLanguage("bash", bash);
hljs.registerLanguage("html", htmlbars);
hljs.registerLanguage("ini", ini);
hljs.registerLanguage("toml", ini);
hljs.registerLanguage("yaml", yaml);
hljs.registerLanguage("md", markdown);
hljs.registerLanguage("python", python);

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("pre code").forEach((block) => {
    // Automatically add copy button
    // <div class="doks-clipboard">
    //   <button class="btn-clipboard btn btn-link" data-clipboard-text="{{ .Get "text" | safeHTML }}"><span class="copy-status"></span></button>
    // </div>

    const copyStatus = document.createElement("span");
    copyStatus.className = "copy-status";

    const copyButton = document.createElement("button");
    copyButton.className = "btn-clipboard btn btn-link";
    copyButton.setAttribute("data-clipboard-text", block.textContent);
    copyButton.appendChild(copyStatus);

    const copyWrapper = document.createElement("div");
    copyWrapper.className = "doks-clipboard";
    copyWrapper.appendChild(copyButton);

    const pre = block.parentNode;
    pre.parentNode.insertBefore(copyWrapper, pre);

    hljs.highlightBlock(block);
  });
});
