---
title: "Coding Standards"
description: "Know more about our coding standards at BizKit."
lead: "Originally by: Kevin Chan"
date: 2023-06-21T14:30:18+08:00
lastmod: 2023-06-21T14:30:18+08:00
draft: false
images: []
menu:
  docs:
    parent: "standards"
weight: 302
toc: true
---

# 1 Background

When multiple developers work together on a single repository, code consistency can often suffer. This is why it is important to define coding standards to ensure the consistency and maintainability of the codebase across different teams and developers.

## 1.1 Formatters

Formatters make it easier to keep code consistent. They can automatically format code to follow a set of standards or settings.

### 1.1.1 Python Formatter

For Python, we use the [black](https://pypi.org/project/black/) formatter. The reason for this is that `black` is uncompromising and will keep everything consistent without need for any other config or settings files.

To install `black`, run:

```bash
pip install black
```

Once done, you can call:

```bash
black <source_file_or_directory>
```

and `black` will take care of everything.

You may also configure `black` to automatically run after every save in the Visual Studio Code editor. To do so, make sure you have the [Python extension](https://marketplace.visualstudio.com/items?itemName=ms-python.python) installed and then enable **Editor: Format on Save** and set the **Python > Formatting: Provider** to `black`.

### 1.1.2 JavaScript Formatter

For JavaScript, we use the [prettier](https://prettier.io/) formatter with the following configurations:

```json
{
  "arrowParens": "always",
  "bracketSpacing": true,
  "trailingComma": "es5",
  "tabWidth": 4,
  "semi": true,
  "singleQuote": false
}
```

If you are using the Visual Studio Code editor, then the easiest way to configure and use `prettier` is to install [this extension](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) and set the above configurations from the editor’s settings page.

You may also copy and paste this code into your Visual Studio Code settings file:

```json
"prettier.arrowParens": "always",
"prettier.bracketSpacing": true,
"prettier.trailingComma": "es5",
"prettier.tabWidth": 4,
"prettier.semi":true,
"prettier.singleQuote": false
```

Otherwise, you may install `prettier` on a per project basis using the following command:

```bash
npm install --save-dev --save-exact prettier
```

Then create a `.prettierrc.json` config file with the above configurations.

With that done, you can format a file by running:

```bash
npx prettier --write <source_file_or_directory>
```

## 1.2 Linters

While a linter is no longer absolutely necessary once formatters are used, they can still catch some possible styling improvements that aren’t always caught by formatters.

### 1.2.1 Python Linter

For Python, we use a combination of the [flake8](https://flake8.pycqa.org/en/latest/) and [mypy](http://mypy-lang.org/) linters.

To install them, run:

```bash
pip install flake8 mypy flake8-mypy
```

Linters are best used in conjunction with a code editor so to enable them on the Visual Studio Code editor, make sure you have the [Python extension](https://marketplace.visualstudio.com/items?itemName=ms-python.python) installed and then have the following settings enabled:

- Python > Linting: Enabled
- Python > Linting: Flake8 Enabled
- Python > Linting: Mypy Enabled
- Python > Linting: Lint On Save

# 2 Python Language Rules

## 2.1 Imports

Prefer importing packages and modules over individual classes and functions. This makes it easier to compartmentalize external classes and functions into their respective packages.

<span style="color: green;">YES:</span>

```python
import package.module
from package import module
```

<span style="color: red;">NO:</span>:

```python
from package.module import (
    classA, classB, functionC, constantD, functionE
)
```

NEVER use `*` (wildcard) imports.

Also avoid function-level imports.

For modules or packages with long names, use the as statement to shorten it and make the code more readable. For example:

```python
import longername as ln
import module.with.a.really.long.name as mwarln
```

## 2.2 Exceptions

Never use catch-all `except:` statements, or catch `Exception` or `StandardError`. Python is very tolerant when using this and we may end up missing certain scenarios that we don’t want to be caught like incorrect variable names or `Ctrl+C` interrupts.

Minimize the amount of code in a `try`/`except` block. The larger the body of the `try`, the more likely that an exception will be raised by a line of code that you didn’t expect to raise an exception. In those cases, the `try`/`except` block hides a real error.

Use the `finally` clause to execute code whether or not an exception is raised in the `try` block. This is often useful for cleanup, i.e., closing a file.

## 2.3 True/False Evaluations

Use the “implicit” false if at all possible (e.g., `if foo:` rather than `if len(foo):`). They’re easier to read and less error-prone.

Always use `if foo is None:` (or `is not None`) to check for a `None` value. This is especially important, when testing whether a variable or argument that defaults to `None` was set to some other value. The other value might be a value that’s false in a boolean context.

Never compare a boolean variable to `False` using `==`. Use `if not x:` instead. If you need to distinguish `False` from `None` then chain the expressions, such as `if not x and x is not None:`.

For sequences (strings, lists, tuples), use the fact that empty sequences are false, so `if seq:` and `if not seq:` are preferable to `if len(seq):` and `if not len(seq):` respectively.

Note that when handling integers, implicit false may involve more risk than benefit (i.e., accidentally handling `None` as 0). In these cases, it is okay to compare a value which is known to be an integer (and is not the result of `len()`) against the integer 0. Also note that `"0"` (i.e., `0` as string) evaluates to true.

# 3 Python Style Rules

## 3.1 Semicolons

**NEVER.** Don’t even think about it.

## 3.2 Line Length

Maximum line length is _80 characters_.

Explicit exceptions to the 80 character limit:

- Long import statements.
- URLs, pathnames, or long flags in comments.
- Long string module level constants not containing whitespace that would be inconvenient to split across lines such as URLs or pathnames.

Avoid using backslash line continuation.

## 3.3 Parentheses

Use parentheses sparingly.

<span style="color: green;">YES:</span>

```python
if foo:
    bar()

if not foo:
    bar()

while foo:
    bar()

if x and y:
    bar()
```

<span style="color: red;">NO:</span>

```python
if (foo):
    bar()

if not(foo):
    bar()

while (foo):
    bar()

if (x and y):
    bar()

```

## 3.4 Indentation

Indent your code blocks with _4 spaces_. Never use tabs or mix tabs and spaces.

## 3.5 Imports Formatting

Imports should be on separate lines. As much as possible, put them at the top of the file, just after any module comments and docstrings and before module globals and constants. Imports should be grouped from most generic to least generic or in the following order:

- Standard library imports
- Related third party imports
- Local application/library specific imports

Always put a blank line between each group of imports.

```python
import collections
import queue
import sys

from absl import app
from absl import flags
import bs4
import cryptography
import tensorflow as tf

from book.genres import scifi
from myproject.backend import huxley
from myproject.backend.hgwells import time_machine
from myproject.backend.state_machine import main_loop
from otherproject.ai import body
from otherproject.ai import mind
from otherproject.ai import soul
```

## 3.6 Naming Conventions

| Type                       | Public             | Internal\*           |
| -------------------------- | ------------------ | -------------------- |
| Packages                   | lower_with_under   |                      |
| Modules                    | lower_with_under   | \_lower_with_under   |
| Classes                    | PascalCase         | \_PascalCase         |
| Exceptions                 | PascalCase         |                      |
| Functions                  | lower_with_under() | \_lower_with_under() |
| Global/Class Constants     | CAPS_WITH_UNDER    | \_CAPS_WITH_UNDER    |
| Global/Class Variables     | lower_with_under   | \_lower_with_under   |
| Instance Variables         | lower_with_under   | \_lower_with_under   |
| Method Names               | lower_with_under() | \_lower_with_under() |
| Function/Method Parameters | lower_with_under   |                      |
| Local Variables            | lower_with_under   |                      |

_\*Note: Internal means internal to a module, or protected or private within a class and should not be accessible outside of it._

## 3.7 Strings

Use double quotes `""` for strings.

When a literal string won’t fit on a single line, use parentheses for implicit line joining.

<span style="color: green;">YES:</span>

```python
x = (
    "This will build a very long long "
    "long long long long long long string."
)
```

<span style="color: red;">NO:</span>

```python
x = "This will build a very long long \
    long long long long long long string."
```

## 3.8 Whitespace

Follow standard typographic rules for the use of spaces around punctuation.

No whitespace inside parentheses, brackets or braces.

<span style="color: green;">YES:</span>

```python
spam(ham[1], {eggs: 2}, [])
```

<span style="color: red;">NO:</span>

```python
spam( ham[ 1 ], { eggs: 2 }, [ ] )
```

No whitespace before a comma, semicolon, or colon. Do use whitespace after a comma, semicolon, or colon, except at the end of the line.

<span style="color: green;">YES:</span>

```python
if x == 4:
    print(x, y)
    x, y = y, x
```

<span style="color: red;">NO:</span>

```python
if x == 4 :
    print(x , y)
    x , y = y , x
```

No whitespace before the open paren/bracket that starts an argument list, indexing or slicing.

<span style="color: green;">YES:</span>

```python
spam(1)
dict['key'] = list[index]
```

<span style="color: red;">NO:</span>

```python
spam (1)
dict ['key'] = list [index]
```

Surround binary operators with a single space on either side for assignment (`=`), comparisons (`==`, `<`, `>`, `!=`, `<>`, `<=`, `>=`, `in`, `not in`, `is`, `is not`), and booleans (`and`, `or`, `not`). Use your better judgment for the insertion of spaces around arithmetic operators (`+`, `-`, `*`, `/`, `//`, `%`, `**`, `@`).

<span style="color: green;">YES:</span>

```python
x == 1
```

<span style="color: red;">NO:</span>

```python
x<1
```

Never use spaces around = when passing keyword arguments or defining a default parameter value.

<span style="color: green;">YES:</span>

```python
def chewie(han, leia=True):
```

<span style="color: red;">NO:</span>

```python
def chewie(han, leia = True):
```

## 3.9 Comments and Docstrings

### 3.9.1 Docstrings

Python uses docstrings to document code. A docstring is a string that is the first statement in a package, module, class or function. Always use the three double-quote `"""` format for docstrings. The base format for a docstring includes a summary line (one physical line not exceeding 80 characters) terminated by a period, question mark, or exclamation point. When writing more (encouraged), this must be followed by a blank line, followed by the rest of the docstring starting at the same cursor position as the first quote of the first line.

### 3.9.2 Modules

Every file should contain license boilerplate and should start with a docstring describing the contents and usage of the module.

```python
"""A one line summary of the module or program, terminated by a period.

Leave one blank line.  The rest of this docstring should contain an
overall description of the module or program.  Optionally, it may also
contain a brief description of exported classes and functions and/or usage
examples.

    Typical usage example:

        foo = ClassFoo()
        bar = foo.FunctionBar()
"""
```

### 3.9.3 Functions and Methods

In this section, “function” means a method, function, or generator.

A function must have a docstring, unless it meets all of the following criteria:

- not externally visible
- very short
- Obvious

A docstring should give enough information to write a call to the function without reading the function’s code. The docstring should be descriptive-style (`"""Fetches rows from a Bigtable."""`) rather than imperative-style (`"""Fetch rows from a Bigtable."""`). A docstring should describe the function’s calling syntax and its semantics, not its implementation. For tricky code, comments alongside the code are more appropriate than using docstrings.

A method that overrides a method from a base class may have a simple docstring sending the reader to its overridden method’s docstring, such as `"""See base class."""`. The rationale is that there is no need to repeat in many places documentation that is already present in the base method’s docstring. However, if the overriding method’s behavior is substantially different from the overridden method, or details need to be provided (e.g., documenting additional side effects), a docstring with at least those differences is required on the overriding method.

Certain aspects of a function should be documented in special sections, listed below. Each section begins with a heading line, which ends with a colon. All sections other than the heading should maintain a hanging indent of two or four spaces (be consistent within a file). These sections can be omitted in cases where the function’s name and signature are informative enough that it can be aptly described using a one-line docstring.

**Args:**

> List each parameter by name. A description should follow the name, and be separated by a colon followed by either a space or newline. If the description is too long to fit on a single 80-character line, use a hanging indent of 2 or 4 spaces more than the parameter name (be consistent with the rest of the docstrings in the file). The description should include required type(s) if the code does not contain a corresponding type annotation. If a function accepts `*foo` (variable length argument lists) and/or `**bar` (arbitrary keyword arguments), they should be listed as `*foo` and `**bar`.

**Returns: (or Yields: for generators)**

> Describe the type and semantics of the return value. If the function only returns `None`, this section is not required. It may also be omitted if the docstring starts with Returns or Yields (e.g. `"""Returns row from Bigtable as a tuple of strings."""`) and the opening sentence is sufficient to describe return value.

**Raises:**

> List all exceptions that are relevant to the interface followed by a description. Use a similar exception name + colon + space or newline and hanging indent style as described in _Args:_. You should not document exceptions that get raised if the API specified in the docstring is violated (because this would paradoxically make behavior under violation of the API part of the API).

```python
def foo(a, b, c=True):
    """Gives a sample docstring for a sample function.

    This is where I provide a more concise description of the
    function if necessary.

    Args:
        a: A list of strings.
        b: The second parameter.
        require_all_keys: Optional; If this is True, it'll do
            something weird.

    Returns:
        A dict mapping keys to the corresponding stuff that was
        fetched. Each row is represented as a tuple of strings. For
        example:

        {b'Serak': ('Rigel VII', 'Preparer'),
         b'Zim': ('Irk', 'Invader'),
         b'Lrrr': ('Omicron Persei 8', 'Emperor')}

        Returned keys are always bytes.  If a key from the keys
        argument is missing from the dictionary, then that row was
        not found in the table (and c must have been False).

    Raises:
        IOError: An error occurred accessing the data.
    """
```

### 3.9.4 Classes

Classes should have a docstring below the class definition describing the class. If your class has public attributes, they should be documented here in an Attributes section and follow the same formatting as a [function’s Args]({{< relref "coding-standards#393-functions-and-methods" >}}) section.

```python
class SampleClass:
    """Summary of class here.

    Longer class information....
    Longer class information....

    Attributes:
        likes_spam: A boolean indicating if we like SPAM or not.
        eggs: An integer count of the eggs we have laid.
    """

    def __init__(self, likes_spam=False):
        """Inits SampleClass with blah."""
        self.likes_spam = likes_spam
        self.eggs = 0

    def public_method(self):
        """Performs operation blah."""
```

### 3.9.5 Block and Inline Comments

The final place to have comments is in tricky parts of the code. If you’re going to have to explain it at the next [code review]({{< relref "code-review-guidelines" >}}), you should comment it now. But never describe the code. Assume the person reading the code knows Python (though not what you’re trying to do) better than you do.

For complicated operations, add a few lines of comments before the operations commence.

Use inline comments sparingly for non-obvious operations. Inline comments should start at least 2 spaces away from the code with the comment character `#`, followed by at least one space before the text of the comment itself.

```python
# We use a weighted dictionary search to find out where i is in
# the array.  We extrapolate position based on the largest num
# in the array and the array size and then do binary search to
# get the exact number.

if i & (i-1) == 0:  # True if i is 0 or a power of 2.
```

# 4 JavaScript Language Rules

## 4.1 Equality Checks

When comparing, use `===` and `!==` over =`=` and `!=`. JavaScript is a dynamic language so using `==` might give unexpected results due to it allowing the type to be different.

## 4.2 True/False Evaluations

Use shortcuts for booleans, but explicit comparisons for strings and numbers.

<span style="color: green;">YES:</span>

```js
if (isValid) {
  bar();
}

if (name !== "") {
  bar();
}

if (myArray.length > 0) {
  bar();
}
```

<span style="color: red;">NO:</span>

```js
if (isValid === true) {
  bar();
}

if (name) {
  bar();
}

if (myArray) {
  bar();
}

if (myArray.length) {
  bar();
}
```

## 4.3 Functions

Use default parameter syntax over mutating function arguments.

<span style="color: green;">YES:</span>

```js
function foo(opts = {}) {
  bar();
}
```

<span style="color: red;">NO:</span>

```js
function foo(opts) {
  if (opts === undefined) {
    opts = {};
  }
}
```

Always put default parameters last.

<span style="color: green;">YES:</span>

```js
function foo(name, opts = {}) {
  bar();
}
```

<span style="color: red;">NO:</span>

```js
function foo(opts = {}, name) {
  bar();
}
```

Never reassign parameters. If you need a default value, then use default parameters instead.

<span style="color: green;">YES:</span>

```js
function foo(a) {
  const b = a || 1;
}

function foo(a = 1) {
  bar();
}
```

<span style="color: red;">NO:</span>

```js
function foo(a) {
  a = 1;
}

function foo(a) {
  if (a === undefined) {
    a = 1;
  }
}
```

## 4.4 Arrow Functions

Use arrow functions whenever possible. They are more concise, anonymous, and change the way `this` binds in functions and removes the need for those ugly `const me = this;` assignments.

<span style="color: green;">YES:</span>

```js
setInterval(() => {
  this.foo();
}, 5000);
```

<span style="color: red;">NO:</span>

```js
const me = this;
setInterval(function () {
  me.foo();
}, 5000);
```

# 5 JavaScript Style Rules

## 5.1 Semicolons

Use semicolons. While JavaScript has this thing called Automatic Semicolon Insertion (ASI), it can sometimes lead to unexpected results.

## 5.2 References

Avoid using `var` like the plague. Use `const` as much as possible because it ensures that we can’t reassign references so it’s easier to track errors. If we need to reassign or update values, then use `let`.

The reason why we want to use `const` and `let` as much as possible over `var` is because they are block-scoped. They will only exist in the blocks they are defined in and won’t lead to those hard-to-figure-out scoping issues.

## 5.3 Objects

Use the literal syntax for object creation.

<span style="color: green;">YES:</span>

```js
const item = {};
```

<span style="color: red;">NO:</span>

```js
const item = new Object();
```

Use object method shorthand.

<span style="color: green;">YES:</span>

```js
frappe.ui.form.on("Item", {
  item_code(frm) {},
});
```

<span style="color: red;">NO:</span>

```js
frappe.ui.form.on("Item", {
  item_code: function (frm) {},
});
```

## 5.4 Arrays

Use the literal syntax for array creation.

<span style="color: green;">YES:</span>

```js
const items = [];
```

<span style="color: red;">NO:</span>

```js
const items = new Array();
```

Use array spreads `...` to copy arrays.

<span style="color: green;">YES:</span>

```js
const itemsCopy = [...items];
```

<span style="color: red;">NO:</span>

```js
const itemsCopy = [];

for (let i = 0; i < items.length; i += 1) {
  itemsCopy[i] = items[i];
}
```

## 5.5 Destructuring

Use array/object destructuring assignments.

<span style="color: green;">YES:</span>

```js
const arr = [1, 2, 3, 4];
const [first, second] = arr;

const obj = { a: 1, b: 2, c: 3 };
const { a, b } = obj;
```

<span style="color: red;">NO:</span>

```js
const arr = [1, 2, 3, 4];
const first = arr[0];
const second = arr[1];

const obj = { a: 1, b: 2, c: 3 };
const a = obj["a"];
const b = obj["b"];
```

## 5.6 Strings

Use double quotes `""` for strings.

When programmatically building up strings, consider using template strings instead of concatenation.

<span style="color: green;">YES:</span>

```js
const greeting = `How are you, ${name}?`;
```

<span style="color: red;">NO:</span>

```js
const greeting = "How are you, " + name + "?";
```

## 5.7 Naming Conventions

| Type                       | Case               |
| -------------------------- | ------------------ |
| Classes                    | PascalCase         |
| Exceptions                 | PascalCase         |
| Functions                  | lower_with_under() |
| Global/Class Constants     | CAPS_WITH_UNDER    |
| Global/Class Variables     | lower_with_under   |
| Instance Variables         | lower_with_under   |
| Method Names               | lower_with_under() |
| Function/Method Parameters | lower_with_under   |
| Local Variables            | lower_with_under   |

## 5.8 jQuery

Prefix jQuery object variables with a `$`.

<span style="color: green;">YES:</span>

```js
const $sidebar = $(".sidebar");
```

<span style="color: red;">NO:</span>

```js
const sidebar = $(".sidebar");
```

## 5.9 Indentation

Indent your code blocks with _4 spaces_. Never use tabs or mix tabs and spaces.

## 5.10 Blocks

Use braces with all multi-line blocks. The opening brace should always be on the same line as the condition, loop, or function declaration. The closing brace should be on a separate line.

<span style="color: green;">YES:</span>

```
if (test) return false;

if (test) {
    return false;
}

function bar() {
    return false;
}
```

<span style="color: red;">NO:</span>

```
if (test)
    return false;

function foo() { return false; }
```

If you’re using multi-line blocks with `if` and `else`, put `else` on the same line as your `if` block’s closing brace.

<span style="color: green;">YES:</span>

```
if (test) {
    thing1();
    thing2();
} else {
    thing3();
}
```

<span style="color: red;">NO:</span>

```
if (test) {
    thing1();
    thing2();
}
else {
    thing3();
}
```

If an if block always executes a return statement, the subsequent else block is unnecessary. A return in an else if block following an if block that contains a return can be separated into multiple if blocks.

<span style="color: green;">YES:</span>

```
function foo() {
    if (x) {
        return x;
    }

    return y;
}

function cats() {
    if (x) {
        return x;
    }

    if (y) {
        return y;
    }
}

function dogs(x) {
    if (x) {
        if (z) {
            return y;
        }
    } else {
        return z;
    }
}
```

<span style="color: red;">NO:</span>

```
function foo() {
    if (x) {
        return x;
    } else {
        return y;
    }
}

function cats() {
    if (x) {
        return x;
    } else if (y) {
        return y;
    }
}

function dogs(x) {
    if (x) {
        return x;
    } else {
        if (y) {
            return y;
        }
    }
}
```

# 6 SQL Style Rules

## 6.1 Keyword Formatting

Use lowercase letters for ALL keywords. Place keywords and arguments in separate lines.

<span style="color: green;">YES:</span>

```sql
select
    item_code,
    item_group
from
    `tabItem`
where
    disabled = 0;
```

<span style="color: red;">NO:</span>

```sql
SELECT item_code, item_group
FROM `tabItem`
WHERE disabled = 0;
```

## 6.2 Condition Formatting

Separate each and/ or condition into their own line and place the keyword before the condition.

<span style="color: green;">YES:</span>

```sql
select
    item_code,
    item_group
from
    `tabItem`
where
    disabled = 0
    and is_stock_item = 1
    or is_fixed_asset = 1;
```

<span style="color: red;">NO:</span>

```sql
SELECT item_code, item_group
FROM `tabItem`
WHERE disabled = 0 AND is_stock_item = 1 OR
    is_fixed_asset = 1;
```

## 6.3 Alias Naming Conventions

Format aliases as `t_<DocType abbreviation>`. For example:

| DocType Name        | Table Name             | Alias Name |
| ------------------- | ---------------------- | ---------- |
| Item                | tabItem                | t_i        |
| Item Price          | tabItem Price          | t_ip       |
| Purchase Order      | tabPurchase Order      | t_po       |
| Purchase Order Item | tabPurchase Order Item | t_poi      |

# 7 Final Reminders

Please note that these standards are still open to improvements. Just because it’s on a document doesn’t mean it’s perfect. So if you, the reader, have any feedback or comments that you think will improve the overall standards, please don’t hesitate to let us know.
