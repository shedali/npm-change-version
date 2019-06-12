#!/usr/bin/env node
const npm = require("npm");
const inquirer = require("inquirer");
const path = require("path");
const deplist = require("dependency-lister");

const pkg = require("fs").readFileSync(
  path.join(process.cwd(), "package.json"),
  "utf8"
);

let list;
(async () =>
  npm.load(function() {
    deplist(JSON.parse(pkg), {
      dependencies: true,
      devDependencies: true
    }).then(function(result) {
      inquirer
        .prompt([
          {
            type: "list",
            name: "name",
            message: "Select package",
            choices: result.devDependencies.map(d => d.name)
          }
        ])

        .then(package => {
          npm.commands.view([package.name, "versions"], function(er, data) {
            list = data[Object.keys(data)[0]].versions;
            inquirer
              .prompt([
                {
                  type: "list",
                  name: "version",
                  message: "Select version",
                  choices: list
                }
              ])
              .then(answers => {
                // eslint-disable-next-line no-console
                console.log(
                  "installing version",
                  answers.version,
                  `${package.name}@${answers.version}`
                );
                npm.commands.install([
                  `${package.name}@${answers.version.toString()}`
                ]);
              });
          });
        });
    });
  }))();
