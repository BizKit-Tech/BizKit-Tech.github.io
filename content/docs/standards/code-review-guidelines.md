---
title: "Code Review Guidelines"
description: "Know more about our code review guidelines when reviewing pull requests."
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

# 1 Overview

## 1.1 Definition

The **code review** is a software quality assurance activity where one or several people check another developer’s work by reviewing their source code. This is done after implementation but before it is merged to the main codebase.

## 1.2 Purpose

The purpose of code reviews are to:

- _Improve code quality_ – improve internal code maintainability, readability, uniformity, understandability, etc.
- _Find defects_ – find and fix performance problems, security vulnerabilities, etc.
- _Facilitate learning and knowledge transfer_ – transfer knowledge and expectations about the codebase, approaches, quality, etc.
- _Share mutual responsibility_ – foster a sense of collective code ownership
- _Find better solutions_ – generate ideas for new and better solutions that can improve the codebase

## 1.3 Process Overview

There are two (2) participants in a code review: (1) the **author**, who writes the code and sends it for review, and (2) the **reviewer**, who checks the code and decides whether it should be merged to the codebase.

To start a code review, the author creates a **pull request** from their branch into the repository’s main branch. The pull request’s description must contain a **changelist** which contains the set of changes made and why they were made.

Code reviews happen in **rounds**. Each round is one complete round-trip between the author and reviewer: the author sends changes, and the reviewer responds with written feedback on those changes. Every code review has one or more rounds.

The review ends when the reviewer **approves** the changes and merges it to the main branch.

(The above process description was adapted from [How to Do Code Reviews Like a Human (Part One)](https://mtlynch.io/human-code-reviews-1/).)

## 1.4 Git Strategy

We have developed a [Git branching strategy](https://docs.google.com/presentation/d/1Y74gyc_yYdNnXHGdDB3Z87t6m2nYaV2FPzA8b_DH0CE/) at BizKit to standardize how we work together. Please review it if you haven't yet before starting development.

## 1.5 Detailed Steps

1. The author writes the code.
2. The author creates a pull request from their branch to the repository’s develop branch.
3. The author assigns two (2) reviewers to check their code.
4. The author notifies the reviewers by creating a thread in the `#pull-requests` channel of our Discord server. Follow the following format:

```md
[open] [your-name] repo-name pull-request-number
```

Example:

```md
[open] [kevin] erpnext 1
```

Make sure to tag your reviewers and provide a link to your pull requests in the thread message.

5. The reviewers review the code and provide feedback or comments using the repository host’s (as of the time of writing we’re using GitHub) built-in commenting tool.
6. Once the reviewers are done, they notify the author to check the feedback or comments they made through the PR thread on Discord.
7. The author implements fixes or requests or provides explanations on questions.
8. Once issues have been resolved, requests have been implemented, or pending questions have been answered, the author notifies the reviewer to recheck their code.
9. Repeat steps 5 - 8 until the reviewers are satisfied with the changes.
10. The reviewers approve the pull request, squash merge the pull request, and then delete the feature branch.
11. There are two (2) ways to close the Discord PR thread: (1) manually renaming the thread `open` ---> `closed`, and (2) calling the `/close` command within the thread itself.

## 1.6 Affected Projects and Repositories

Code reviews are to be done for the following BizKit repositories when creating pull requests to the main branch:

- Frappe
- ERPNext
- Bench
- BizKit Core

# 2 Author Guidelines

## 2.1 Role

The role of the author is to write the code, test it to the best of their ability, and ensure that it follows best practices and coding standards. Note that even though reviewers are expected to test the author’s code, the author should still test their code prior to submitting a pull request.

Authors initiate the code review process by creating a pull request from their branch to the repository’s main branch. Once the pull request is made, they assign two (2) reviewers to check their code.

It is also their responsibility to implement any changes or improvements requested by their reviewers. But it is also possible that the reviewers are wrong—just as one can accidentally write buggy code, the reviewer may also misunderstand correct code. As such, authors are free to push back on any change requests if they feel that it is incorrect.

But even when the reviewer is wrong, the author must still exercise a level of caution. If they misread it, will others make the same mistake? This could possibly mean that the code is hard to understand or may require some changes to make it clearer. The author may look for ways to refactor the code or add comments that make the code more obviously correct.

## 2.2 Important Reminders

### 2.2.1 Value the Reviewer’s Time

Remember that reviewers have their own tasks as well and are taking time off of them to help out and improve the code. They have a limited amount of focus and energy and so it would be in everyone’s best interests to make things as easy and as smooth as possible.

### 2.2.2 Be the First to Review

Reviewers are not personal quality assurance analysts nor testers. Before submitting our code for review, we must ensure that we’ve checked and tested it to the best of our abilities. It is a waste of everyone’s time to submit faulty or untested code for review.

It is a good practice to read our code first before submitting it. More than just checking for mistakes, we should imagine if it wasn’t us that wrote it and we’re reading it for the first time. What might confuse us?

It can also be helpful to take a break between writing code and reviewing it. We’re often tired by the end of a long coding session and that makes it easier for us to miss glaring issues. We can wait for a bit and look at our code with fresh eyes before submitting it for review.

### 2.2.3 Write a Clear Changelist Description

The changelist description should summarize any information that the reviewer needs. We have to remember that the person looking at the code might not have the same context that we have. Think of having future readers look at the description. Will they be able to understand it without having to talk to us?

A good changelist description explains **what** changes were made at a high level and **why** they were made.

### 2.2.4 Commit Clearly and Commit Often

The same rules for changelists apply to commit messages. One should be able to easily understand the changes made in a single commit even when they have no background knowledge.

Committing often and in smaller chunks highlights the changes made and also makes it easier to review code. At the same time, this makes it easier to revert changes if needed.

### 2.2.5 Break up Large Changes

For our, and our reviewers’, benefit, it would be best to break up large changes into smaller, multiple changes and pull requests. Sending in too many changes at once can make it harder to review code and easier to let issues pass. This can also be a sign of poorly separated tasks or features.

As much as possible, a single pull request or change should aim to add or change just one thing.

### 2.2.6 Learn From Mistakes

Remember that more than catching errors, the goal of code reviews is to improve the overall code quality and capacity of developers. If we make mistakes or the reviewers provide us feedback for improvement, it’d be in our best interest to learn from them and apply them to make our next code review smoother and make ourselves better.

# 3 Reviewer Guidelines

## 3.1 Role

The role of the reviewer is to check the author’s submitted code, test it to the best of their ability, and ensure that it follows best practices and coding standards. Reviewers have a right to request changes or improvements to the author’s code provided that it contributes to the overall quality of the code.

Once the reviewer is satisfied with the author’s work, they approve the pull request and merge it to the main codebase.

## 3.2 Things to Check

Below is a checklist of the things that reviewers should check for and ask themselves during code reviews:

- Am I able to **understand** the code easily?
- Is the code written following the **coding standards/guidelines**?
- Is the same code **duplicated** more than twice?
- Will I be able to **test/debug** the code easily to find the root cause?
- Are functions or classes **too big**? Do they have **too many responsibilities**?
- Will the **performance** be acceptable with huge data?
- Has **security** been taken care of?
- How **maintainable** is the code? Will it require minimal effort to support/update in the future?
- How **extensible** is the code? Will it be easy to add enhancements in the future?
- What did the author **get right**? Give the author some wins!

## 3.3 Important Reminders

### 3.3.1 A Human Is on the Other Side

It can be easy to forget that the author is another human when we’re communicating through comments or only looking at their code. But we must remember that there is still a human on the other side with their own goals, issues, and feelings.

As a reviewer, we are an **ally**, not a gatekeeper. While the goal of code reviews is to improve the quality of the code, it is not worth sacrificing a relationship with a teammate just to push for better variable naming.

Especially when we’re working through the medium of chat, it’s easier to be misunderstood or sound harsh. And so we must walk a fine line between pushing for improvements and taking care of our relationships.

Remember to be sensitive to what the author might feel when making comments and providing feedback. If we can do that then the succeeding reminders will be easy to follow.

### 3.3.2 Frame Feedback as Requests, Not Commands

Compare the following feedback:

| Feedback Framed as Command              | Feedback Framed as Request                     |
| --------------------------------------- | ---------------------------------------------- |
| Move this function to _transaction.js_. | Can we move this function to _transaction.js_? |

Which one sounds more helpful or collaborative?

Just like how reviewers are not the authors’ personal testers, authors are not personal code writers. Though we are reviewing their code, it is still their work. Framing feedback as requests instead of commands has the author feel a sense of autonomy and control over their own work.

Framing feedback as requests also allows the authors to push back in case we are wrong. Maybe the authors have a good reason for writing their code as such or making that choice. If the feedback is framed as a command, any response from the author sounds like they’re disobeying. On the other hand, if it’s a request or a question, the author is simply answering.

### 3.3.3 Provide Examples if Possible

We all have other tasks. It is highly possible that the code we’re reviewing isn’t the only thing that the author is working on. So if we have the time to spare, it would be helpful to provide them examples of the change we’re requesting.

Of course, this has its limits. This is better for smaller, more trivial segments of code. But if we suddenly provide a complete, overhauled solution of the author’s code then it signals that we think they’re incompetent or can’t do their job well.

### 3.3.4 Avoid Using “You”

It’s easy to get attached to our work. The same goes for code. The author put a significant amount of effort into their code and is likely to be proud of it. It is only natural that they’d be attached to it and would react defensively against any feedback they receive.

And so we must provide feedback in a way that lowers those defenses. Remember that we’re reviewing the code and not the author. The presence of bugs in code does not and should not indicate the lack of skill or intelligence of a developer.

Having “you” in comments tends to bring the focus away from the code and brings it to the coder, thereby increasing the chances of them being antagonistic about it.

Instead, we can resort to using **“we”**. For example, instead of saying, “Can you move this function to _transaction.js_?” we can say, “Can we move this function to _transaction.js_?” Doing so reinforces the team’s collective responsibility for the code.

Going back to [3.3.2 Frame Feedback as Requests, Not Commands]({{< relref "code-review-guidelines#332-frame-feedback-as-requests-not-commands" >}}), it is also a good idea to use questions.

Another option is to write in a **passive voice**. While this means death for almost any kind of writing, we aren’t writing for journals or blogs here. “This function can be moved to _transaction.js_.” sounds less antagonistic than, “You should move this function to _transaction.js_.”

### 3.3.5 Learn From the Author

While the role of the reviewer is to check the author’s code and provide feedback for improvement, that doesn’t mean that the reviewer can’t learn from the author as well. Take note of the things that the author did well, praise them for it, and also learn from it.

Again, code reviews are meant to facilitate learning and knowledge transfer and so they are also opportunities for the reviewers to learn.

# 4 Final Reminders

Please note that this process is still open to improvements. Just this because it’s on a document doesn’t mean it’s perfect. So if you, the reader, have any feedback or comments that you think will improve the overall process or requirements, please don’t hesitate to let us know.
