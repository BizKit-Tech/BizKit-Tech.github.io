---
title: "Set Up HTTPS"
description: "Instructions on how to set up HTTPS."
lead: "Instructions on how to set up HTTPS."
date: 2021-04-26T15:11:47+08:00
lastmod: 2021-04-26T15:11:47+08:00
draft: false
images: []
menu:
  docs:
    parent: "setup"
weight: 304
toc: true
---

{{< alert icon="💡" text="Let's Encrypt Certificates expire every three months." >}}

## Prerequisites
- Site is set up in [production mode]({{< relref "set-up-instance#converting-to-production" >}}).
- The site has a registered [custom domain]({{< relref "add-custom-domain" >}}).
- The instance is set up with [DNS multitenancy]({{< relref "set-up-dns-multitenancy" >}}).

## Instructions

1. Run:
```bash
sudo -H bench setup lets-encrypt [site-name] --custom-domain [custom-domain]
```
You will be faced with several prompts, respond to them accordingly. This command will also add an entry to the crontab of the root user (this requires elevated permissions) that will attempt to renew the certificate every month.

## Renew Certificates Manually
```bash
sudo bench renew-lets-encrypt
```
