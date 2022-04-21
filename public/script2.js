try {
    var io = require("socket.io-client");
} catch (e) {}

var socket = io();


window.onload = async () => {
    var password = document.getElementById("password");
    var username = document.getElementById("username");
    var loginButton = document.getElementById("login");
    var createAccount = document.getElementById("createAccount");
    loginButton.addEventListener("click", login);
    createAccount.addEventListener("click", signup);
    //when i click enter on password
    password.addEventListener("keyup", async (event) => {
        //if enter key is pressed
        if (event.key == "ENTER" && password.value !== "" && username.value !== "") {
            //send password to server
            socket.emit("login", username.value, hash(password.value), (res) => {
                if (res) {
                    //if password is correct
                    //send username to server
                    socket.emit("getItems", (res) => {
                        //if username is correct
                        //send items to client
                        var items = JSON.parse(res);
                        var list = document.getElementById("list");
                        items.forEach((e) => {
                            var li = document.createElement("li");
                            li.innerHTML = e.item + " " + e.size;
                            list.appendChild(li);
                        });
                    });
                }
            });
            //clear password
            password.value = "";
            username.value = "";
        }
    });

};


socket.on("connect", () => {
    console.log("connected");
});

socket.on("update", (data) => {
    console.log(JSON.stringify(data));
});

function update(username) {
    socket.emit("getItems", (res) => {
        var items = JSON.parse(res);
        var list = document.getElementById("list");
        items.forEach((e) => {
            var li = document.createElement("li");
            li.innerHTML = e.item + " " + e.size;
            list.appendChild(li);
        });
    });
}

function login() {
    var password = document.getElementById("password");
    var username = document.getElementById("username");
    var header = document.getElementById("header");
    if (password.value !== "" && username.value !== "") {
        socket.emit("login", username.value, hash(password.value), (res) => {
            if (res) {
                update(username.value);
                header.innerText = "Welcome " + username.value;
                username.value = "";
            } else {
                header.innerText = "Incorrect username or password";
            }
        });
        password.value = "";
    }
}

function signup() {
    var password = document.getElementById("password");
    var username = document.getElementById("username");
    var header = document.getElementById("header");
    if (password.value !== "" && username.value !== "") {
        socket.emit("signup", username.value, hash(password.value), (res) => {
            if (res) {
                update(username.value);
                header.innerText = "Welcome " + username.value;
                username.value = "";
            } else {
                header.innerText = "Username already exists";
            }
        });
        password.value = "";
    }
}


//make a hash from password using jssha512
function hash(password) {
    var shaObj = new jsSHA("SHA-512", "TEXT");
    shaObj.update(password);
    return shaObj.getHash("HEX");
}
