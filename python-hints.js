// Python suggestions for the Code Lab editor, in the style of VS Code.
// Lists are kept to what beginners use, so the suggestions stay short and relevant.

const PY_KEYWORDS = ["False", "None", "True", "and", "as", "assert", "async", "await", "break", "class", "continue", "def", "del", "elif",
  "else", "except", "finally", "for", "from", "global", "if", "import", "in", "is", "lambda", "nonlocal", "not", "or", "pass", "raise",
  "return", "try", "while", "with", "yield"];

const PY_BUILTINS = {
  print: "print(*values, sep=' ', end='\\n')", input: "input(prompt='') -> str", len: "len(obj) -> int", range: "range(start, stop, step)",
  int: "int(x) -> int", float: "float(x) -> float", str: "str(obj) -> str", bool: "bool(x) -> bool", list: "list(iterable) -> list",
  dict: "dict(**kwargs) -> dict", set: "set(iterable) -> set", tuple: "tuple(iterable) -> tuple", type: "type(obj)", isinstance: "isinstance(obj, class) -> bool",
  sum: "sum(iterable, start=0)", min: "min(iterable)", max: "max(iterable)", abs: "abs(x)", round: "round(number, ndigits)", sorted: "sorted(iterable, key=None, reverse=False) -> list",
  reversed: "reversed(sequence)", enumerate: "enumerate(iterable, start=0)", zip: "zip(*iterables)", map: "map(function, iterable)", filter: "filter(function, iterable)",
  open: "open(file, mode='r') -> file", any: "any(iterable) -> bool", all: "all(iterable) -> bool", pow: "pow(base, exp)", divmod: "divmod(a, b)",
  chr: "chr(code) -> str", ord: "ord(char) -> int", help: "help(obj)", dir: "dir(obj)", id: "id(obj)", hash: "hash(obj)", format: "format(value, spec)",
  super: "super()", property: "property(fget)", staticmethod: "staticmethod(function)", classmethod: "classmethod(function)", object: "object()",
  Exception: "Exception(message)", ValueError: "ValueError(message)", TypeError: "TypeError(message)", ZeroDivisionError: "ZeroDivisionError",
  KeyError: "KeyError", IndexError: "IndexError", NameError: "NameError", FileNotFoundError: "FileNotFoundError", __name__: "__name__",
};

const PY_METHODS = {
  str: ["upper()", "lower()", "title()", "capitalize()", "strip()", "lstrip()", "rstrip()", "split(sep)", "join(iterable)", "replace(old, new)",
    "find(sub)", "index(sub)", "count(sub)", "startswith(prefix)", "endswith(suffix)", "isdigit()", "isalpha()", "isalnum()", "isupper()",
    "islower()", "format(*args)", "center(width)", "zfill(width)", "swapcase()"],
  list: ["append(item)", "extend(iterable)", "insert(index, item)", "remove(item)", "pop(index)", "clear()", "index(item)", "count(item)",
    "sort(key=None, reverse=False)", "reverse()", "copy()"],
  dict: ["keys()", "values()", "items()", "get(key, default)", "update(other)", "pop(key)", "popitem()", "setdefault(key, default)", "clear()", "copy()"],
  set: ["add(item)", "remove(item)", "discard(item)", "union(other)", "intersection(other)", "difference(other)", "issubset(other)", "pop()", "clear()"],
  file: ["read()", "readline()", "readlines()", "write(text)", "close()"],
  int: ["bit_length()", "to_bytes(length, byteorder)"],
  float: ["is_integer()", "as_integer_ratio()"],
};

const PY_MODULES = {
  math: ["sqrt(x)", "pow(x, y)", "ceil(x)", "floor(x)", "fabs(x)", "factorial(n)", "gcd(a, b)", "log(x)", "log10(x)", "sin(x)", "cos(x)", "tan(x)", "radians(x)", "degrees(x)", "pi", "e", "inf"],
  random: ["random()", "randint(a, b)", "choice(seq)", "choices(seq, k=1)", "shuffle(list)", "sample(seq, k)", "uniform(a, b)", "seed(n)"],
  json: ["dumps(obj)", "loads(text)", "dump(obj, file)", "load(file)"],
  os: ["getcwd()", "listdir(path)", "mkdir(path)", "remove(path)", "rename(old, new)", "path"],
  sys: ["argv", "exit()", "version", "path"],
  time: ["time()", "sleep(seconds)", "strftime(format)"],
  datetime: ["datetime", "date", "time", "timedelta"],
  string: ["ascii_letters", "ascii_lowercase", "ascii_uppercase", "digits", "punctuation"],
  statistics: ["mean(data)", "median(data)", "mode(data)", "stdev(data)"],
  collections: ["Counter(iterable)", "defaultdict(factory)", "OrderedDict()", "namedtuple(name, fields)", "deque(iterable)"],
  re: ["match(pattern, text)", "search(pattern, text)", "findall(pattern, text)", "sub(pattern, repl, text)", "split(pattern, text)"],
  csv: ["reader(file)", "writer(file)", "DictReader(file)", "DictWriter(file, fieldnames)"],
  itertools: ["count(start)", "cycle(iterable)", "permutations(iterable)", "combinations(iterable, r)", "product(*iterables)"],
};

// "$0" marks where the cursor goes after a snippet is inserted.
const PY_SNIPPETS = [
  ["for", "for loop", "for item in $0items:\n    pass"],
  ["for range", "for loop over numbers", "for i in range($0):\n    pass"],
  ["while", "while loop", "while $0condition:\n    pass"],
  ["if", "if statement", "if $0condition:\n    pass"],
  ["if else", "if/else", "if $0condition:\n    pass\nelse:\n    pass"],
  ["if elif else", "if/elif/else", "if $0condition:\n    pass\nelif other:\n    pass\nelse:\n    pass"],
  ["def", "function", "def $0name(params):\n    return"],
  ["class", "class", "class $0Name:\n    def __init__(self):\n        pass"],
  ["try", "try/except", "try:\n    $0pass\nexcept Exception as error:\n    print(error)"],
  ["with open", "open a file", "with open($0\"file.txt\") as file:\n    data = file.read()"],
  ["main", "if __name__ == \"__main__\"", "if __name__ == \"__main__\":\n    $0main()"],
  ["list comprehension", "[x for x in items]", "[$0x for x in items]"],
];

const KIND_LABELS = { keyword: "keyword", function: "function", method: "method", module: "module", variable: "variable", snippet: "snippet", constant: "value" };

function hintLabel(entry) {
  const name = entry.replace(/\(.*$/, "");
  return { name, detail: entry.includes("(") ? entry : "" };
}

// Guesses what a name holds from its first assignment, so that "name." shows the right methods.
function guessType(code, name) {
  if (/^["']/.test(name)) return "str";
  if (/^\[/.test(name)) return "list";
  if (/^\{/.test(name)) return "dict";
  const assignment = new RegExp(`^\\s*${name}\\s*=\\s*(.+)$`, "m").exec(code);
  const loopVariable = new RegExp(`^\\s*with\\s+open\\(.*\\)\\s+as\\s+${name}\\s*:`, "m").test(code);
  if (loopVariable) return "file";
  if (!assignment) return null;
  const value = assignment[1].trim();
  if (/^(f|r|b)?["']/.test(value) || /^(input|str)\(/.test(value) || /\.(upper|lower|strip|title|replace|join)\(/.test(value)) return "str";
  if (/^\[/.test(value) || /^(list|sorted)\(/.test(value) || /\.split\(/.test(value)) return "list";
  if (/^\{\s*\}$/.test(value) || /^\{[^}]*:/.test(value) || /^dict\(/.test(value)) return "dict";
  if (/^\{/.test(value) || /^set\(/.test(value)) return "set";
  if (/^open\(/.test(value)) return "file";
  if (/^(int\(|len\(|\d+$)/.test(value)) return "int";
  if (/^(float\(|\d+\.\d*$)/.test(value)) return "float";
  return null;
}

function namesInCode(code) {
  const names = new Map();
  const add = (name, kind) => { if (!names.has(name) && !PY_KEYWORDS.includes(name)) names.set(name, kind); };
  for (const [, name] of code.matchAll(/^\s*def\s+([A-Za-z_]\w*)/gm)) add(name, "function");
  for (const [, name] of code.matchAll(/^\s*class\s+([A-Za-z_]\w*)/gm)) add(name, "function");
  for (const [, list] of code.matchAll(/^\s*import\s+([\w\s,]+)$/gm)) list.split(",").forEach((part) => add(part.trim().split(/\s+/).pop(), "module"));
  for (const [, list] of code.matchAll(/^\s*from\s+\w+\s+import\s+([\w\s,]+)$/gm)) list.split(",").forEach((part) => add(part.trim().split(/\s+/).pop(), "function"));
  for (const [, name] of code.matchAll(/^\s*([A-Za-z_]\w*)\s*=[^=]/gm)) add(name, "variable");
  for (const [, name] of code.matchAll(/\bfor\s+([A-Za-z_]\w*)\s+in\b/g)) add(name, "variable");
  for (const [, params] of code.matchAll(/^\s*def\s+\w+\(([^)]*)\)/gm)) params.split(",").forEach((part) => { const name = part.split(/[=:]/)[0].trim().replace(/^\*+/, ""); if (name) add(name, "variable"); });
  return names;
}

function rank(list, typed) {
  const lower = typed.toLowerCase();
  const starts = list.filter((item) => item.text.toLowerCase().startsWith(lower) || item.display.toLowerCase().startsWith(lower));
  const contains = list.filter((item) => !starts.includes(item) && item.display.toLowerCase().includes(lower));
  return [...starts, ...contains].filter((item) => item.display !== typed);
}

function renderHint(element, self, data) {
  const name = Object.assign(document.createElement("span"), { className: "hint-name", textContent: data.display });
  const kind = Object.assign(document.createElement("span"), { className: `hint-kind hint-${data.kind}`, textContent: KIND_LABELS[data.kind] || data.kind });
  element.append(kind, name);
  if (data.detail) element.append(Object.assign(document.createElement("span"), { className: "hint-detail", textContent: data.detail }));
}

function snippetHint(cm, self, data) {
  const indent = cm.getLine(self.from.line).match(/^\s*/)[0];
  const body = data.body.split("\n").map((line, index) => (index ? indent + line : line)).join("\n");
  const cursorAt = body.indexOf("$0");
  const text = body.replace("$0", "");
  cm.replaceRange(text, self.from, self.to);
  const before = text.slice(0, cursorAt).split("\n");
  cm.setCursor({ line: self.from.line + before.length - 1, ch: (before.length === 1 ? self.from.ch : 0) + before[before.length - 1].length });
}

function item(text, kind, detail = "") {
  return { text, display: text, kind, detail, render: renderHint };
}

function pythonHints(cm) {
  const cursor = cm.getCursor();
  const line = cm.getLine(cursor.line).slice(0, cursor.ch);
  const typed = (line.match(/[A-Za-z_]\w*$/) || [""])[0];
  const from = { line: cursor.line, ch: cursor.ch - typed.length };
  const code = cm.getValue();
  let list;

  const importLine = /^\s*import\s+[\w\s,]*$/.test(line);
  const fromImport = /^\s*from\s+(\w+)\s+import\s+[\w\s,]*$/.exec(line);
  const fromLine = /^\s*from\s+\w*$/.test(line);
  const dotted = /([A-Za-z_]\w*|["'][^"']*["']|\]|\})\.\w*$/.exec(line);

  if (importLine || fromLine) {
    list = Object.keys(PY_MODULES).map((name) => item(name, "module"));
  } else if (fromImport) {
    list = (PY_MODULES[fromImport[1]] || []).map((entry) => { const { name, detail } = hintLabel(entry); return item(name, detail ? "function" : "constant", detail); });
  } else if (dotted) {
    const target = dotted[1];
    const members = PY_MODULES[target];
    if (members) {
      list = members.map((entry) => { const { name, detail } = hintLabel(entry); return item(name, detail ? "function" : "constant", detail ? `${target}.${detail}` : ""); });
    } else {
      const type = target === "]" ? "list" : target === "}" ? "dict" : guessType(code, target);
      const types = type ? [type] : ["str", "list", "dict"];
      const seen = new Set();
      list = types.flatMap((name) => PY_METHODS[name].map((entry) => ({ entry, name }))).filter(({ entry }) => {
        const key = hintLabel(entry).name;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      }).map(({ entry, name }) => item(hintLabel(entry).name, "method", `${name}.${entry}`));
    }
  } else {
    if (!typed) return null;
    const own = [...namesInCode(code)].filter(([name]) => name !== typed).map(([name, kind]) => item(name, kind));
    const snippets = PY_SNIPPETS.map(([label, detail, body]) => ({ text: label, display: label, kind: "snippet", detail, body, render: renderHint, hint: snippetHint }));
    list = [
      ...own,
      ...PY_KEYWORDS.map((word) => item(word, "keyword")),
      ...Object.entries(PY_BUILTINS).map(([name, detail]) => item(name, "function", detail)),
      ...Object.keys(PY_MODULES).filter((name) => own.every((entry) => entry.text !== name)).map((name) => item(name, "module")),
      ...snippets,
    ];
  }
  const matches = rank(list, typed);
  return matches.length ? { list: matches, from, to: cursor } : null;
}

// Opens suggestions as you type a name or a dot, but not inside comments or text in quotes.
function enablePythonHints(cm) {
  cm.setOption("hintOptions", { hint: pythonHints, completeSingle: false, closeOnUnfocus: true });
  cm.on("inputRead", (instance, change) => {
    const typed = change.text.join("");
    if (!/^[\w.]$/.test(typed) || instance.state.completionActive) return;
    const token = instance.getTokenAt(instance.getCursor());
    if (/comment|string/.test(token.type || "")) return;
    instance.showHint();
  });
}
