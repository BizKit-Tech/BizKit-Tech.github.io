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
3. Identify the symptoms of the performance issues, such as slow response times, high CPU usage, database connection errors, slow query execution, or disk I/O bottlenecks.

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

##### Keybindings
`htop` provides several keybindings to navigate and interact with the interface. Here are some commonly used keybindings:

- Arrow keys: Navigate through the process list.
- Enter: Expand or collapse a process to show or hide its details.
- F1 or h: Display the htop help screen.
- F2 or S: Sort processes based on a selected column.
- F3 or / or f: Filter processes based on a string.
- F4 or O: Change the sort order (ascending/descending).
- F5 or t: Tree view: Display processes as a process tree.
- F6 or **: Select a field for the detailed view.
- F7 or <: Decrease the nice value (priority) of a process.
- F8 or >: Increase the nice value (priority) of a process.
- F9 or k: Send a signal (kill) to a selected process.
- F10 or q: Quit htop.

##### Display
`htop` provides a comprehensive view of system resources. The default interface is divided into several sections:

- Header: Displays general system information, such as the hostname, uptime, and system load averages
- CPU Meters: Shows a visual representation of CPU usage for each core
- Memory Meters: Displays memory usage, including total, used, and available memory
- Swap Meters: Shows swap usage, including total, used, and free swap
- Tasks: Lists running processes with details, including process ID (PID), user, CPU usage, memory usage, and more
- Footer: Provides information on keybindings and system status

##### Color Legend
`htop` uses color coding to highlight different types of processes and resource usage:

- White: Normal processes
- Green: Running processes
- Blue: Sleeping processes
- Red: Processes using a high amount of CPU
- Magenta: Kernel threads
- Yellow: User-defined processes
- Turquoise: Virtual memory mapped to disk
- Orange: Threads

### C. Investigating RDS Performance Issues

1. Log in to the [AWS Management Console](https://bizkit-tech.signin.aws.amazon.com/console) and navigate to the RDS dashboard.
2. Select the affected RDS database instance.
3. Review the monitoring graphs and logs provided by RDS, focusing on CPU utilization, IOPS, and database-specific metrics.
4. Enable the slow query log in RDS to capture queries taking longer than a specified threshold:
    - In the RDS console, go to the **Parameter groups** tab for the RDS instance.
    - Create or modify the parameter group associated with the RDS instance.
    - Set the `slow_query_log` parameter to `1` to enable the slow query log.
    - Set the `log_output` parameter to `FILE` to write the slow query logs to the file system and publish them to CloudWatch logs.
    - Adjust the `long_query_time` parameter to specify the threshold for a query to be considered slow. The default value is 10 seconds.
    - Apply the modified parameter group to the RDS instance.
5. Monitor the slow query log to identify and analyze queries causing performance issues.

### D. Checking Application Code for Optimization Areas

1. Analyze the code for any performance bottlenecks and work with the development team to optimize those areas.
2. Consider implementing caching mechanisms or query optimizations to reduce the load on the database.

#### When should you check the application code?
##### After initial analysis
Once you have identified performance issues and gathered relevant information about the symptoms, it is a good time to review the application code. This helps to understand how the code interacts with the database and the underlying infrastructure.

##### Database-centric performance issues
If the performance problems are primarily related to database operations, such as slow queries or inefficient data retrieval, reviewing and optimizing the application code can have a significant impact. Analyzing the code can help identify areas where queries can be optimized, data fetching can be optimized, or caching mechanisms can be implemented.

##### High resource utilization
If the initial analysis or monitoring indicates high resource utilization on the application server (EC2 instance), it is worth investigating the application code for any resource-intensive processes, memory leaks, or inefficient algorithms. Optimizing the code can reduce the strain on system resources and improve overall performance.

##### Recurring performance issues
If you frequently encounter performance issues that appear to be related to the application logic, it is important to dig deeper into the code. Reviewing the code for potential optimization areas can help identify recurring patterns or bottlenecks that may need to be addressed systematically.

### E. Tuning Server Configuration
It is recommended to do this in urgent situations or when other investigations have identified database or server misconfigurations.

1. Adjust RDS parameter groups for the affected database instance(s).
2. Modify EC2 instance configurations if necessary (e.g., changing instance type, increasing storage).
3. Optimize query execution plans or indexing strategies for the database.
4. Adjust RDS or EC2 instance scaling settings if applicable.

For more options, refer to [Performance Tuning Methods](/docs/others/performance-tuning-methods).

### F. Implementing Changes and Monitoring

1. Monitor the system after making changes to assess the impact on performance.
2. Utilize AWS CloudWatch or third-party monitoring tools to track relevant metrics and gather real-time insights.
3. Continue monitoring and refining configurations until the desired performance improvements are achieved.

## Documentation

1. Maintain a log of all investigations performed, including the observed symptoms, analysis conducted, and actions taken.
2. Document any changes made to database configurations, instance settings, or other relevant adjustments.

