---
title: "Add Custom Domain"
description: "Add a custom domain to the site."
lead: "Add a custom domain to the site."
date: 2021-04-27T14:30:18+08:00
lastmod: 2021-04-27T14:30:18+08:00
draft: false
images: []
menu:
  docs:
    parent: "setup"
weight: 302
toc: true
---

## Instructions

1. Run:
```bash
bench setup add-domain [domain]
```
2. Regenerate nginx config.
```bash
bench setup nginx
```
3. Reload nginx.
```bash
sudo service nginx reload
```
