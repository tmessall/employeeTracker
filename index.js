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
                viewEmpsByRole();
                break;
            case options[3]:
                addEmp();
                break;
            case options[4]:
                addRole();
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
        makeChoice();
    });
}
// Show mgr on function above and below
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
                makeChoice();
            });
        });
    });
}

function viewEmpsByRole() {
    connection.query("SELECT role.title FROM role", (err, res) => {
        if (err) throw err;
        inquirer.prompt([{
            type: "list",
            message: "What role would you like to see?",
            choices: res.map(obj => obj.title),
            name: "choice"
        }]).then(ans => {
            connection.query("SELECT employee.id, employee.first_name, employee.last_name, role.title, role.salary FROM employee LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id WHERE role.title=?", [ans.choice], (err, res) => {
                if (err) throw err;
                console.table(res);
                makeChoice();
            });
        });
    });
}

function addEmp() {
    connection.query("SELECT role.title FROM role", (err, res) => {
        if (err) throw err;
        inquirer.prompt([
            {
                message: "What is the employee's first name?",
                name: "firstName"
            },
            {
                message: "What is the employee's last name?",
                name: "lastName"
            },
            {
                type: "list",
                message: "What is the employee's role?",
                choices: res.map(obj => obj.title),
                name: "role"
            }
            // Get mgr name and include that as id
        ]).then(ans => {
            console.log(ans.role);
            connection.query("SELECT role.id FROM role WHERE role.title=?", [ans.role], (err, res) => {
                if (err) throw err;
                connection.query("INSERT INTO employee SET ?", {
                    first_name: ans.firstName,
                    last_name: ans.lastName,
                    role_id: res[0].id,
                }, (err, res) => {
                    if (err) throw err;
                    console.log("Employee added.");
                    makeChoice();
                });
            })
        })
    })
}

function addRole() {
    connection.query("SELECT department.name FROM department", (err, res) => {
        if (err) throw err;
        inquirer.prompt([
            {
                message: "What is the role's title?",
                name: "title"
            },
            {
                message: "What is the role's salary?",
                name: "sal"
            },
            {
                type: "list",
                message: "What is the role's department?",
                choices: res.map(obj => obj.name),
                name: "dep"
            }
            // Get mgr name and include that as id
        ]).then(ans => {
            connection.query("SELECT department.id FROM department WHERE department.name=?", [ans.dep], (err, res) => {
                if (err) throw err;
                connection.query("INSERT INTO role SET ?", {
                    title: ans.title,
                    salary: ans.sal,
                    department_id: res[0].id,
                }, (err, res) => {
                    if (err) throw err;
                    console.log("Role added.");
                    makeChoice();
                });
            })
        })
    })
}

makeChoice();
