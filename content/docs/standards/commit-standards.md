---
title: "Commit Standards"
description: "Know more about our commit standards at BizKit."
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

# 1 Why It Matters

Imagine checking a git repository’s log and seeing something like this:

```md
Started working on feature X
Testing stuff
Fix small bug
Ticket #41
Made lots of changes
```

Confused? Now, compare that to this:

```md
feat: Add date validation in Purchase Order
test: Add unit test for Item Price validation
fix: Incorrect number format
fix: Item error on save
feat: Add files for new Hour Multiplier DocType
```

Which one would be easier to read? Or better yet, which one would be easier to _understand_? The former is inconsistent, messy, and all over the place. The latter is clean, informative, and precise.

When writing code, good commit messages are usually the last thing we want to think of or worry about. It’s not like we’re going to read them, right? But all we have to do is review someone’s code and suddenly we realize the importance of having good commit messages. Just try to find a bug introduced after deploying a new feature and figure out which change did that. Diving deep into code without understanding the context of why the developer made that change isn’t as fun as one thinks—nor is it a good use of time.

Good commit messages tell a _story_. They give viewers the necessary background of what was changed and why that change was made.They let people who read them understand what’s going on without having to go into the nitty-gritty of the code or worse, contact the developer who’s supposedly hard at work doing something else.

And that is the main reason why good commits are necessary: they make it easier for everyone else—and most especially us.

# 2 How To Write Good Commits

# 2.1 The Basic Structure

Fortunately, it isn’t that hard to write good commits. And neither does it take a long time. But at the same time, one shouldn’t hurry when writing commits—doing so is the reason why so many developers put out nonsensical commit messages like [these](https://twitter.com/gitlost). As mentioned before, good commit messages are supposed to tell a story and there aren’t any good stories written by someone in a hurry.

We should pause for a moment and think about what we did. Good commit messages address the following questions:

- What was changed or added?
- Why was it necessary?
- What effects does it have?
- How did it work before and how does it work now?

At the same time, we should remember to keep commits small. A good rule of thumb is to only commit **one** change at a time. Commits don’t cost anything so these are one of the cases where it’s better to have more.

With that out of the way, here’s the basic structure for writing commit messages:

```md
<type>: <description>

[optional body]
```

Now, here’s an example:

```md
feat: Add option to hide values in trees

This commit adds functionality that allows users to enable/disable showing the account balance and warehouse stock value in the Chart of Accounts and Warehouse trees respectively. The following fields were added in the following DocTypes to allow this:

- show_balance_in_coa_tree in Accounts Settings
- show_stock_value_in_warehouse_tree in Stock Settings
```

Simple enough, right? Let’s get down into the rules.

## 2.2 Rules for Writing Good Commits

### 2.2.1 Limit the Subject Line to 50 Characters

The subject line is the first line of the git commit and is usually the only thing most developers that don’t care about doing good commits fill out. Whilesome commits don’t require adding a body, the subject line is necessary. It is a short summary of the change and is used as the title for the commit in most repository hosting sites.

While 50 characters is not a hard limit and the world won’t end if we go over it, using it as a rule of thumb ensures that they are readable. If we’re having trouble summarizing what we did in 50 characters then we might be committing too much. If that’s the case, then we need to split up our change into smaller chunks.

### 2.2.2 Add a Type

Adding a type to the subject line makes it easier for viewers to categorize and figure out what’s going on. Common types and when to use them are the following:

| Type     | Purpose                                                                |
| -------- | ---------------------------------------------------------------------- |
| feat     | New feature or functionality                                           |
| fix      | Bug fixes                                                              |
| refactor | Refactoring or optimizing production code                              |
| style    | Improving the formatting (i.e. removing unnecessary parentheses, etc.) |
| docs     | Changes to the documentation                                           |
| test     | Adding or refactoring tests                                            |
| chore    | Cleaning up files or other changes that don’t affect the code          |

### 2.2.3 Capitalize the Description

Nothing special here, just capitalize the description. It looks cleaner. Here’s an example:

```md
feat: Add date validation in Purchase Order
```

### 2.2.4 Do Not End the Subject Line With a Period

Trailing punctuation is unnecessary in subject lines. And also, we want to keep it at 50 characters or less so space is precious.

### 2.2.5 Use the Imperative Mood in the Description

Writing in the imperative is like speaking or writing as if giving a command or an instruction. Here are some examples:

- Add validation
- Fix typo in error message
- Delete unnecessary code

The imperative can sound a bit bossy or rude and may take a bit of getting used to, but git uses the imperative as well when creating commits on our behalf.

To help, remember that a properly formed git commit description should complete the following sentence:

> If applied, this commit will _your description here_.

For example:

- If applied, this commit will <u>add validation in Purchase Order</u>.
- If applied, this commit will <u>fix typo in error message</u>.
- If applied, this commit will <u>delete unnecessary code</u>.

Take note that this is only necessary for the description and not for the body.

### 2.2.6 Separate Subject From Body With a Blank Line

Again, not all commits require a body. But in case it does, we should remember that the subject line is like the title. Adding a blank line in between the subject and the body makes it easier to read and differentiate the title from the body. Here’s an example:

```md
fix: Asset status not updating

This commit fixes a bug in the Asset DocType where the status does not go back to what it was previously after an Asset Maintenance or Asset Repair.

This was happening because the function to set the status did not default to the original status if it didn’t find any existing Asset Maintenance or Asset Repair. Adding this at the end of the condition fixes the bug.
```

### 2.2.7 Wrap the Body at 72 Characters

Git never wraps text automatically and so it can be hard to view git logs when we have to scroll horizontally. When we write the body of a commit message, we have to think about its right margin and wrap text manually.

The recommendation is to do this at 72 characters, so that git has plenty of room to indent text while still keeping everything under 80 characters overall.

### 2.2.8 Use the Body to Explain _What_ and _Why_ Instead of _How_

We have to remember that the purpose of the commit is to give the reader context of what was changed and why. There is no need to write a novel explaining the excruciating details of how we managed to solve that bug that no one else could solve. If the viewer were interested, they could simply check the git diff for that. Keep things short—focus on the what and why.

# Pro Tips

## 3.1 Git Commit Template

We can actually set our own git commit templates so we don’t forget to write the important stuff and ensure that we’re following commit standards.

[This is a link](https://gist.github.com/kevingdc/00bc3f90d2531c604df3d9e516c71998) to Kevin's personal template. Feel free to use it or modify it to your tastes. Once you download it and save it to your machine, you can have git use it as the default template by running the following command:

```bash
git config --global commit.template path/to/.git_commit_template
```

## 3.2 GitLens

If you’re using Visual Studio Code, you may also install the [GitLens extension](https://marketplace.visualstudio.com/items?itemName=eamodio.gitlens) to easily see git history.

# 4 Final Reminders

Please note that these standards are still open to improvements. Just this because it’s on a document doesn’t mean it’s perfect. So if you, the reader, have any feedback or comments that you think will improve the overall standards, please don’t hesitate to let us know.
