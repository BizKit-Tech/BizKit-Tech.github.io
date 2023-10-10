---
title: "Performance Tuning Methods"
description: ""
lead: ""
date: 2023-08-16T19:19:34+08:00
lastmod: 2023-08-16T19:19:34+08:00
draft: false
images: []
menu: 
  docs:
    parent: "others"
weight: 999
toc: true
---

## ERPNext Settings
### Gunicorn Workers

ERPNext uses Gunicorn HTTP server in production mode.

For optimal performance, the number of gunicorn workers needs to be set according to the number of CPU cores your server has. The recommended number is 
```
2 * num_cores + 1
```
(Some say this also depends on RAM. For now, stick to `2 * num_cores`)

It is specified in the **common_site_config.json** file in the **frappe-bench/sites** folder.

After changing gunicorn workers, you need to run:
```
bench setup supervisor
sudo supervisorctl reread
sudo supervisorctl update
```

### HTTP timeout

If you are getting a request timeout error, you can increase the HTTP timeout by following these steps:

1. Update bench config. Take note that the timeout value is in seconds.
```
bench config http_timeout <integer>
bench setup supervisor
bench setup nginx
```

2. Restart services (as root).
```
sudo supervisorctl reload
sudo service nginx reload
```

## MariaDB Settings
### InnoDB Buffer Pool

The InnoDB buffer pool is the memory area where MySQL's InnoDB storage engine caches table and index data as it is accessed. The larger the buffer pool, the more InnoDB acts like an in-memory database, reading data from disk once and then accessing the data from memory during subsequent reads. The buffer pool even caches data changed by insert, update, and delete operations, so that disk writes can be grouped together for better performance.

To get the recommended size for `innodb_buffer_pool_size` (G for gigabytes and M for megabytes), execute this query as root user:
```sql
SELECT CONCAT(CEILING(RIBPS/POWER(1024,pw)),SUBSTR(' KMGT',pw+1,1))
Recommended_InnoDB_Buffer_Pool_Size FROM
(
    SELECT RIBPS,FLOOR(LOG(RIBPS)/LOG(1024)) pw
    FROM
    (
        SELECT SUM(data_length+index_length)*1.1*growth RIBPS
        FROM information_schema.tables AAA,
        (SELECT 1.25 growth) BBB
        WHERE ENGINE='InnoDB'
    ) AA
) A;
```

To check the current `innodb_buffer_pool_size` (in GB), run this query:
```sql
SELECT @@innodb_buffer_pool_size/1024/1024/1024;
```

#### For databases hosted in a non-RDS server
1. Run this command to edit your **my.cnf** file:
```
sudo nano /etc/mysql/my.cnf
```

2. Then copy and paste this at the bottom of your **my.cnf** or include it in the existing `mysqld` section:
```
[mysqld]
innodb_buffer_pool_size=SIZE
innodb_buffer_pool_instances=NUMBER
```

Replace the pool size value by the recommended value from the query. If the recommended pool size is higher than or equal to 2G, select an adequate value for `innodb_buffer_pool_instances` such that each pool size is atleast 1G. (Default is 1)

3. Then restart your MariaDB service by running the following command:

```
sudo service mysql restart
```

#### For databases hosted in an RDS server
1. Go to your RDS dashboard in the AWS Management Console and select your database instance.
2. Navigate to the **Configuration** tab and click on the **DB instance parameter group**.
3. Edit the `innodb_buffer_pool_size` parameter and set it to the recommended value from the query. You can also edit the `innodb_buffer_pool_instances` parameter and set it such that each pool size is atleast 1G.
4. Save the changes and wait for the RDS instance to finish modifying. This may take a few minutes.

---
**Note:** Setting the `innodb_buffer_pool_size` too low could lead to frequent disk I/O, degrading performance, as data would be frequently read from and written to the disk. On the other hand, setting it too high might lead to swapping, which would also degrade performance. The recommended value is 70-80% of the total RAM available on the server. However, sticking to this rule for larger servers might lead to RAM wastage so, in such cases, it might be better to experiment with different values that suit the server without causing swapping.

---


### Wait Timeout

In MySQL, `wait_timeout` and `interactive_timeout` are both variables that determine how long the server should wait for activity on a connection before closing it.

- `wait_timeout` - number of seconds the server waits for activity on a non-interactive connection before closing it. A *non-interactive* connection is one that is used to run a batch job or a script, rather than being used by a user interacting with the MySQL server through a client program.

- `interactive_timeout` - number of seconds the server waits for activity on an interactive connection before closing it. An *interactive* connection is one that is used by a user interacting with the MySQL server through a client program, such as the MySQL command line client or a graphical client like DataGrip.

Both `wait_timeout` and `interactive_timeout` can be set at the global level or per-session level. For non-RDS databases, you can set these variables by using the `SET` statement or specifying them in the **my.cnf** configuration file. And for RDS databases, you can set these variables through the **Parameter groups** in the RDS dashboard (see [InnoDB Buffer Pool](#for-databases-hosted-in-an-rds-server)).

---
**Note:** It's important to note that setting these variables too low can result in connections being closed unexpectedly, while setting them too high can result in unused connections remaining open and consuming resources on the server.

---

#### Sleep Processes

*Sleep* state refers to a situation where the MySQL process has completed its query, yet the client-side has not yet terminated the connection. In many web applications, it's common for connections not to be properly closed, resulting in sleeping MySQL processes. It is not necessarily a cause for worry if there is only a handful of sleeping processes as MySQL will clean them up after a configurable timeout period (`wait_timeout`).

### Max Connections

You can limit the number of connections that can be made to the database by setting the `max_connections` system variable. This can help prevent your database from being overwhelmed by too many connections.

The ideal value for the `max_connections` system variable will depend on your specific application and hardware. Some factors to consider when determining the appropriate value for `max_connections` include:

- Hardware resources: The number of connections that your database can handle will depend on the amount of RAM and CPU resources that are available on your server. As a general rule, the more connections you have, the more memory and CPU resources will be required to manage them.
- Application requirements: The number of connections that your application requires will depend on how heavily it relies on the database, and how many concurrent users it has. For example, a high-traffic web application that relies heavily on the database may need more connections than a smaller application with fewer users.
- MySQL default values: MySQL has default values for `max_connections` that are based on the amount of RAM on the server. For example, on a server with 1GB of RAM, the default value for `max_connections` is 151.

If the value of the `max_connections` system variable is too low, it can cause a number of issues:

- Connection errors: If the number of connections to the database exceeds the maximum number of connections allowed by `max_connections`, any new connection requests will fail, resulting in connection errors for your users.
- Performance issues: If the value of `max_connections` is too low, it can limit the number of concurrent queries that can be processed by the database, which can lead to performance issues and slower query processing times.
- Unnecessary connection overhead: If the value of `max_connections` is too low, it can result in more connections being opened and closed, which can add unnecessary overhead and decrease the performance of your application.

Ultimately, the best way to determine an appropriate value for `max_connections` is to experiment with different values and monitor the performance of your database to see how it responds.

## References

1. <https://discuss.erpnext.com/t/maintenance-for-erpnext-performance/50412/15>
2. <https://discuss.erpnext.com/t/maintenance-for-erpnext-performance/50412/14>
3. <https://github.com/frappe/erpnext/wiki/ERPNext-Performance-Tuning#gunicorn-workers>
4. <https://github.com/jigneshpshah/greycube_helpmanual/wiki/Performance-Tuning-ERPNext#to-increase-http-timeout--to-solve-request-timeout-error>
5. <https://dba.stackexchange.com/a/101000>
6. <https://serverfault.com/a/281439>
7. <https://dba.stackexchange.com/questions/27328/how-large-should-be-mysql-innodb-buffer-pool-size>
8. <https://www.percona.com/blog/80-ram-tune-innodb_buffer_pool_size/>
