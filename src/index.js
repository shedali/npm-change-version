const npm = require("npm");
var inquirer = require("inquirer");

// eslint-disable-next-line no-undef
var pkg = require("fs").readFileSync(__dirname + "/package.json", "utf8");
const deplist = require("dependency-lister");
let list;
(async () =>
  npm.load(function() {
    deplist(JSON.parse(pkg), {
      dependencies: false,
      devDependencies: true
    }).then(function(result) {
      inquirer
        .prompt([
          {
            type: "list",
            name: "name",
            message: "What package do you need?",
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
                  message: "What size do you need?",
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
