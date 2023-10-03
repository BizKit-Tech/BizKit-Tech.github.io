---
title: "Logging with Frappe"
description: ""
lead: ""
date: 2023-10-03T19:38:28+08:00
lastmod: 2023-10-03T19:38:28+08:00
draft: false
images: []
menu: 
  docs:
    parent: "others"
weight: 999
toc: true
---

Frappe provides a built-in logging system based on Python's [`logging` module](https://docs.python.org/3/howto/logging.html). Logging is a critical aspect of any application, as it helps developers monitor and troubleshoot issues. This is especially important for Frappe environments running in production where it is not possible to see the `bench` process logs directly, rendering `print` statements impractical.

## Logging Levels

Python's `logging` module defines several logging levels, which are used to categorize log messages based on their severity. Frappe supports the following logging levels:

| Level | When it’s used |
| ----------- | ----------- |
| DEBUG | Detailed information, typically of interest only when diagnosing problems. |
| INFO | Confirmation that things are working as expected. |
| WARNING | An indication that something unexpected happened, or indicative of some problem in the near future (e.g. ‘disk space low’). The software is still working as expected. |
| ERROR | Due to a more serious problem, the software has not been able to perform some function. |
| CRITICAL | A serious error, indicating that the program itself may be unable to continue running. |

## Logging in Frappe

To log messages in Frappe, you can use the `frappe.logger()` object, which is an instance of Python's `logging.Logger`. In Version 13, Log Rotation is employed to preserve the most recent 20 log files, each with a maximum size of 100 kB, in addition to the currently active log file.

### Logging a Message

```python
import frappe

# Log an INFO message
frappe.logger().info("This is an INFO message")

# Log a DEBUG message
frappe.logger().debug("This is a DEBUG message")

# Log a WARNING message
frappe.logger().warning("This is a WARNING message")

# Log an ERROR message
frappe.logger().error("This is an ERROR message")

# Log a CRITICAL message
frappe.logger().critical("This is a CRITICAL message")
```

To log exceptions along with their stack traces, you can use the `exception` method. This function should only be called from an exception handler.

```python
import frappe

try:
    # Some code that may raise an exception
    result = 10 / 0
except Exception as e:
    frappe.logger().exception("An exception occurred")
```

#### frappe.logger 
`frappe.logger(module, with_more_info, allow_site, filter, max_size, file_count)`

Returns a `logging.Logger` object with Site and Bench level logging capabilities. If logger doesn't already exist, it creates and updates `frappe.loggers`.

Arguments:

- **module**: Defines the name of your logger, and consequently, the name of the log file.
- **with_more_info**: When set to `True`, this option will include the `Form Dict` as additional information in the log message; particularly useful for logging information related to HTTP requests.
- **allow_site**: This parameter allows you to explicitly specify the site name under which the logs will be saved. If left unspecified but set to `True`, the system will attempt to guess the appropriate site for logging.
- **filter**: You can use this parameter to add a filter function to your logger.
- **max_size**: Sets the maximum file size for each log file, specified in bytes. When the log file size exceeds this limit, log rotation may occur to manage file size.
- **file_count**: Determines the maximum number of log files to be retained through log rotation. Log rotation helps in managing the number of log files generated.

##### Usage

```python
frappe.logger("schedule").info("Starting backup...")
frappe.logger("schedule").error("Could not send backup file.")
```
```log
2023-10-03 11:30:10,861 INFO frappe Starting backup.
2023-10-03 11:33:04,644 ERROR frappe Could not send backup file.
```
The above entry would be saved in `schedule.log`. 

If there is no module specified, the log would be saved in `frappe.log` by default.

## Viewing Logs

Out of the box, logs are stored under the `./logs` folder in your bench. From Frappe Version 13, logs are available at site level too, under `./sites/{site}/logs`. 