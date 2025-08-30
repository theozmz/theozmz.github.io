import { CodeTabs } from "D:/code/qd/theozmz.github.io/node_modules/@vuepress/plugin-markdown-tab/lib/client/components/CodeTabs.js";
import { Tabs } from "D:/code/qd/theozmz.github.io/node_modules/@vuepress/plugin-markdown-tab/lib/client/components/Tabs.js";
import "D:/code/qd/theozmz.github.io/node_modules/@vuepress/plugin-markdown-tab/lib/client/styles/vars.css";

export default {
  enhance: ({ app }) => {
    app.component("CodeTabs", CodeTabs);
    app.component("Tabs", Tabs);
  },
};
