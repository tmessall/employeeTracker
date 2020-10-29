require("console.table");
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
    const options = ["View all employees", "View employees by department", "View employees by role", "Add employee", "Add role", "Add department", "Update employee role"]
    inquirer.prompt([
        {
            type: "list",
            message: "What would you like to do?",
            choices: options,
            name: "choice"
        }
    ]).then(ans => {
        console.log(ans);
        switch (ans.choice) {
            case options[0]:
                viewEmps();
                break;
            case options[1]:
                viewEmpsByDep();
                break;
            case options[2]:

                break;
            case options[3]:

                break;
            case options[4]:

                break;
            case options[5]:

                break;
            case options[6]:

                break;
        }
    });
}

function viewEmps() {
    connection.query("SELECT employee.id, employee.first_name, employee.last_name, role.title, role.salary, department.name AS department FROM employee LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id", (err, res) => {
        if (err) throw err;
        console.table(res);
    });
}

function viewEmpsByDep() {
    connection.query("SELECT department.name FROM department", (err, res) => {
        if (err) throw err;
        inquirer.prompt([{
            type: "list",
            message: "What department would you like to see?",
            choices: res,
            name: "choice"
        }]).then(ans => {
            connection.query("SELECT employee.id, employee.first_name, employee.last_name, role.title, role.salary FROM employee LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id WHERE department.name=?", [ans.choice], (err, res) => {
                if (err) throw err;
                console.table(res);
            })
        })
    })

}

makeChoice();
