This file is written in markdown.

# Overview

A simple website built using TypeScript (which transpiles to JavaScript), Sass (which transpiles to CSS), HTML using webpack. Webpack might be overkill at this point, but will be useful for a later step.

This is a step by step guide to how to create a working repository that follows some best practices:
* Platform agnostic (i.e. will work on Linux, Windows, Mac).
* Commits all changes to source control (git in this case to work with GitHub).
* All configuration files are committed to the source code repository.
* Access keys are not committed to the source code repository.
* External libraries are not committed to the source code repository.
* Source code can be linted to enforce consistency.

It doesn't go overboard by adding:
* Unit Tests.
* Integration Tests.

# How to run on your machine

## Machine setup

In no particular order:

* Get [node.js](https://nodejs.org) for the development environment. At this point this project has no particular version dependency so take a LTS (long term support) version.
* Get [git ](https://git-scm.com/) for source code management. You can get improved GUI clients such as [TortoiseGit for Windows](https://tortoisegit.org/) but they're not required.
* A code editor. There are lots out there. It doesn't need to be fancy or cost money, but it helps if the editor designed for code so that you get syntax highlighting etc.


## To build the website

The following steps assume a command line with bash-like characteristics but it is possible to do this through code editors.


### The first time
#### NPM
We need to setup the repository with the packages for building and the libraries for running. These packages and libraries are all specified in the package.json file.

npm is the package manager for the javascript environment. The npm install command will download all the packages that are required for building the website.

```
cd <directory containing this repository>
npm install
```

#### git

This is a very brief overview. For more detail see [something like this](https://git-scm.com/book/eo/v1/Ekkomenci-First-Time-Git-Setup).

In order to commit code, you will have to setup your identity. You can do it with the following 2 commands:

```
git config --global user.email "you@example.com"
git config --global user.name "Your Name"
```

If you would prefer to have a user configuration unique to this repository, then you can omit the --global flag:
```
git config user.email "you@example.com"
git config user.name "Your Name"
```

##### git commit hooks

To make sure we keep the code neat, we will setup a commit hook for git. This will run the equivalent of the `npm run lint` command automatically when you try to commit code. If the lint fails the the commit will be aborted.

To setup this functionality create the `.git/hooks/pre-commit` file with the following content:
```
#!/bin/bash

STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep ".tsx\{0,1\}$")

if [[ "$STAGED_FILES" = "" ]]; then
  exit 0
fi

PASS=true

printf "\nValidating TypeScript:\n"

for FILE in $STAGED_FILES
do
  npx tslint -p tsconfig.json "$FILE"

  if [[ "$?" == 0 ]]; then
    printf "\t\033[32mTSLint Passed: $FILE\033[0m"
  else
    printf "\t\033[41mTSLint Failed: $FILE\033[0m"
    PASS=false
  fi
done

printf "\nTypeScript validation completed!\n"

if ! $PASS; then
  printf "\033[41mCOMMIT FAILED:\033[0m Your commit contains files that should pass TSLint but do not. Please fix the TSLint errors and try again.\n"
  exit 1
else
  printf "\033[42mCOMMIT SUCCEEDED\033[0m\n"
fi

exit $?
```


### Development

#### To run a development server that will display the website at http://localhost:8080/.


```
# This will start a local development server and open a web page pointing to the website.
# The website should update automatically whenever you change a file.
npm run start
```

This command will watch the directories and files for changes and automatically update the website. Your browser should refresh automatically to reflect the changes as well. NOTE: The command can be confused by deleting and adding new files. If this happens, just terminate (^C or the like), and run `npm run start` again.

### package.json

This is the configuration file for npm. It a javascript object (JSON) that contains 2 important sections/properties:
* The libraries that are used for the website (dependencies) and the packages used in the "building" of the website (devDependencies).
* The scripts are a nice place to put the commands that `npm run` can accept. In fact you'll find the `start` commmand in there.