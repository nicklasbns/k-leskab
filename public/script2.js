try {
    var io = require("socket.io-client");
} catch (e) {}

var socket = io();


window.onload = async () => {
    var password = document.getElementById("password");
    var username = document.getElementById("username");
    var loginButton = document.getElementById("login");
    var createAccount = document.getElementById("createAccount");
    var itemSize = document.getElementById("item-size");
    var addItem = document.getElementById("add-item");
    var refresh = document.getElementById("refresh-button");
    loginButton.addEventListener("click", login);
    createAccount.addEventListener("click", signup);
    addItem.addEventListener("click", newItem);
    refresh.addEventListener("click", update);
    //when i click enter on password
    password.addEventListener("keyup", (event) => (event.key == "Enter") && login());
    itemSize.addEventListener("keyup", (event) => (event.key == "Enter") && newItem());

};


socket.on("connect", () => {
    console.log("connected");
});

socket.on("update", (data) => {
    console.log(JSON.stringify(data));
});

function update() {
    socket.emit("getItems", (res) => {
        var items = JSON.parse(res);//this is {item: item, size: size, image: image}
        var list = document.getElementById("list");
        list.innerHTML = "";
        items.forEach((e) => {
            var li = document.createElement("div");
            li.className = "item";
            li.innerHTML = 
`<img src="${e.image}" alt="${e.item}" class="small-image">
<div class="item-name">${e.item}</div>
<div class="item-size">${e.size}</div>`;
            list.appendChild(li);
        });
    });
}


/* this is the code that recieves the data from the client:
    socket.on("add", (data: string) => {
        if (socket.user?.loggedIn) {
            console.log(data);
            var item: item = JSON.parse(data);
            database.push("/accounts/" + socket.user.name + "[]", {item: item.item, size: item.size});
            socket.emit("update", JSON.stringify(database.getData("/accounts/" + socket.user.name)));
        }
    });
this fucntion sends data to the server: */
function newItem() {
    var item = document.getElementById("item-name");
    var size = document.getElementById("item-size");
    var list = document.getElementById("list");
    if (item.value !== "" && size.value !== "") {
        socket.emit("add", JSON.stringify({item: item.value, size: size.value}), (res) => {
            if (res) {
                var li = document.createElement("div");
                li.className = "item";
                li.innerHTML = 
`<div class="item-name">${item.value}</div>
<div class="item-size">${size.value}</div>`;
                list.appendChild(li);
                alert("Item added");
            } else {
                alert("error");
            }
            item.value = "";
            size.value = "";
        });
    }
}

function login() {
    var password = document.getElementById("password");
    var username = document.getElementById("username");
    var header = document.getElementById("header");
    if (password.value !== "" && username.value !== "") {
        socket.emit("login", username.value, hash(password.value), (res) => {
            if (res) {
                update();
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
                update();
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
