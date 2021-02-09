define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.setupJSONToggleForConfig = exports.updateConfigDropdownForCompilerOptions = exports.createConfigDropdown = void 0;
    const createConfigDropdown = (sandbox, monaco) => {
        const configContainer = document.getElementById("config-container");
        const container = document.createElement("div");
        container.id = "boolean-options-container";
        configContainer.appendChild(container);
        const compilerOpts = sandbox.getCompilerOptions();
        const boolOptions = Object.keys(compilerOpts).filter(k => typeof compilerOpts[k] === "boolean");
        // we want to make sections of categories
        const categoryMap = {};
        boolOptions.forEach(optID => {
            const summary = optionsSummary.find(sum => optID === sum.id);
            const existingCategory = categoryMap[summary.categoryID];
            if (!existingCategory)
                categoryMap[summary.categoryID] = {};
            categoryMap[summary.categoryID][optID] = summary;
        });
        Object.keys(categoryMap).forEach(categoryID => {
            const categoryDiv = document.createElement("div");
            const header = document.createElement("h4");
            const ol = document.createElement("ol");
            Object.keys(categoryMap[categoryID]).forEach(optID => {
                const optSummary = categoryMap[categoryID][optID];
                header.textContent = optSummary.categoryDisplay;
                const li = document.createElement("li");
                const label = document.createElement("label");
                label.style.position = "relative";
                label.style.width = "100%";
                const svg = `<?xml version="1.0" encoding="UTF-8"?><svg width="20px" height="20px" viewBox="0 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
          <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
            <circle stroke="#0B6F57" cx="10" cy="10" r="9"></circle>
            <path d="M9.99598394,6 C10.2048193,6 10.4243641,5.91700134 10.6546185,5.75100402 C10.8848728,5.58500669 11,5.33601071 11,5.00401606 C11,4.66666667 10.8848728,4.41499331 10.6546185,4.24899598 C10.4243641,4.08299866 10.2048193,4 9.99598394,4 C9.79250335,4 9.57563588,4.08299866 9.34538153,4.24899598 C9.11512718,4.41499331 9,4.66666667 9,5.00401606 C9,5.33601071 9.11512718,5.58500669 9.34538153,5.75100402 C9.57563588,5.91700134 9.79250335,6 9.99598394,6 Z M10.6877323,16 L10.6877323,14.8898836 L10.6877323,8 L9.30483271,8 L9.30483271,9.11011638 L9.30483271,16 L10.6877323,16 Z" fill="#0B6F57" fill-rule="nonzero"></path>
          </g>
      </svg>`;
                label.innerHTML = `<span>${optSummary.id}</span><a href='../tsconfig#${optSummary.id}' class='compiler_info_link' alt='Look up ${optSummary.id} in the TSConfig Reference'>${svg}</a><br/>${optSummary.oneliner}`;
                const input = document.createElement("input");
                input.value = optSummary.id;
                input.type = "checkbox";
                input.name = optSummary.id;
                input.id = "option-" + optSummary.id;
                input.onchange = () => {
                    sandbox.updateCompilerSetting(optSummary.id, input.checked);
                };
                label.htmlFor = input.id;
                li.appendChild(input);
                li.appendChild(label);
                ol.appendChild(li);
            });
            categoryDiv.appendChild(header);
            categoryDiv.appendChild(ol);
            container.appendChild(categoryDiv);
        });
        const dropdownContainer = document.getElementById("compiler-dropdowns");
        const target = optionsSummary.find(sum => sum.id === "target");
        const targetSwitch = createSelect(target.display, "target", target.oneliner, sandbox, sandbox.ts.ScriptTarget);
        dropdownContainer.appendChild(targetSwitch);
        const jsx = optionsSummary.find(sum => sum.id === "jsx");
        const jsxSwitch = createSelect(jsx.display, "jsx", jsx.oneliner, sandbox, sandbox.ts.JsxEmit);
        dropdownContainer.appendChild(jsxSwitch);
        // When switching between a .ts and a .tsx file - refresh the playground
        const internalSwitch = jsxSwitch.getElementsByTagName("select")[0];
        internalSwitch.addEventListener("change", () => {
            const isNowJSX = internalSwitch.selectedIndex !== 0;
            const isJSX = sandbox.filepath.endsWith("x");
            if (isNowJSX !== isJSX) {
                const newURL = sandbox.createURLQueryWithCompilerOptions(sandbox);
                window.history.replaceState({}, "", newURL);
                setTimeout(() => document.location.reload(), 300);
            }
        });
        const modSum = optionsSummary.find(sum => sum.id === "module");
        const moduleSwitch = createSelect(modSum.display, "module", modSum.oneliner, sandbox, sandbox.ts.ModuleKind);
        dropdownContainer.appendChild(moduleSwitch);
    };
    exports.createConfigDropdown = createConfigDropdown;
    const updateConfigDropdownForCompilerOptions = (sandbox, monaco) => {
        const compilerOpts = sandbox.getCompilerOptions();
        const boolOptions = Object.keys(compilerOpts).filter(k => typeof compilerOpts[k] === "boolean");
        boolOptions.forEach(opt => {
            const inputID = "option-" + opt;
            const input = document.getElementById(inputID);
            input.checked = !!compilerOpts[opt];
        });
        const compilerIDToMaps = {
            module: monaco.languages.typescript.ModuleKind,
            jsx: monaco.languages.typescript.JsxEmit,
            target: monaco.languages.typescript.ScriptTarget,
        };
        Object.keys(compilerIDToMaps).forEach(flagID => {
            const input = document.getElementById("compiler-select-" + flagID);
            const currentValue = compilerOpts[flagID];
            const map = compilerIDToMaps[flagID];
            // @ts-ignore
            const realValue = map[currentValue];
            if (!realValue)
                return;
            // @ts-ignore
            for (const option of input.children) {
                option.selected = option.value.toLowerCase() === realValue.toLowerCase();
            }
        });
    };
    exports.updateConfigDropdownForCompilerOptions = updateConfigDropdownForCompilerOptions;
    const createSelect = (title, id, blurb, sandbox, option) => {
        const label = document.createElement("label");
        const textToDescribe = document.createElement("span");
        textToDescribe.textContent = title + ":";
        label.appendChild(textToDescribe);
        const select = document.createElement("select");
        select.id = "compiler-select-" + id;
        label.appendChild(select);
        select.onchange = () => {
            const value = select.value; // the human string
            const compilerIndex = option[value];
            sandbox.updateCompilerSetting(id, compilerIndex);
        };
        Object.keys(option)
            .filter(key => isNaN(Number(key)))
            .forEach(key => {
            // hide Latest
            if (key === "Latest")
                return;
            const option = document.createElement("option");
            option.value = key;
            option.text = key;
            select.appendChild(option);
        });
        const span = document.createElement("span");
        span.textContent = blurb;
        span.classList.add("compiler-flag-blurb");
        label.appendChild(span);
        return label;
    };
    const setupJSONToggleForConfig = (sandbox) => { };
    exports.setupJSONToggleForConfig = setupJSONToggleForConfig;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlQ29uZmlnRHJvcGRvd24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wbGF5Z3JvdW5kL3NyYy9jcmVhdGVDb25maWdEcm9wZG93bi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0lBY08sTUFBTSxvQkFBb0IsR0FBRyxDQUFDLE9BQWdCLEVBQUUsTUFBYyxFQUFFLEVBQUU7UUFDdkUsTUFBTSxlQUFlLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxrQkFBa0IsQ0FBRSxDQUFBO1FBQ3BFLE1BQU0sU0FBUyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUE7UUFDL0MsU0FBUyxDQUFDLEVBQUUsR0FBRywyQkFBMkIsQ0FBQTtRQUMxQyxlQUFlLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFBO1FBRXRDLE1BQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxrQkFBa0IsRUFBRSxDQUFBO1FBQ2pELE1BQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsT0FBTyxZQUFZLENBQUMsQ0FBQyxDQUFDLEtBQUssU0FBUyxDQUFDLENBQUE7UUFFL0YseUNBQXlDO1FBQ3pDLE1BQU0sV0FBVyxHQUFHLEVBQWlFLENBQUE7UUFDckYsV0FBVyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUMxQixNQUFNLE9BQU8sR0FBRyxjQUFjLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsS0FBSyxLQUFLLEdBQUcsQ0FBQyxFQUFFLENBQUUsQ0FBQTtZQUU3RCxNQUFNLGdCQUFnQixHQUFHLFdBQVcsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUE7WUFDeEQsSUFBSSxDQUFDLGdCQUFnQjtnQkFBRSxXQUFXLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtZQUUzRCxX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QUVNLE1BQU0sd0JBQXdCLEdBQUcsQ0FBQyxPQUFnQixFQUFFLEVBQUUsR0FBRSxDQUFDLENBQUE7SUFBbkQsUUFBQSx3QkFBd0IsNEJBQTJCIiwic291cmNlc0NvbnRlbnQiOlsidHlwZSBTYW5kYm94ID0gaW1wb3J0KFwidHlwZXNjcmlwdC1zYW5kYm94XCIpLlNhbmRib3hcbnR5cGUgTW9uYWNvID0gdHlwZW9mIGltcG9ydChcIm1vbmFjby1lZGl0b3JcIilcblxudHlwZSBPcHRpb25zU3VtbWFyeSA9IHtcbiAgZGlzcGxheTogc3RyaW5nXG4gIG9uZWxpbmVyOiBzdHJpbmdcbiAgaWQ6IHN0cmluZ1xuICBjYXRlZ29yeUlEOiBzdHJpbmdcbiAgY2F0ZWdvcnlEaXNwbGF5OiBzdHJpbmdcbn1cblxuLy8gVGhpcyBpcyB3aGVyZSBhbGwgdGhlIGxvY2FsaXplZCBkZXNjcmlwdGlvbnMgY29tZSBmcm9tXG5kZWNsYXJlIGNvbnN0IG9wdGlvbnNTdW1tYXJ5OiBPcHRpb25zU3VtbWFyeVtdXG5cbmV4cG9ydCBjb25zdCBjcmVhdGVDb25maWdEcm9wZG93biA9IChzYW5kYm94OiBTYW5kYm94LCBtb25hY286IE1vbmFjbykgPT4ge1xuICBjb25zdCBjb25maWdDb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNvbmZpZy1jb250YWluZXJcIikhXG4gIGNvbnN0IGNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIilcbiAgY29udGFpbmVyLmlkID0gXCJib29sZWFuLW9wdGlvbnMtY29udGFpbmVyXCJcbiAgY29uZmlnQ29udGFpbmVyLmFwcGVuZENoaWxkKGNvbnRhaW5lcilcblxuICBjb25zdCBjb21waWxlck9wdHMgPSBzYW5kYm94LmdldENvbXBpbGVyT3B0aW9ucygpXG4gIGNvbnN0IGJvb2xPcHRpb25zID0gT2JqZWN0LmtleXMoY29tcGlsZXJPcHRzKS5maWx0ZXIoayA9PiB0eXBlb2YgY29tcGlsZXJPcHRzW2tdID09PSBcImJvb2xlYW5cIilcblxuICAvLyB3ZSB3YW50IHRvIG1ha2Ugc2VjdGlvbnMgb2YgY2F0ZWdvcmllc1xuICBjb25zdCBjYXRlZ29yeU1hcCA9IHt9IGFzIHsgW2NhdGVnb3J5OiBzdHJpbmddOiB7IFtvcHRJRDogc3RyaW5nXTogT3B0aW9uc1N1bW1hcnkgfSB9XG4gIGJvb2xPcHRpb25zLmZvckVhY2gob3B0SUQgPT4ge1xuICAgIGNvbnN0IHN1bW1hcnkgPSBvcHRpb25zU3VtbWFyeS5maW5kKHN1bSA9PiBvcHRJRCA9PT0gc3VtLmlkKSFcblxuICAgIGNvbnN0IGV4aXN0aW5nQ2F0ZWdvcnkgPSBjYXRlZ29yeU1hcFtzdW1tYXJ5LmNhdGVnb3J5SURdXG4gICAgaWYgKCFleGlzdGluZ0NhdGVnb3J5KSBjYXRlZ29yeU1hcFtzdW1tYXJ5LmNhdGVnb3J5SURdID0ge31cblxuICAgIGNhdGVnb3J5TWFwW3N1bW1hcnkuY2F0ZWdvcnlJRF1bb3B0SURdID0gc3VtbWFyeVxuICB9KVxuXG4gIE9iamVjdC5rZXlzKGNhdGVnb3J5TWFwKS5mb3JFYWNoKGNhdGVnb3J5SUQgPT4ge1xuICAgIGNvbnN0IGNhdGVnb3J5RGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKVxuICAgIGNvbnN0IGhlYWRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJoNFwiKVxuICAgIGNvbnN0IG9sID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcIm9sXCIpXG5cbiAgICBPYmplY3Qua2V5cyhjYXRlZ29yeU1hcFtjYXRlZ29yeUlEXSkuZm9yRWFjaChvcHRJRCA9PiB7XG4gICAgICBjb25zdCBvcHRTdW1tYXJ5ID0gY2F0ZWdvcnlNYXBbY2F0ZWdvcnlJRF1bb3B0SURdXG4gICAgICBoZWFkZXIudGV4dENvbnRlbnQgPSBvcHRTdW1tYXJ5LmNhdGVnb3J5RGlzcGxheVxuXG4gICAgICBjb25zdCBsaSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJsaVwiKVxuICAgICAgY29uc3QgbGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwibGFiZWxcIilcbiAgICAgIGxhYmVsLnN0eWxlLnBvc2l0aW9uID0gXCJyZWxhdGl2ZVwiXG4gICAgICBsYWJlbC5zdHlsZS53aWR0aCA9IFwiMTAwJVwiXG5cbiAgICAgIGNvbnN0IHN2ZyA9IGA8P3htbCB2ZXJzaW9uPVwiMS4wXCIgZW5jb2Rpbmc9XCJVVEYtOFwiPz48c3ZnIHdpZHRoPVwiMjBweFwiIGhlaWdodD1cIjIwcHhcIiB2aWV3Qm94PVwiMCAwIDIwIDIwXCIgdmVyc2lvbj1cIjEuMVwiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB4bWxuczp4bGluaz1cImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmtcIj5cbiAgICAgICAgICA8ZyBzdHJva2U9XCJub25lXCIgc3Ryb2tlLXdpZHRoPVwiMVwiIGZpbGw9XCJub25lXCIgZmlsbC1ydWxlPVwiZXZlbm9kZFwiPlxuICAgICAgICAgICAgPGNpcmNsZSBzdHJva2U9XCIjMEI2RjU3XCIgY3g9XCIxMFwiIGN5PVwiMTBcIiByPVwiOVwiPjwvY2lyY2xlPlxuICAgICAgICAgICAgPHBhdGggZD1cIk05Ljk5NTk4Mzk0LDYgQzEwLjIwNDgxOTMsNiAxMC40MjQzNjQxLDUuOTE3MDAxMzQgMTAuNjU0NjE4NSw1Ljc1MTAwNDAyIEMxMC44ODQ4NzI4LDUuNTg1MDA2NjkgMTEsNS4zMzYwMTA3MSAxMSw1LjAwNDAxNjA2IEMxMSw0LjY2NjY2NjY3IDEwLjg4NDg3MjgsNC40MTQ5OTMzMSAxMC42NTQ2MTg1LDQuMjQ4OTk1OTggQzEwLjQyNDM2NDEsNC4wODI5OTg2NiAxMC4yMDQ4MTkzLDQgOS45OTU5ODM5NCw0IEM5Ljc5MjUwMzM1LDQgOS41NzU2MzU4OCw0LjA4Mjk5ODY2IDkuMzQ1MzgxNTMsNC4yNDg5OTU5OCBDOS4xMTUxMjcxOCw0LjQxNDk5MzMxIDksNC42NjY2NjY2NyA5LDUuMDA0MDE2MDYgQzksNS4zMzYwMTA3MSA5LjExNTEyNzE4LDUuNTg1MDA2NjkgOS4zNDUzODE1Myw1Ljc1MTAwNDAyIEM5LjU3NTYzNTg4LDUuOTE3MDAxMzQgOS43OTI1MDMzNSw2IDkuOTk1OTgzOTQsNiBaIE0xMC42ODc3MzIzLDE2IEwxMC42ODc3MzIzLDE0Ljg4OTg4MzYgTDEwLjY4NzczMjMsOCBMOS4zMDQ4MzI3MSw4IEw5LjMwNDgzMjcxLDkuMTEwMTE2MzggTDkuMzA0ODMyNzEsMTYgTDEwLjY4NzczMjMsMTYgWlwiIGZpbGw9XCIjMEI2RjU3XCIgZmlsbC1ydWxlPVwibm9uemVyb1wiPjwvcGF0aD5cbiAgICAgICAgICA8L2c+XG4gICAgICA8L3N2Zz5gXG4gICAgICBsYWJlbC5pbm5lckhUTUwgPSBgPHNwYW4+JHtvcHRTdW1tYXJ5LmlkfTwvc3Bhbj48YSBocmVmPScuLi90c2NvbmZpZyMke29wdFN1bW1hcnkuaWR9JyBjbGFzcz0nY29tcGlsZXJfaW5mb19saW5rJyBhbHQ9J0xvb2sgdXAgJHtvcHRTdW1tYXJ5LmlkfSBpbiB0aGUgVFNDb25maWcgUmVmZXJlbmNlJz4ke3N2Z308L2E+PGJyLz4ke29wdFN1bW1hcnkub25lbGluZXJ9YFxuXG4gICAgICBjb25zdCBpbnB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbnB1dFwiKVxuICAgICAgaW5wdXQudmFsdWUgPSBvcHRTdW1tYXJ5LmlkXG4gICAgICBpbnB1dC50eXBlID0gXCJjaGVja2JveFwiXG4gICAgICBpbnB1dC5uYW1lID0gb3B0U3VtbWFyeS5pZFxuICAgICAgaW5wdXQuaWQgPSBcIm9wdGlvbi1cIiArIG9wdFN1bW1hcnkuaWRcblxuICAgICAgaW5wdXQub25jaGFuZ2UgPSAoKSA9PiB7XG4gICAgICAgIHNhbmRib3gudXBkYXRlQ29tcGlsZXJTZXR0aW5nKG9wdFN1bW1hcnkuaWQsIGlucHV0LmNoZWNrZWQpXG4gICAgICB9XG5cbiAgICAgIGxhYmVsLmh0bWxGb3IgPSBpbnB1dC5pZFxuXG4gICAgICBsaS5hcHBlbmRDaGlsZChpbnB1dClcbiAgICAgIGxpLmFwcGVuZENoaWxkKGxhYmVsKVxuICAgICAgb2wuYXBwZW5kQ2hpbGQobGkpXG4gICAgfSlcblxuICAgIGNhdGVnb3J5RGl2LmFwcGVuZENoaWxkKGhlYWRlcilcbiAgICBjYXRlZ29yeURpdi5hcHBlbmRDaGlsZChvbClcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoY2F0ZWdvcnlEaXYpXG4gIH0pXG5cbiAgY29uc3QgZHJvcGRvd25Db250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNvbXBpbGVyLWRyb3Bkb3duc1wiKSFcblxuICBjb25zdCB0YXJnZXQgPSBvcHRpb25zU3VtbWFyeS5maW5kKHN1bSA9PiBzdW0uaWQgPT09IFwidGFyZ2V0XCIpIVxuICBjb25zdCB0YXJnZXRTd2l0Y2ggPSBjcmVhdGVTZWxlY3QodGFyZ2V0LmRpc3BsYXksIFwidGFyZ2V0XCIsIHRhcmdldC5vbmVsaW5lciwgc2FuZGJveCwgc2FuZGJveC50cy5TY3JpcHRUYXJnZXQpXG4gIGRyb3Bkb3duQ29udGFpbmVyLmFwcGVuZENoaWxkKHRhcmdldFN3aXRjaClcblxuICBjb25zdCBqc3ggPSBvcHRpb25zU3VtbWFyeS5maW5kKHN1bSA9PiBzdW0uaWQgPT09IFwianN4XCIpIVxuICBjb25zdCBqc3hTd2l0Y2ggPSBjcmVhdGVTZWxlY3QoanN4LmRpc3BsYXksIFwianN4XCIsIGpzeC5vbmVsaW5lciwgc2FuZGJveCwgc2FuZGJveC50cy5Kc3hFbWl0KVxuICBkcm9wZG93bkNvbnRhaW5lci5hcHBlbmRDaGlsZChqc3hTd2l0Y2gpXG5cbiAgLy8gV2hlbiBzd2l0Y2hpbmcgYmV0d2VlbiBhIC50cyBhbmQgYSAudHN4IGZpbGUgLSByZWZyZXNoIHRoZSBwbGF5Z3JvdW5kXG4gIGNvbnN0IGludGVybmFsU3dpdGNoID0ganN4U3dpdGNoLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwic2VsZWN0XCIpWzBdXG4gIGludGVybmFsU3dpdGNoLmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgKCkgPT4ge1xuICAgIGNvbnN0IGlzTm93SlNYID0gaW50ZXJuYWxTd2l0Y2guc2VsZWN0ZWRJbmRleCAhPT0gMFxuICAgIGNvbnN0IGlzSlNYID0gc2FuZGJveC5maWxlcGF0aC5lbmRzV2l0aChcInhcIilcbiAgICBpZiAoaXNOb3dKU1ggIT09IGlzSlNYKSB7XG4gICAgICBjb25zdCBuZXdVUkwgPSBzYW5kYm94LmNyZWF0ZVVSTFF1ZXJ5V2l0aENvbXBpbGVyT3B0aW9ucyhzYW5kYm94KVxuICAgICAgd2luZG93Lmhpc3RvcnkucmVwbGFjZVN0YXRlKHt9LCBcIlwiLCBuZXdVUkwpXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IGRvY3VtZW50LmxvY2F0aW9uLnJlbG9hZCgpLCAzMDApXG4gICAgfVxuICB9KVxuXG4gIGNvbnN0IG1vZFN1bSA9IG9wdGlvbnNTdW1tYXJ5LmZpbmQoc3VtID0+IHN1bS5pZCA9PT0gXCJtb2R1bGVcIikhXG4gIGNvbnN0IG1vZHVsZVN3aXRjaCA9IGNyZWF0ZVNlbGVjdChtb2RTdW0uZGlzcGxheSwgXCJtb2R1bGVcIiwgbW9kU3VtLm9uZWxpbmVyLCBzYW5kYm94LCBzYW5kYm94LnRzLk1vZHVsZUtpbmQpXG4gIGRyb3Bkb3duQ29udGFpbmVyLmFwcGVuZENoaWxkKG1vZHVsZVN3aXRjaClcbn1cblxuZXhwb3J0IGNvbnN0IHVwZGF0ZUNvbmZpZ0Ryb3Bkb3duRm9yQ29tcGlsZXJPcHRpb25zID0gKHNhbmRib3g6IFNhbmRib3gsIG1vbmFjbzogTW9uYWNvKSA9PiB7XG4gIGNvbnN0IGNvbXBpbGVyT3B0cyA9IHNhbmRib3guZ2V0Q29tcGlsZXJPcHRpb25zKClcbiAgY29uc3QgYm9vbE9wdGlvbnMgPSBPYmplY3Qua2V5cyhjb21waWxlck9wdHMpLmZpbHRlcihrID0+IHR5cGVvZiBjb21waWxlck9wdHNba10gPT09IFwiYm9vbGVhblwiKVxuXG4gIGJvb2xPcHRpb25zLmZvckVhY2gob3B0ID0+IHtcbiAgICBjb25zdCBpbnB1dElEID0gXCJvcHRpb24tXCIgKyBvcHRcbiAgICBjb25zdCBpbnB1dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlucHV0SUQpIGFzIEhUTUxJbnB1dEVsZW1lbnRcbiAgICBpbnB1dC5jaGVja2VkID0gISFjb21waWxlck9wdHNbb3B0XVxuICB9KVxuXG4gIGNvbnN0IGNvbXBpbGVySURUb01hcHM6IGFueSA9IHtcbiAgICBtb2R1bGU6IG1vbmFjby5sYW5ndWFnZXMudHlwZXNjcmlwdC5Nb2R1bGVLaW5kLFxuICAgIGpzeDogbW9uYWNvLmxhbmd1YWdlcy50eXBlc2NyaXB0LkpzeEVtaXQsXG4gICAgdGFyZ2V0OiBtb25hY28ubGFuZ3VhZ2VzLnR5cGVzY3JpcHQuU2NyaXB0VGFyZ2V0LFxuICB9XG5cbiAgT2JqZWN0LmtleXMoY29tcGlsZXJJRFRvTWFwcykuZm9yRWFjaChmbGFnSUQgPT4ge1xuICAgIGNvbnN0IGlucHV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjb21waWxlci1zZWxlY3QtXCIgKyBmbGFnSUQpIGFzIEhUTUxJbnB1dEVsZW1lbnRcbiAgICBjb25zdCBjdXJyZW50VmFsdWUgPSBjb21waWxlck9wdHNbZmxhZ0lEXVxuICAgIGNvbnN0IG1hcCA9IGNvbXBpbGVySURUb01hcHNbZmxhZ0lEXVxuICAgIC8vIEB0cy1pZ25vcmVcbiAgICBjb25zdCByZWFsVmFsdWUgPSBtYXBbY3VycmVudFZhbHVlXVxuICAgIGlmICghcmVhbFZhbHVlKSByZXR1cm5cblxuICAgIC8vIEB0cy1pZ25vcmVcbiAgICBmb3IgKGNvbnN0IG9wdGlvbiBvZiBpbnB1dC5jaGlsZHJlbikge1xuICAgICAgb3B0aW9uLnNlbGVjdGVkID0gb3B0aW9uLnZhbHVlLnRvTG93ZXJDYXNlKCkgPT09IHJlYWxWYWx1ZS50b0xvd2VyQ2FzZSgpXG4gICAgfVxuICB9KVxufVxuXG5jb25zdCBjcmVhdGVTZWxlY3QgPSAodGl0bGU6IHN0cmluZywgaWQ6IHN0cmluZywgYmx1cmI6IHN0cmluZywgc2FuZGJveDogU2FuZGJveCwgb3B0aW9uOiBhbnkpID0+IHtcbiAgY29uc3QgbGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwibGFiZWxcIilcbiAgY29uc3QgdGV4dFRvRGVzY3JpYmUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3BhblwiKVxuICB0ZXh0VG9EZXNjcmliZS50ZXh0Q29udGVudCA9IHRpdGxlICsgXCI6XCJcbiAgbGFiZWwuYXBwZW5kQ2hpbGQodGV4dFRvRGVzY3JpYmUpXG5cbiAgY29uc3Qgc2VsZWN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNlbGVjdFwiKVxuICBzZWxlY3QuaWQgPSBcImNvbXBpbGVyLXNlbGVjdC1cIiArIGlkXG4gIGxhYmVsLmFwcGVuZENoaWxkKHNlbGVjdClcblxuICBzZWxlY3Qub25jaGFuZ2UgPSAoKSA9PiB7XG4gICAgY29uc3QgdmFsdWUgPSBzZWxlY3QudmFsdWUgLy8gdGhlIGh1bWFuIHN0cmluZ1xuICAgIGNvbnN0IGNvbXBpbGVySW5kZXggPSBvcHRpb25bdmFsdWVdXG4gICAgc2FuZGJveC51cGRhdGVDb21waWxlclNldHRpbmcoaWQsIGNvbXBpbGVySW5kZXgpXG4gIH1cblxuICBPYmplY3Qua2V5cyhvcHRpb24pXG4gICAgLmZpbHRlcihrZXkgPT4gaXNOYU4oTnVtYmVyKGtleSkpKVxuICAgIC5mb3JFYWNoKGtleSA9PiB7XG4gICAgICAvLyBoaWRlIExhdGVzdFxuICAgICAgaWYgKGtleSA9PT0gXCJMYXRlc3RcIikgcmV0dXJuXG5cbiAgICAgIGNvbnN0IG9wdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJvcHRpb25cIilcbiAgICAgIG9wdGlvbi52YWx1ZSA9IGtleVxuICAgICAgb3B0aW9uLnRleHQgPSBrZXlcblxuICAgICAgc2VsZWN0LmFwcGVuZENoaWxkKG9wdGlvbilcbiAgICB9KVxuXG4gIGNvbnN0IHNwYW4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3BhblwiKVxuICBzcGFuLnRleHRDb250ZW50ID0gYmx1cmJcbiAgc3Bhbi5jbGFzc0xpc3QuYWRkKFwiY29tcGlsZXItZmxhZy1ibHVyYlwiKVxuICBsYWJlbC5hcHBlbmRDaGlsZChzcGFuKVxuXG4gIHJldHVybiBsYWJlbFxufVxuXG5leHBvcnQgY29uc3Qgc2V0dXBKU09OVG9nZ2xlRm9yQ29uZmlnID0gKHNhbmRib3g6IFNhbmRib3gpID0+IHt9XG4iXX0=