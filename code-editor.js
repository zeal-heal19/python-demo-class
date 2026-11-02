// Python keywords that VS Code colours as control flow. Other keywords keep the default keyword colour.
const CONTROL_KEYWORDS = /^(?:if|elif|else|for|while|break|continue|return|pass|try|except|finally|raise|with|yield|import|from|as|in|await)\b/;

// Marks control keywords. CSS only colours the mark when the Python mode also calls the word
// a keyword, so the same word inside a comment or string keeps the comment or string colour.
const controlKeywordOverlay = {
  token(stream) {
    if (stream.match(CONTROL_KEYWORDS)) return "control";
    stream.match(/^\w+/) || stream.next();
    return null;
  },
};

// Turns a textarea into a code editor with getValue() and setValue().
function createCodeEditor(textarea) {
  if (!window.CodeMirror) {
    return { getValue: () => textarea.value, setValue: (code) => { textarea.value = code; } };
  }
  // Tab indents in the editor. Press Escape first to move on with the keyboard.
  const editingKeys = {
    Tab(cm) {
      if (cm.somethingSelected()) cm.indentSelection("add");
      else cm.replaceSelection("    ");
    },
    Esc(cm) { cm.setOption("extraKeys", { ...editingKeys, Tab: false }); },
  };
  const editor = CodeMirror.fromTextArea(textarea, {
    mode: "python",
    theme: "dark-plus",
    lineNumbers: true,
    indentUnit: 4,
    smartIndent: true,
    spellcheck: false,
    autocorrect: false,
    autocapitalize: false,
    screenReaderLabel: textarea.getAttribute("aria-label"),
    extraKeys: editingKeys,
  });
  editor.addOverlay(controlKeywordOverlay);
  editor.on("blur", () => editor.setOption("extraKeys", editingKeys));
  new ResizeObserver(() => editor.refresh()).observe(editor.getWrapperElement());
  return {
    getValue: () => editor.getValue(),
    setValue(code) {
      editor.setValue(code);
      editor.clearHistory();
    },
  };
}
