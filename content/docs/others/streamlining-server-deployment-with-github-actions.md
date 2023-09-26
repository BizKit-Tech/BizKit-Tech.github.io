---
title: "Streamlining Server Deployment with Github Actions"
description: ""
lead: "Author/s: Gab Barbudo"
date: 2023-09-13T13:43:10+08:00
draft: false
menu: 
  docs:
    parent: "others"
weight: 999
toc: true
---
## Introduction

### A. Problem

Deploying code to development servers can be a time-consuming and error-prone process when done manually. As of this writing, we have a total of 11 development servers, each requiring the following steps for deployment:

1. Make changes to the codebase
2. Push the changes to GitHub
3. SSH into each individual dev server
4. Pull the latest changes from GitHub
5. Depending on the nature of the changes, execute `bench migrate`, `bench build` or `bench import-initial-customization`

As the development team continues to grow and the frequency of code deployments increases, this manual process becomes increasingly inefficient and error-prone. It not only consumes valuable developer time but also introduces the risk of human errors creeping into the deployment process.

### B. Solution

To address the challenges posed by manual deployment, we could automate the entire deployment process using [**GitHub Actions**](https://docs.github.com/en/actions/learn-github-actions/understanding-github-actions). Since our source code is already hosted on GitHub, automating deployments with GitHub Actions provides an ideal solution.

**Ideal Process:**
1. Developers make changes to the codebase
2. They push the changes to GitHub
3. GitHub Actions automatically deploys the changes to the appropriate development servers

By leveraging GitHub Actions, we can streamline the deployment process, making it more efficient, consistent, and less error-prone.

## Creating the GitHub Actions Workflow

In this section, we will go through the process of creating a GitHub Actions workflow to automate the deployment of our code to multiple development servers.

### A. Creating the Base Workflow: One Job for Every Server

To start automating our deployment process, let's follow these steps:

#### 1. Create a New .yaml File for the Workflow

Let's begin by creating a new `.yaml` file in the `.github/workflows` folder within our repository to define the workflow. Let's name it `deploy-to-dev-servers.yaml`. This file will contain the instructions for GitHub Actions.

#### 2. Trigger Workflow on Push to Test Branch

Next, we are going to configure the workflow to trigger when code changes are pushed to the desired branch (e.g., `test`). We can use the `on` keyword to specify the event that triggers the workflow, like this:

```yaml
name: Deploy-to-Dev
run-name: Deploy to development servers by @${{ github.actor }}

on:
  push:
    branches:
      - test
```

#### 3. Define the Environment Variables

To ensure security and avoid hardcoding sensitive information, such as SSH keys, access tokens, and server IP addresses, we will use [GitHub Secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions#about-secrets) to store these values securely. GitHub Secrets can be accessed within our workflow, and they help keep our credentials safe.

We can utilize the `env` and GitHub [contexts](https://docs.github.com/en/actions/learn-github-actions/contexts) to define and access these variables. This centralizes our configuration for easy maintenance and readability. For instance:

```yaml
env:
  APP: erpnext
  APP_PATH: frappe-bench/apps/erpnext
  V13_BRANCH: test
  REPO_URL: git@github.com:${{ github.repository }}.git
  TOKEN: ${{ secrets.GIT_TOKEN }}
  SSH_USER: ${{ secrets.EC2_USERNAME }}
  SSH_KEY: ${{ secrets.EC2_SSH_KEY }}
```

#### 4. Create a Job for Every Server

Because at this point we still don't know any better, we will be creating a separate job for each server. This is not ideal because it will be difficult to maintain as the number of servers grows, but we will get to that later. For now, let's do it this way.

- **Name the Job After the Server**: Let's give each job a clear and descriptive name based on the server it deploys to.

  ```yaml
  jobs:
    fork-dev:
      runs-on: ubuntu-latest
      env:
        SERVER_NAME: fork_dev
        SERVER_IP: ${{ secrets.FORK_DEV }}
  ```

- **Checkout the Code**: We will utilize the `actions/checkout@v2` action to check out the code from our repository. This action makes our repository content available for the workflow.

  ```yaml
      steps:
        - uses: actions/checkout@v2
  ```

- **Check What Type of Files Were Changed**: To determine the type of changes made in the code, we will use the `dorny/paths-filter@v2` action. This action allows us to filter paths based on file extensions, making it easier to decide whether to run `bench migrate`, `bench build`, or `bench import-initial-customization`.

  ```yaml
        - uses: dorny/paths-filter@v2
          id: filter
          with:
            filters: |
              python:
                - '${{ env.APP }}/**/*.py'
              json:
                - '${{ env.APP }}/**/*.json'
              js:
                - '${{ env.APP }}/**/*.js'
              customizations:
                - '${{ env.APP }}/customizations/custom_fields/**'
                - '${{ env.APP }}/customizations/custom_properties/**'
                - '${{ env.APP }}/customizations/custom_scripts/**'
                - '${{ env.APP }}/customizations/print_formats/**'
              public:
                - '${{ env.APP }}/public/**'
              custom_fields:
                - '${{ env.APP }}/customizations/initial/custom_fields/**'
              custom_properties:
                - '${{ env.APP }}/customizations/initial/custom_properties/**'
              custom_scripts:
                - '${{ env.APP }}/customizations/initial/custom_scripts/**'
              print_formats:
                - '${{ env.APP }}/customizations/initial/print_formats/**'
            base: ${{ github.ref }}
  ```

- **SSH into the Server**: Inside the job, we are going to set up SSH keys and a configuration file for the SSH client. This enables secure access to the target development server.

  For this to work, we must add the Amazon EC2 public key associated with GitHub Actions to the `authorized_keys` file on the server. This configuration step must be done to all of our development servers.
  
  ```yaml
        - name: Configure SSH
          shell: bash
          run: |
            mkdir -p ~/.ssh/
            echo "$SSH_KEY" > ~/.ssh/${{ env.SERVER_NAME }}.key
            chmod 600 ~/.ssh/${{ env.SERVER_NAME }}.key
            cat >>~/.ssh/config <<END
            Host ${{ env.SERVER_NAME }}
              HostName ${{ env.SERVER_IP }}
              User $SSH_USER
              IdentityFile ~/.ssh/${{ env.SERVER_NAME }}.key
              StrictHostKeyChecking no
            END
          env:
            SSH_USER: ${{ env.SSH_USER }}
            SSH_KEY: ${{ env.SSH_KEY }}
  ```

- **Pull the Code**: Instead of using `git pull` using the web URL, which would require developer credentials on the server, we will use the SSH method. 

  To do this, we need to set up SSH keys within the dev servers and add these keys to our organization's GitHub account (bizkit-engineer). This will allow the server to pull the code from GitHub without requiring developer credentials.

  We can generate an SSH key without a passphrase in our local machine by running:

  ```powershell
  ssh-keygen -t rsa
  ```

  And then we will copy the contents of the generated public key (`id_rsa.pub`) and [add it to our organization's GitHub account](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/adding-a-new-ssh-key-to-your-github-account). It is best to label it GitHub Actions so it's easily identifiable.

  We now need to copy the keys (`id_rsa` and `id_rsa.pub`) to the dev servers and save them inside the `~/.ssh` directory. Make sure the keys are secure by running the following commands inside the directory where the keys are saved:
  
  ```powershell
  chmod 400 id_rsa
  chmod 400 id_rsa.pub
  ```
  
  Then, we need to create a `git_pull.sh` file in the root directory of the server. This file will contain the commands to pull the code from GitHub. It takes three arguments: the path to the app, the repository URL, and the branch name. It first changes the directory to the app path, then checks out the specified branch and pulls the code from the repository.

  ```bash
  #!/bin/bash
  cd $1
  git checkout $3
  git pull $2 $3
  ```
  
  Finally, we add a step to the job (remember: the GitHub Actions workflow) to execute this script.
  
  ```yaml
        - name: Run git pull
          shell: bash
          run: ssh ${{ env.SERVER_NAME }} '"bash ./git_pull.sh ${{ env.APP_PATH }} ${{ env.REPO_URL }} ${{ env.V13_BRANCH }}'
  ```

- **Do `bench migrate`, `bench build` or `bench import-initial-customization` Depending on the Files Changed**: Finally, we are going to create a step to execute the appropriate command (`bench migrate`, `bench build`, or `bench import-initial-customization`) based on the type of changes detected. <a name="bench-command-depending-on-file-changed"></a>

  For this step, we need to create three bash scripts and save them in the root directory of the dev servers so we can run the `bench` commands, similar to the previous step.

  First, let's create `./bench_migrate.sh` which is responsible for the `bench migrate` command. It takes in one argument, which is the app name.
  ```bash
  #! /usr/bin/bash
  cd frappe-bench
  /home/ubuntu/.pyenv/shims/bench migrate
  ```

  Next, let's create `./bench_build.sh` which is responsible for the `bench build` command. It also takes in the app name as an argument.
  ```bash
  #! /usr/bin/bash
  cd frappe-bench
  /home/ubuntu/.pyenv/shims/bench build --app $1
  ```

  Lastly, let's create `./bench_import_initial_customization.sh` which is responsible for the `bench import-initial-customization` command. It takes in two arguments: the app name and the customization type (`custom_fields`, `custom_porperties`, `custom_scripts`, `print_formats`).

  ```bash
  #! /usr/bin/bash
  cd frappe-bench
  /home/ubuntu/.pyenv/shims/bench import-initial-customization $1 $2
  ```

  As you may have noticed, we are not simply using `bench` in the scripts because we will be executing them using the `ssh` command without logging into a shell prompt. This method will not initialize the environment we are connecting to, so if `bench` is installed in a Python virtual environment, we need to specify its absolute file path so it can be executed properly.

  *Note: The bash scripts can be further improved by doing something like the script below (which you will also see later in this document):*

  ```bash
  #! /usr/bin/bash
  if [ "$(which bench)" ]; then 
    bench_path="$(which bench)";
  else 
    bench_path="/home/ubuntu/.pyenv/shims/bench";
  fi
  cd frappe-bench
  $bench_path build --app $1
  ```

  Now that we have the scripts, we can add the steps to the job. We will use the `if` keyword to execute the step only if the corresponding file type was changed. For example, if a Python file was changed, we will execute the `bench migrate` command. If a file inside the `customizations/initial` folder was changed, we will execute the `bench import-initial-customization` command. If a public JS file was changed, we will execute the `bench build` command. Here is how it looks like:

  ```yaml
        - name: Run bench migrate
          shell: bash
          if: steps.filter.outputs.python == 'true' || steps.filter.outputs.json == 'true' || steps.filter.outputs.customizations == 'true' || steps.filter.outputs.js == 'true'
          run: ssh ${{ env.SERVER_NAME }} 'bash ./bench_migrate.sh'

        - name: Run bench build
          shell: bash
          if: steps.filter.outputs.public == 'true'
          run: ssh ${{ env.SERVER_NAME }} 'bash ./bench_build.sh ${{ env.APP }}'

        - name: Import initial custom fields
          shell: bash
          if: steps.filter.outputs.custom_fields == 'true'
          run: ssh ${{ env.SERVER_NAME }} 'bash ./bench_import_initial_customization.sh ${{ env.APP }} custom_fields'

        - name: Import initial custom properties
          shell: bash
          if: steps.filter.outputs.custom_properties == 'true'
          run: ssh ${{ env.SERVER_NAME }} 'bash ./bench_import_initial_customization.sh ${{ env.APP }} custom_properties'

        - name: Import initial custom scripts
          shell: bash
          if: steps.filter.outputs.custom_scripts == 'true'
          run: ssh ${{ env.SERVER_NAME }} 'bash ./bench_import_initial_customization.sh ${{ env.APP }} custom_scripts'
        
        - name: Import initial print formats
          shell: bash
          if: steps.filter.outputs.print_formats == 'true'
          run: ssh ${{ env.SERVER_NAME }} 'bash ./bench_import_initial_customization.sh ${{ env.APP }} print_formats'
  ```

But imagine duplicating all of the steps above for every job and across multiple repositories. It would be a nightmare to maintain. So, instead of repeatedly defining the steps, we can create a reusable job with the necessary steps and use it for every job in our main workflow. This is where GitHub's [**composite actions**](https://docs.github.com/en/actions/creating-actions/creating-a-composite-action) come in.

### B. Refactoring the Workflow (Part 1): Creating a Composite Action

Let's start by creating a new GitHub repository named `bizkit_composite_actions`. Inside this repository, let's establish a folder structure as follows:
   - Create an `actions` folder.
   - Inside the `actions` folder, create a new folder named `deploy-to-ec2`.
   - Inside the `deploy-to-ec2` folder, create a file named `action.yaml`. This file will house our composite action.

We can now proceed to define the composite action.

First, we want to ensure our composite action can be adaptable across different jobs with varying parameters. We can do that by utilizing action [inputs](https://docs.github.com/en/actions/creating-actions/metadata-syntax-for-github-actions#inputs). These inputs will enable us to pass necessary parameters to the action dynamically.

```yaml
name: "Deploy to EC2"
description: "Pushes changes to EC2 server"

inputs:
  app_name:
    description: "Name of the app (e.g. erpnext)"
    required: true
  app_path:
    description: "File path of the app (e.g. frappe-bench/apps/erpnext)"
    required: true
  branch_name:
    description: "Name of the branch to deploy (e.g. test)"
    required: true
  server_name:
    description: "Name of the server to deploy to (e.g. bizkit_dev)"
    required: true
  server_ip:
    description: "IP address of the server to deploy to"
    required: true
  ssh_user:
    description: "SSH username for the server"
    required: true
  ssh_key:
    description: "SSH key for the server"
    required: true
  bench_migrate_script:
    description: "Command for running bench migrate"
    required: false
    default: "bash ./bench_migrate.sh"
  bench_build_script:
    description: "Command for running bench build"
    required: false
    default: "bash ./bench_build.sh"
  bench_import_initial_customization_script:
    description: "Command for running bench import-initial-customization"
    required: false
    default: "bash ./bench_import_initial_customization.sh"
  git_pull_script:
    description: "Command for running git pull"
    required: false
    default: "bash ./git_pull.sh"
```

Next, let's define the steps of the action within the `action.yaml` file. We will use the steps we have already implemented in our original workflow script. These steps should encapsulate the logic for checking file changes, SSH access, code retrieval, and the execution of `bench` commands.

```yaml
runs:
  using: "composite"
  steps:
    - uses: dorny/paths-filter@v2
      id: filter
      with:
        filters: |
          python:
            - '${{ inputs.app_name }}/**/*.py'
          json:
            - '${{ inputs.app_name }}/**/*.json'
          js:
            - '${{ inputs.app_name }}/**/*.js'
          customizations:
            - '${{ inputs.app_name }}/customizations/custom_fields/**'
            - '${{ inputs.app_name }}/customizations/custom_properties/**'
            - '${{ inputs.app_name }}/customizations/custom_scripts/**'
            - '${{ inputs.app_name }}/customizations/print_formats/**'
          public:
            - '${{ inputs.app_name }}/public/**'
          custom_fields:
            - '${{ inputs.app_name }}/customizations/initial/custom_fields/**'
          custom_properties:
            - '${{ inputs.app_name }}/customizations/initial/custom_properties/**'
          custom_scripts:
            - '${{ inputs.app_name }}/customizations/initial/custom_scripts/**'
          print_formats:
            - '${{ inputs.app_name }}/customizations/initial/print_formats/**'
        base: ${{ github.ref }}
      
    - name: Configure SSH
      shell: bash
      run: |
        mkdir -p ~/.ssh/
        echo "$SSH_KEY" > ~/.ssh/${{ inputs.server_name }}.key
        chmod 600 ~/.ssh/${{ inputs.server_name }}.key
        cat >>~/.ssh/config <<END
        Host ${{ inputs.server_name }}
          HostName ${{ inputs.server_ip }}
          User $SSH_USER
          IdentityFile ~/.ssh/${{ inputs.server_name }}.key
          StrictHostKeyChecking no
        END
      env:
        SSH_USER: ${{ inputs.ssh_user }}
        SSH_KEY: ${{ inputs.ssh_key }}

    - name: Run git pull
      shell: bash
      run: ssh ${{ inputs.server_name }} '${{ inputs.git_pull_script }} ${{ inputs.app_path }} ${{ env.REPO_URL }} ${{ inputs.branch_name }}'
      env:
        REPO_URL: git@github.com:${{ github.repository }}.git

    - name: Run bench migrate
      shell: bash
      if: steps.filter.outputs.python == 'true' || steps.filter.outputs.json == 'true' || steps.filter.outputs.customizations == 'true' || steps.filter.outputs.js == 'true'
      run: ssh ${{ inputs.server_name }} '${{ inputs.bench_migrate_script }}'

    - name: Run bench build
      shell: bash
      if: steps.filter.outputs.public == 'true'
      run: ssh ${{ inputs.server_name }} '${{ inputs.bench_build_script }} ${{ inputs.app_name }}'

    - name: Import initial custom fields
      shell: bash
      if: steps.filter.outputs.custom_fields == 'true'
      run: ssh ${{ inputs.server_name }} '${{ inputs.bench_import_initial_customization_script }} ${{ inputs.app_name }} custom_fields'

    - name: Import initial custom properties
      shell: bash
      if: steps.filter.outputs.custom_properties == 'true'
      run: ssh ${{ inputs.server_name }} '${{ inputs.bench_import_initial_customization_script }} ${{ inputs.app_name }} custom_properties'

    - name: Import initial custom scripts
      shell: bash
      if: steps.filter.outputs.custom_scripts == 'true'
      run: ssh ${{ inputs.server_name }} '${{ inputs.bench_import_initial_customization_script }} ${{ inputs.app_name }} custom_scripts'
    
    - name: Import initial print formats
      shell: bash
      if: steps.filter.outputs.print_formats == 'true'
      run: ssh ${{ inputs.server_name }} '${{ inputs.bench_import_initial_customization_script }} ${{ inputs.app_name }} print_formats'
```

And that's it! We have successfully created a composite action. Now, we can use this action in our workflow script.

Going back to our original workflow script, we are going to replace the steps starting from the step that uses `dorny/paths-filter@v2` to the last step with our composite action.

Because the composite action resides in a private repository, we need to add this step first:

```yaml
    - name: Get composite action repo
      uses: actions/checkout@v2
      with:
        repository: BizKit-Tech/bizkit_composite_actions
        path: .github/bizkit_actions
        token: ${{ env.TOKEN }}
```

This step checks out the composite action repository and stores it in the `.github/bizkit_actions` folder in our container, ready for use.

Finally, in our workflow script, we can utilize the composite action like this:

```yaml
    - name: Deploy to server
      uses: ./.github/bizkit_actions/actions/deploy-to-ec2
      with:
        app_name: ${{ env.APP }}
        app_path: ${{ env.APP_PATH }}
        branch_name: ${{ env.V13_BRANCH }}
        server_name: ${{ matrix.server_name }}
        server_ip: ${{ secrets[matrix.server_name] }}
        ssh_user: ${{ env.SSH_USER }}
        ssh_key: ${{ env.SSH_KEY }}
```

The workflow script at this point should look something like this, but with multiple jobs having the same steps:

```yaml
name: Deploy-to-Dev
run-name: Deploy to development servers by @${{ github.actor }}

on:
  push:
    branches:
      - test

env:
  APP: bizkit_core
  APP_PATH: frappe-bench/apps/bizkit_core
  V13_BRANCH: test
  REPO_URL: git@github.com:${{ github.repository }}.git
  TOKEN: ${{ secrets.GIT_TOKEN }}
  SSH_USER: ${{ secrets.EC2_USERNAME }}
  SSH_KEY: ${{ secrets.EC2_SSH_KEY }}

jobs:
  fork-dev:
    runs-on: ubuntu-latest
    env:
      SERVER_NAME: fork_dev
      SERVER_IP: ${{ secrets.FORK_DEV }}

    steps:
      - uses: actions/checkout@v2
      - name: Get composite action repo
        uses: actions/checkout@v2
        with:
          repository: BizKit-Tech/bizkit_composite_actions
          path: .github/bizkit_actions
          token: ${{ env.TOKEN }}
      - name: Deploy to server
        uses: ./.github/bizkit_actions/actions/deploy-to-ec2
        with:
          app_name: ${{ env.APP }}
          app_path: ${{ env.APP_PATH }}
          branch_name: ${{ env.V13_BRANCH }}
          server_name: ${{ env.SERVER_NAME }}
          server_ip: ${{ env.SERVER_IP }}
          ssh_user: ${{ env.SSH_USER }}
          ssh_key: ${{ env.SSH_KEY }}
```

Looks good so far, but we can still improve it further. Since every job is still using the same steps, why don't we just loop through a list of our dev servers? Good thing GitHub Actions has [**matrix strategies**](https://docs.github.com/en/actions/using-jobs/using-a-matrix-for-your-jobs) that allow us to do just that.

### C. Refactoring the Workflow (Part 2): Using a Matrix Strategy

A matrix strategy allows us to run a job multiple times with different configurations. This is perfect for our use case because we can run the same job for every server, but with different parameters.

To use a matrix strategy, we need to define the matrix in the `jobs` section of our workflow script. We can do this by adding a `strategy` section inside the job. The `strategy` section contains the `matrix` section, which defines the matrix. The matrix is then defined by specifying the variables followed by their array of values. In our case, we want to define the `server_name` variable.

```yaml
jobs:
  deploy:
    name: Deploy to Dev
    runs-on: ubuntu-latest

    strategy:
      fail-fast: false
      matrix:
        server_name: [FORK_DEV, GIORMI_DEV, LUXEN_DEV, NORI_DEV, TTC_DEV, RAMESH_DEV, LANCE_DEV]
```

Take note that the values must be the same as the names of the secrets we defined in our repository. For example, we have a secret named `FORK_DEV` that contains the IP address of the `fork_dev` server. We also have a secret named `GIORMI_DEV` that contains the IP address of the `giormi_dev` server. And so on. This is important because we will be using the values of the `server_name` variable to access the corresponding secrets.

Then we can proceed to define the steps of the job. The workflow should now look like this:

```yaml
name: Deploy-to-Dev
run-name: Deploy to development servers by @${{ github.actor }}

on:
  push:
    branches:
      - test

env:
  APP: erpnext
  APP_PATH: frappe-bench/apps/erpnext
  V13_BRANCH: test
  REPO_URL: git@github.com:${{ github.repository }}.git
  TOKEN: ${{ secrets.GIT_TOKEN }}
  SSH_USER: ${{ secrets.EC2_USERNAME }}
  SSH_KEY: ${{ secrets.EC2_SSH_KEY }}

jobs:
  deploy:
    name: Deploy to Dev
    runs-on: ubuntu-latest

    strategy:
      fail-fast: false
      matrix:
        server_name: [FORK_DEV, GIORMI_DEV, LUXEN_DEV, NORI_DEV, TTC_DEV, RAMESH_DEV, LANCE_DEV]
    
    steps:
      - uses: actions/checkout@v2

      - name: Get composite action repo
        uses: actions/checkout@v2
        with:
          repository: BizKit-Tech/bizkit_composite_actions
          path: .github/bizkit_actions
          token: ${{ env.TOKEN }}
      
      - name: Deploy to server
        uses: ./.github/bizkit_actions/actions/deploy-to-ec2
        with:
          app_name: ${{ env.APP }}
          app_path: ${{ env.APP_PATH }}
          branch_name: ${{ env.V13_BRANCH }}
          server_name: ${{ matrix.server_name }}
          server_ip: ${{ secrets[matrix.server_name] }}
          ssh_user: ${{ env.SSH_USER }}
          ssh_key: ${{ env.SSH_KEY }}
```

It looks a lot cleaner than the previous iterations, doesn't it?

But wait, there's more ~

### D. Checking for Skipped Dev Servers

We are almost done, but there is one more thing we need to do. Sometimes there is a need to skip a dev server from the deployment process. For instance, we might want to skip the `fork_dev` server because it is being used for user training and we don't want to disrupt the users. It is not ideal to remove the `fork_dev` server from the matrix because we still need to deploy to it again in the future. So, what we need is a way to skip a server without removing it from the matrix.

We now know how to create a composite action so we can use that knowledge to create a new one that will check if a server should be skipped or not. Let's call it `check-auto-updates`.

As usual, in the same repository as the `deploy-to-ec2` action, we start by creating a new folder for the composite action. This time we will name it `check-auto-updates`. Inside this folder, we create the `action.yaml` file.

Similar to the `deploy-to-ec2` action, we are going to define the inputs of the action.

```yaml
name: "Check Auto Updates"
description: "Check if automatic updates are enabled on the server"

inputs:
  server_name:
    description: "Name of the server to deploy to (e.g. bizkit_dev)"
    required: true
  server_ip:
    description: "IP address of the server to deploy to"
    required: true
  ssh_user:
    description: "SSH username for the server"
    required: true
  ssh_key:
    description: "SSH key for the server"
    required: true
```

Now, the following is something we have not discussed before. We want this action to return a value indicating whether the server should be skipped or not. So, we will declare [outputs](https://docs.github.com/en/actions/creating-actions/metadata-syntax-for-github-actions#outputs-for-composite-actions) for the action.

```yaml
outputs:
  auto-update:
    description: "Whether or not to update the server"
    value: ${{ steps.check-auto-updates.outputs.auto-updates-enabled }}
  bench-path:
    description: "Path to bench"
    value: ${{ steps.get-bench-path.outputs.bench-path }}
```

The value of the outputs will be set by the steps of the action, which makes the ID of the steps important. We will be using the `id` keyword to set the ID of the steps.

In this workflow, the first thing that we want to do is to configure SSH access to the server the same way we did in the `deploy-to-ec2` action.

```yaml
runs:
  using: "composite"
  steps:
    - name: Configure SSH
      shell: bash
      run: |
        mkdir -p ~/.ssh/
        echo "$SSH_KEY" > ~/.ssh/${{ inputs.server_name }}.key
        chmod 600 ~/.ssh/${{ inputs.server_name }}.key
        cat >>~/.ssh/config <<END
        Host ${{ inputs.server_name }}
          HostName ${{ inputs.server_ip }}
          User $SSH_USER
          IdentityFile ~/.ssh/${{ inputs.server_name }}.key
          StrictHostKeyChecking no
        END
      env:
        SSH_USER: ${{ inputs.ssh_user }}
        SSH_KEY: ${{ inputs.ssh_key }}
```

Next, we want to get the path to `bench` on the server because, as discussed previously, executing commands over SSH does not initialize the environment of the server so `bench` will not be detected if it is installed inside a Python virtual environment.

We can do this by creating a new step that executes a bash script that outputs the path to `bench` and [assigns it](https://docs.github.com/en/actions/using-workflows/workflow-commands-for-github-actions#setting-an-output-parameter) to the `bench-path` variable. In this script, if `which bench` returns nothing, then that means `bench` must be inside `/home/ubuntu/.pyenv/shims/`.

```yaml
    - name: Get path to bench
      id: get-bench-path
      shell: bash
      run: |
        echo "bench-path=$(
        ssh ${{ inputs.server_name }} bash <<'EOF'
        if [ "$(which bench)" ];
        then echo "$(which bench)";
        else echo "/home/ubuntu/.pyenv/shims/bench";
        fi
        EOF
        )
        " >> $GITHUB_OUTPUT
```

Take note of the syntax used to execute the script. We are using the `<<` operator to pass the script as input to the `bash` command. This is called a [here document](https://www.howtogeek.com/719058/how-to-use-here-documents-in-bash-on-linux/). The `'EOF'` is used to mark the end of the document. It is also important that the last `EOF`, `)` and `"` are on different lines to mark the end of each section of the command. If you put them on the same line, the command will not work.

Then, we want to check if automatic updates are enabled on the server. We can do this by creating another step that executes a bash script. The script will check the value of `auto_updates_enabled` in the site config of the server and returns it as an output.

```yaml
    - name: Check auto updates config
      id: check-auto-updates
      shell: bash
      run: echo "auto-updates-enabled=$(ssh ${{ inputs.server_name }} 'cd frappe-bench && echo $(${{ env.BENCH_PATH }} get-site-config auto_updates_enabled)')" >> $GITHUB_OUTPUT
      env:
        BENCH_PATH: ${{ steps.get-bench-path.outputs.bench-path }}
```

(I am not going to discuss the `auto_updates_enabled` config here in detail. But just know that there is now a new checkbox in the System Settings doctype that allows System Managers to enable or disable automatic updates for a site. It modifies the `auto_updates_enabled` config in `site_config.json`. There is also a new `bench` command called `get-site-config` that gets a specific value from the site config.)

The final code should look like this:

```yaml
name: "Check Auto Updates"
description: "Check if automatic updates are enabled on the server"

inputs:
  server_name:
    description: "Name of the server to deploy to (e.g. bizkit_dev)"
    required: true
  server_ip:
    description: "IP address of the server to deploy to"
    required: true
  ssh_user:
    description: "SSH username for the server"
    required: true
  ssh_key:
    description: "SSH key for the server"
    required: true

outputs:
  auto-update:
    description: "Whether or not to update the server"
    value: ${{ steps.check-auto-updates.outputs.auto-updates-enabled }}
  bench-path:
    description: "Path to bench"
    value: ${{ steps.get-bench-path.outputs.bench-path }}

runs:
  using: "composite"
  steps:
    - name: Configure SSH
      shell: bash
      run: |
        mkdir -p ~/.ssh/
        echo "$SSH_KEY" > ~/.ssh/${{ inputs.server_name }}.key
        chmod 600 ~/.ssh/${{ inputs.server_name }}.key
        cat >>~/.ssh/config <<END
        Host ${{ inputs.server_name }}
          HostName ${{ inputs.server_ip }}
          User $SSH_USER
          IdentityFile ~/.ssh/${{ inputs.server_name }}.key
          StrictHostKeyChecking no
        END
      env:
        SSH_USER: ${{ inputs.ssh_user }}
        SSH_KEY: ${{ inputs.ssh_key }}

    - name: Get path to bench
      id: get-bench-path
      shell: bash
      run: |
        echo "bench-path=$(
        ssh ${{ inputs.server_name }} bash <<'EOF'
        if [ "$(which bench)" ];
        then echo "$(which bench)";
        else echo "/home/ubuntu/.pyenv/shims/bench";
        fi
        EOF
        )
        " >> $GITHUB_OUTPUT

    - name: Check auto updates config
      id: check-auto-updates
      shell: bash
      run: echo "auto-updates-enabled=$(ssh ${{ inputs.server_name }} 'cd frappe-bench && echo $(${{ env.BENCH_PATH }} get-site-config auto_updates_enabled)')" >> $GITHUB_OUTPUT
      env:
        BENCH_PATH: ${{ steps.get-bench-path.outputs.bench-path }}
```

The `auto-updates-enabled` output is the final output of this action. It will be used by our main workflow to determine whether to skip the server or not.

Finally, our main workflow should now look like this:

```yaml
name: Deploy-to-Dev
run-name: Deploy to development servers by @${{ github.actor }}

on:
  push:
    branches:
      - test

env:
  APP: bizkit_core
  APP_PATH: frappe-bench/apps/bizkit_core
  V13_BRANCH: test
  REPO_URL: git@github.com:${{ github.repository }}.git
  TOKEN: ${{ secrets.GIT_TOKEN }}
  SSH_USER: ${{ secrets.EC2_USERNAME }}
  SSH_KEY: ${{ secrets.EC2_SSH_KEY }}

jobs:
  deploy:
    name: Deploy to Dev
    runs-on: ubuntu-latest

    strategy:
      fail-fast: false
      matrix:
        server_name: [FORK_DEV, GIORMI_DEV, LUXEN_DEV, NORI_DEV, TTC_DEV, RAMESH_DEV, LANCE_DEV]
    
    steps:
      - uses: actions/checkout@v2

      - name: Get composite action repo
        uses: actions/checkout@v2
        with:
          repository: BizKit-Tech/bizkit_composite_actions
          path: .github/bizkit_actions
          token: ${{ env.TOKEN }}
      
      - name: Check if server is skipped
        id: check-auto-updates
        uses: ./.github/bizkit_actions/actions/check-auto-updates
        with:
          server_name: ${{ matrix.server_name }}
          server_ip: ${{ secrets[matrix.server_name] }}
          ssh_user: ${{ env.SSH_USER }}
          ssh_key: ${{ env.SSH_KEY }}
      
      - name: Deploy to server
        if: steps.check-auto-updates.outputs.auto-update == 1
        uses: ./.github/bizkit_actions/actions/deploy-to-ec2
        with:
          app_name: ${{ env.APP }}
          app_path: ${{ env.APP_PATH }}
          branch_name: ${{ env.V13_BRANCH }}
          server_name: ${{ matrix.server_name }}
          server_ip: ${{ secrets[matrix.server_name] }}
          ssh_user: ${{ env.SSH_USER }}
          ssh_key: ${{ env.SSH_KEY }}
```

We have successfully refactored our workflow script! It is now more readable and maintainable. We can now easily add more servers to the matrix without having to duplicate each step and having to manually check if a server should be skipped or not.

## TL;DR

We used **GitHub Actions** to automate the deployment of our ERPNext code to our development servers. We refactored our workflow script by creating composite actions and using a matrix strategy. The final workflow script can be found in [bizkit_core](https://github.com/BizKit-Tech/bizkit_core/blob/test/.github/workflows/deploy-to-dev-servers.yaml), [erpnext](https://github.com/BizKit-Tech/erpnext/blob/test/.github/workflows/deploy-to-dev-servers.yaml), and [frappe](https://github.com/BizKit-Tech/frappe/blob/test/.github/workflows/deploy-to-dev-servers.yaml). The composite actions can be found in [bizkit_composite_actions](https://github.com/BizKit-Tech/bizkit_composite_actions).

If we are going to add a new server to the deployment pipeline, these are the steps that we need to follow:

1. Add the server IP address to the secrets of every repo. Use the naming convention: `[SHORT_NAME]_[DEV|PROD]` (e.g. `EPC_DEV`, `GBMI_PROD`)

2. Add the Amazon EC2 public key for GitHub Actions to the `authorized_keys` file of the server. This will be used for SSH access to the server.

3. Obtain the GitHub SSH key files (`id_rsa` and `id_rsa.pub`) added to the BizKit devs GitHub account (bizkit-engineer) and copy these to the `~/.ssh` directory of the server. This will be used for `git pull` using SSH.

    Make sure the keys are secure by running the following commands inside the directory where the keys are saved.
    
      ```
      chmod 400 id_rsa
      chmod 400 id_rsa.pub
      ``` 

    Run a test `git` command to check if the keys are working properly and to add the server to the list of known hosts. For example:
    
      ```
      git fetch git@github.com:BizKit-Tech/erpnext.git test
      ```

4. Copy the following bash scripts in the server's root directory. The contents of these scripts can be found [here](#bench-command-depending-on-file-changed).

    - bench_migrate.sh
    - bench_build.sh
    - bench_import_initial_customization.sh
    - git_pull.sh
  
5. Add the server name (as defined in step #3) to the matrix of our main workflow.

## References

**GitHub Actions Workflow Syntax:**
- [GitHub Actions Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#about-yaml-syntax-for-workflows)

**Creating Composite Actions:**
- [GitHub Docs - Creating a Composite Action](https://docs.github.com/en/actions/creating-actions/creating-a-composite-action)
- [GitHub Docs - Metadata Syntax for GitHub Actions (Outputs for Composite Actions)](https://docs.github.com/en/actions/creating-actions/metadata-syntax-for-github-actions#outputs-for-composite-actions)
- [GitHub Docs - Workflow Commands for GitHub Actions (Setting an Output Parameter)](https://docs.github.com/en/actions/using-workflows/workflow-commands-for-github-actions#setting-an-output-parameter)

**Using a Composite Action from a Private Repository:**
- [Stack Overflow - How do you use a composite action that exists in a private repository?](https://stackoverflow.com/questions/69034292/how-do-you-use-a-composite-action-that-exists-in-a-private-repository)

**Accessing Outputs from GitHub Actions Steps:**
- [Stack Overflow - How do I get the output of a specific step in GitHub Actions?](https://stackoverflow.com/questions/59191913/how-do-i-get-the-output-of-a-specific-step-in-github-actions)
- [Stack Overflow - Get GitHub Action Output from Previous Step](https://stackoverflow.com/questions/76225806/get-github-action-output-from-previous-step)

**Matrix Strategies in GitHub Actions:**
- [GitHub Docs - About Matrix Strategies](https://docs.github.com/en/actions/using-jobs/using-a-matrix-for-your-jobs#about-matrix-strategies)
- [Adam the Automator - GitHub Actions Matrix](https://adamtheautomator.com/github-actions-matrix/)

**SSH Access and Remote Commands:**
- [Stack Overflow - Why does an SSH remote command get fewer environment variables than when run manually?](https://stackoverflow.com/questions/216202/why-does-an-ssh-remote-command-get-fewer-environment-variables-then-when-run-man)
- [Super User - How to Execute Complex Command Line Over SSH](https://superuser.com/questions/1533956/how-to-execute-complex-command-line-over-ssh)
- [How-To Geek - How to Use Here Documents in Bash on Linux](https://www.howtogeek.com/719058/how-to-use-here-documents-in-bash-on-linux/)
- [Stack Overflow - SSH heredoc: bash prompt](https://stackoverflow.com/a/44979486)
- [GNU Bash Manual - Bash Conditional Expressions](https://www.gnu.org/software/bash/manual/bash.html#Bash-Conditional-Expressions)