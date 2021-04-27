---
title: "Set Up an Instance"
description: "Instructions on how to set up an instance."
lead: "Instructions on how to set up an instance."
date: 2021-04-26T15:11:47+08:00
lastmod: 2021-04-26T15:11:47+08:00
draft: false
images: []
menu:
  docs:
    parent: "setup"
weight: 301
toc: true
---

## Prerequisites
- A server running on Ubuntu 20.04.
- SSH access to the server.

## Instructions
1. Set locale.
```sh
sudo update-locale LC_ALL="C.UTF-8"
sudo update-locale LANG="C.UTF-8"
```
**Note:** You might have to restart the server for the changes to take effect.

2. Allocate swap memory.
```sh
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo "/swapfile none swap sw 0 0" | sudo tee -a /etc/fstab
```

3. Add additional system configurations.
```sh
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
echo vm.overcommit_memory=1 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

4. Install dependencies.
```sh
sudo apt-get update
sudo apt-get install -y make build-essential libssl-dev zlib1g-dev \
    libbz2-dev libreadline-dev libjpeg-dev zlib1g-dev libpq-dev \
    wget curl llvm libncurses5-dev libncursesw5-dev \
    xz-utils tk-dev libffi-dev liblzma-dev python-openssl git
```

5. Install pyenv.
```sh
git clone https://github.com/pyenv/pyenv.git ~/.pyenv
```

6. Install python.
```sh
export PYENV_ROOT="$HOME/.pyenv"
export PATH="$PYENV_ROOT/bin:$PATH"
pyenv install 3.6.10
pyenv global 3.6.10
```

7. Add pyenv to path.
```sh
echo 'export PYENV_ROOT="$HOME/.pyenv"' >> ~/.bashrc
echo 'export PATH="$PYENV_ROOT/bin:$PATH"' >> ~/.bashrc
echo -e 'if command -v pyenv 1>/dev/null 2>&1; then\n  eval "$(pyenv init -)"\nfi' >> ~/.bashrc
```
**Note:** You may need to logout then SSH in again for changes to take effect.

8. Install additional prerequisites.
```sh
sudo apt-get install -y screen
sudo apt-get install -y libffi-dev software-properties-common nginx
sudo apt-get install -y xfonts-75dpi fontconfig libxrender1 xfonts-base libxext6
```

9. Install MariaDB.
   - **If the MariaDB server is hosted in the same instance as the application server:**
      1. Install MariaDB server.
        ```sh
        sudo apt-get install -y mariadb-server-10.3
        ```
        **Note:** If you were not asked to set the password, run the following to set it: `mysql_secure_installation`.
      2. Edit MariaDB config.
        ```sh
        sudo nano /etc/mysql/my.cnf
        ```
      3. Add the following to the file:
        ```sh
        [mysqld]
        character-set-client-handshake = FALSE
        character-set-server = utf8mb4
        collation-server = utf8mb4_unicode_ci

        [mysql]
        default-character-set = utf8mb4
        ```
      4. Restart the server.
        ```sh
        sudo service mysql restart
        ```
   - **If the MariaDB server is hosted in a separate instance:**
      1. Install MariaDB client.
        ```sh
        sudo apt-get install -y mariadb-server-10.3
        ```

10. Install Redis.
```sh
sudo apt-get install -y redis-server
```

11. Install Node, npm, and yarn.
```sh
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash
nvm install 12
npm install -g yarn
```

12. Install wkhtmltopdf.
```sh
sudo apt-get -y install xvfb libfontconfig wkhtmltopdf
```

13. Clean up installation files.
```sh
sudo apt-get clean
```

14. Set git config perfmissions.
```sh
sudo chown -R ubuntu .config
```

15. Install Bench.
```sh
git clone https://github.com/BizKit-Tech/bench.git ~/.bench
pip install -e ~/.bench
```

16. Install Frappe.
```sh
bench init frappe-bench --frappe-path https://github.com/BizKit-Tech/frappe.git
```

17. Install ERPNext.
```sh
(cd ~/frappe-bench && bench get-app https://github.com/BizKit-Tech/erpnext.git)
```

18. Install BizKit Core.
```sh
(cd ~/frappe-bench && bench get-app https://github.com/BizKit-Tech/bizkit_core.git)
```

### Converting to Production
1. Install Python 3 and pip for sudo user.
```sh
sudo apt-get install -y python3-pip
```

2. Install Bench for sudo user.
```sh
sudo pip3 install -e ~/.bench
```

3. Setup production.
```sh
sudo bench setup production ubuntu
```

4. Disable fail2ban.
```sh
sudo /etc/init.d/fail2ban stop
```
