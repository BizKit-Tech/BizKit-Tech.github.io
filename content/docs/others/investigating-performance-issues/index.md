---
title: "Investigating Performance Issues"
description: "Standard Operating Procedure (SOP) for Investigating Performance Issues in EC2 and RDS"
lead: "The purpose of this Standard Operating Procedure (SOP) is to provide a structured approach for investigating and resolving performance issues in Amazon EC2 and Amazon RDS (Relational Database Service) instances."
date: 2023-08-16T18:23:32+08:00
lastmod: 2023-08-16T18:23:32+08:00
draft: false
images: []
menu: 
  docs:
    parent: "others"
weight: 999
toc: true
---

## Prerequisites

- Access to the [AWS Management Console](https://ap-southeast-1.console.aws.amazon.com/console/home?region=ap-southeast-1)
- SSH access to EC2 instances
- Ubuntu (or a compatible Linux distribution) installed on the EC2 instances

## Procedure

### A. Initial Analysis

1. Identify the affected EC2 instance(s) or RDS database(s) experiencing performance issues.
2. Monitor user reports and system logs to gather information about the observed issues. Here are some questions that might aid in investigation:
    - When did the site start slowing down?
    - What were some of the last activities in the site?
    - How many users were using the site?
    - Was there a recent deployment? What was it?
    - Have the users observed a pattern in the performance of the site?
3. Identify the symptoms of the performance issues, such as slow response times, high CPU usage, database connection errors, slow query execution, or disk I/O bottlenecks by proceeding to the next steps.

### B. Investigating EC2 Performance Issues

1. SSH into the affected EC2 instance using an SSH client (e.g., PuTTY).
2. Run the `htop` command to analyze system resource utilization:
    - Install `htop` if not already installed using the package manager (e.g., `sudo apt-get install htop`).
    - Launch `htop` by executing the command `htop`.
    - Observe CPU, memory, and disk usage, and identify any processes consuming excessive resources.
    - Take note of any processes or services causing high resource utilization.

#### Using htop
##### Description
`htop` is an interactive process viewer and system monitor for Unix-like systems. It provides a user-friendly interface to monitor the system's resource usage, including CPU, memory, and network activity. `htop` displays information in real-time and allows users to manage and control processes efficiently.

{{< img src="htop.png" alt="htop" class="border-0" >}}

##### Display
`htop` provides a comprehensive view of system resources. The default interface is divided into several sections:

- Header: Displays general system information, such as the load averages, uptime, and number of tasks running on the system.
    - Load average: The average computational work performed by the CPU over the last 1, 5, and 15 minutes. A CPU with 1 core has a maximum load average of 1.00, while a CPU with 4 cores has a maximum load average of 4.00
    - Tasks: The total number of processes and threads running on the system
    - Uptime: The time since the system was last booted
- CPU Meters: Shows a visual representation of CPU usage for each core
- Memory Meters: Displays memory usage, including total, used, and available memory
- Swap Meters: Shows swap usage, including total, used, and free swap
- Tasks: Lists running processes with details, including process ID (PID), user, CPU usage, memory usage, and more
- Footer: Provides information on keybindings and system status

##### Color Legend
`htop` uses color coding to highlight different types of processes and resource usage.

###### For CPU
- Green: Normal (user) processes
- Red: System processes
- Yellow: I/O processes

###### For Memory
- Green: Running processes
- Blue: Buffer pages
- Yellow: Cache memory

##### Process Information
`htop` displays detailed information about each process, including the process ID (PID), user, CPU usage, memory usage, and more.

- PID: The process ID
- USER: The user who started the process
- PRI: The process priority by the kernel
- NI: The process nice value or priority reset by the user (higher values indicate lower priority)
- VIRT: The total amount of virtual memory used by the process
- RES: The total amount of physical memory used by the process
- SHR: The total amount of shared memory used by the process
- S: The process status
    - R: Running
    - S: Sleeping (idle)
    - D: Disk sleep (uninterruptible)
    - Z: Zombie (waiting for parent to read its exit status)
    - T: Traced or suspended (e.g. by SIGTSTP)
- CPU%: The percentage of CPU time used by the process
- MEM%: The percentage of memory used by the process
- TIME+: The total CPU time used by the process
- Command: The command used to start the process

For more information, see the [Linux manual page](https://man7.org/linux/man-pages/man1/htop.1.html) for `htop`.

### C. Investigating RDS Performance Issues

1. Log in to the [AWS Management Console](https://bizkit-tech.signin.aws.amazon.com/console) and navigate to the RDS dashboard.
2. Select the affected RDS database instance.
3. Review the monitoring graphs and logs provided by RDS, focusing on CPU utilization, IOPS, and database-specific metrics.

#### Slow Query Log
Monitor the slow query log to identify and analyze queries causing performance issues. A ready-made dashboard in CloudWatch is available for monitoring slow query logs.
1. In the AWS Management Console, navigate to the CloudWatch dashboard.
2. Select **Dashboards** from the left navigation pane.
3. Select the **slow-query-logs** dashboard. This dashboard displays the slow query logs for all RDS instances with slow query logs enabled.

If slow query log is not yet enabled, enable it by following these steps:
1. In the RDS console, go to the **Parameter groups** tab for the RDS instance.
2. Create or modify the parameter group associated with the RDS instance.
3. Set the `slow_query_log` parameter to `1` to enable the slow query log.
4. Set the `log_output` parameter to `FILE` to write the slow query logs to the file system and publish them to CloudWatch logs.
5. Adjust the `long_query_time` parameter to specify the threshold for a query to be considered slow. The default value is 10 seconds.
6. Apply the modified parameter group to the RDS instance.
7. Add the instance's log file to the list of log files to be monitored in the **slow-query-logs** dashboard in CloudWatch.

#### Real-time Monitoring
##### InnoDB Status
The MySQL InnoDB status provides a detailed report on the current state of the InnoDB storage engine. It can be used to identify the cause of performance issues, such as slow queries or deadlocks.

To show the InnoDB status, run the following command in the MySQL shell:
```
SHOW ENGINE INNODB STATUS;
```

If you want to see the list of locked tables, run the following command in the MySQL shell:
```
SHOW OPEN TABLES WHERE in_use > 0;
```

##### Process List
The MySQL process list contains information about the current running processes on the database server. It can be used to identify long-running queries or processes that are causing performance issues.

To show the process list, run the following command in the MySQL shell:
```
SHOW FULL PROCESSLIST;
```

### D. Checking Application Code for Optimization Areas

Analyze the code for any performance bottlenecks and work with the development team to optimize those areas.
- Utilize the **Network** tab in the browser's developer tools to identify slow requests and analyze the code for potential optimization areas.
- Use Frappe logs for debugging and identifying bottlenecks in the code. This is especially useful when running the application in production mode.
- In developer mode, view real-time logs in the terminal window where `bench start` is running.
    - When you write print statements in your Python code, the output will be displayed in the terminal window.


#### Network Tab
The Network tab in a browser's developer tools allows you to monitor and analyze the network activity between the browser and the server, helping you identify bottlenecks, slow-loading resources, and other issues that might affect the overall performance of your web application.

{{< img src="network-tab.png" alt="Network Tab" class="border-0" >}}

##### How to use the Network tab

1. Open the browser's developer tools by right-clicking on your web page and selecting **Inspect** or **Inspect Element.** Alternatively, you can use keyboard shortcuts like F12 or Ctrl+Shift+I (Windows/Linux) or Cmd+Option+I (Mac) to open the Developer Tools panel.
2. Within the Developer Tools panel, find and select the **Network** tab. This tab displays a timeline of all network requests made by the web page.
3. Reload the page. This will capture all the network requests made during the page load.
4. As the page loads, you'll see various network requests being recorded in the Network tab. The timeline displays details such as the request type (e.g., GET, POST), the resource's URL, status codes, and timing information.
5. Analyze the requests and responses to identify slow requests and potential optimization areas. Look for the following details:
    - Response Time: Check the **Time** column to see how long each request takes to complete. Slow responses might indicate issues with the server or network.
    - Status Codes: Check the **Status** column to identify any failed requests (e.g., 404 or 500 errors).
    - Size: Analyze the **Size** column to see the size of the resources being loaded. Large resources can slow down page loading.
    - Waterfall Chart: The waterfall chart provides a visual representation of when requests start and finish relative to each other. This can help you identify dependencies and bottlenecks.
6. Use filters and sorting options to focus on specific types of requests (e.g., XHR, images, scripts) or to sort requests by different criteria (e.g., response time, size). This can help you isolate specific types of performance issues.

#### Frappe Logs
Frappe logs can include information about errors and exceptions that have occurred, as well as various types of debugging and diagnostic information.

*See [Logging with Frappe](/docs/others/logging-with-frappe) for details on how to use Frappe's built-in logging system.*

##### Desk Logs
Logs that track operational events: usually user activities that happen in the frontend. They can be accessed via the Desk UI.
- Access Log
- Activity Log
- Error Log
- Scheduled Job Log
 
##### Server Logs
Logs that are generated by the Frappe application on the server level. They generally consist of lower level, transactional data. From your frappe-bench folder, you may find logs under:
- `./logs`
- `./sites/{site}/logs`

Here are the types of server logs:
- `bench.log`
- `scheduler.log`
- `worker.log`
- `worker.error.log`
- `frappe.log`
- `backup.log`

#### When should you check the application code?

##### High resource utilization
If the initial analysis or monitoring indicates high resource utilization on the application server (EC2 instance), it is worth investigating the application code for any resource-intensive processes, memory leaks, or inefficient algorithms. Optimizing the code can reduce the strain on system resources and improve overall performance.

##### Database-centric performance issues
If the performance problems are primarily related to database operations, such as slow queries or inefficient data retrieval, reviewing and optimizing the application code can have a significant impact. Analyzing the code can help identify areas where queries can be optimized, data fetching can be optimized, or caching mechanisms can be implemented.

##### Recurring performance issues
If you frequently encounter performance issues that appear to be related to the application logic, it is important to dig deeper into the code. Reviewing the code for potential optimization areas can help identify recurring patterns or bottlenecks that may need to be addressed systematically.

### E. Tuning Server Configuration
It is recommended to do this in urgent situations or when other investigations have identified database or server misconfigurations.

1. Adjust RDS parameter groups for the affected database instance(s).
2. Modify EC2 instance configurations if necessary (e.g., changing instance type, increasing storage).
3. Optimize query execution plans or indexing strategies for the database.
4. Adjust RDS or EC2 instance scaling settings if applicable.

More details can be found in the [Performance Tuning Methods](/docs/others/performance-tuning-methods) document.

### F. Implementing Changes and Monitoring

1. Monitor the system after making changes to assess the impact on performance.
2. Utilize AWS CloudWatch or third-party monitoring tools to track relevant metrics and gather real-time insights.
3. Continue monitoring and refining configurations until the desired performance improvements are achieved.

## Documentation

1. Maintain a log of all investigations performed, including the observed symptoms, analysis conducted, and actions taken.
2. Document any changes made to database configurations, instance settings, or other relevant adjustments.
3. Record the results of the changes and the impact on performance.
