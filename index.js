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
                addDep();
                break;
            case options[6]:
                updateRole();
                break;
        }
    });
}

function viewEmps() {
    connection.query("SELECT e.id, e.first_name, e.last_name, role.title, role.salary, department.name AS department, CONCAT(m.first_name, \" \", m.last_name) AS \"Manager\" FROM employee e LEFT JOIN role ON e.role_id = role.id LEFT JOIN department ON role.department_id = department.id LEFT JOIN employee m ON e.manager_id = m.id", (err, res) => {
        if (err) throw err;
        console.table(res);
        makeChoice();
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
            connection.query("SELECT e.id, e.first_name, e.last_name, role.title, role.salary, department.name AS department, CONCAT(m.first_name, \" \", m.last_name) AS \"Manager\" FROM employee e LEFT JOIN role ON e.role_id = role.id LEFT JOIN department ON role.department_id = department.id LEFT JOIN employee m ON e.manager_id = m.id WHERE department.name=?", [ans.choice], (err, res) => {
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
            connection.query("SELECT e.id, e.first_name, e.last_name, role.title, role.salary, department.name AS department, CONCAT(m.first_name, \" \", m.last_name) AS \"Manager\" FROM employee e LEFT JOIN role ON e.role_id = role.id LEFT JOIN department ON role.department_id = department.id LEFT JOIN employee m ON e.manager_id = m.id WHERE role.title=?", [ans.choice], (err, res) => {
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
        connection.query("SELECT employee.first_name, employee.last_name FROM employee", (err, res2) => {
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
                },
                {
                    type: "list",
                    message: "Who is the employee's manager?",
                    choices: [...res2.map(obj => `${obj.first_name} ${obj.last_name}`), "N/A"],
                    name: "mgr"
                }
                // Get mgr name and include that as id
            ]).then(ans => {
                connection.query("SELECT role.id FROM role WHERE role.title=?", [ans.role], (err, res) => {
                    if (err) throw err;
                    connection.query("SELECT employee.id FROM employee WHERE employee.first_name=?", [ans.mgr.substring(0,ans.mgr.indexOf(" "))], (err, res2) => {
                        if (err) throw err;
                        if (ans.mgr == "N/A") {
                            connection.query("INSERT INTO employee SET ?", {
                                first_name: ans.firstName,
                                last_name: ans.lastName,
                                role_id: res[0].id
                            }, (err, res) => {
                                if (err) throw err;
                                console.log("Employee added.");
                                makeChoice();
                            });
                        } else {
                            connection.query("INSERT INTO employee SET ?", {
                                first_name: ans.firstName,
                                last_name: ans.lastName,
                                role_id: res[0].id,
                                manager_id: res2[0].id
                            }, (err, res) => {
                                if (err) throw err;
                                console.log("Employee added.");
                                makeChoice();
                            });
                        }
                    });
                });
            });
        });
    });
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

function addDep() {
    inquirer.prompt([
        {
            message: "What is the department name?",
            name: "name"
        }
    ]).then(ans => {
        connection.query("INSERT INTO department SET ?", {
            name: ans.name,
        }, (err, res) => {
            if (err) throw err;
            console.log("Department added.");
            makeChoice();
        });
    });
}

function updateRole() {
    connection.query("SELECT employee.first_name, employee.last_name FROM employee", (err, res) => {
        if (err) throw err;
        connection.query("SELECT role.title FROM role", (err, res2) => {
            if (err) throw err;
            inquirer.prompt([
                {
                    type: "list",
                    message: "Which employee would you like to update?",
                    choices: res.map(obj => `${obj.first_name} ${obj.last_name}`),
                    name: "emp"
                },
                {
                    type: "list",
                    message: "Which role would you like them to have",
                    choices: res2.map(obj => obj.title),
                    name: "newRole"
                }
            ]).then(ans => {
                console.log(ans.emp);
                connection.query("SELECT role.id FROM role WHERE role.title=?", [ans.newRole], (err, res3) => {
                    connection.query("UPDATE employee SET ? WHERE ?", [
                        {
                            role_id: res3[0].id
                        },
                        {
                            first_name: ans.emp.substring(0, ans.emp.indexOf(" "))
                        }
                    ], (err, res) => {
                        if (err) throw err;
                        console.log("Role updated.");
                        makeChoice();
                    });
                });
            });
        });
    });

}

// Initializes the application
makeChoice();
