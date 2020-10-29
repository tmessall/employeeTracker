var inquirer = require("inquirer");
var mysql = require("mysql");
var connection = mysql.createConnection({
    host: "localhost",

    PORT: 3306,

    user: "root",
    password: "password",
    database: "emptrack_db"
});

function makeChoice() {
    connection.query("SELECT * FROM employee", function (err, res) {
        if (err) throw err;
        inquirer.prompt([
            {
                type: "list",
                message: "What would you like to do?",
                choices: ["View all employees", "View employees by department", "View employees by role", "Add employee", "Add role", "Add department", "Update employee role"],
                name: "choice"
            }
        ]).then(ans => {
            console.log(ans);
        })
    });
}

makeChoice();
