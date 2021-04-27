---
title: "Set Up DNS Multitenancy"
description: "Set up DNS multitenancy so hostnames will be resolved to the site/domain name."
lead: "Set up DNS multitenancy so hostnames will be resolved to the site/domain name."
date: 2021-04-27T14:51:31+08:00
lastmod: 2021-04-27T14:51:31+08:00
draft: false
images: []
menu:
  docs:
    parent: "setup"
weight: 303
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

