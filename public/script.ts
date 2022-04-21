try {
    var io = require("socket.io-client");
} catch (e) {}
try {
    var jsSHA = require("jssha");
} catch (e) {}
import { item } from "./../types.d";

var socket = io();


window.onload = async () => {
    var password = document.getElementById("password") as HTMLInputElement;
    var username = document.getElementById("username") as HTMLInputElement;
    //when i click enter on password
    password.addEventListener("keyup", async (event) => {
        //if enter key is pressed
        if (event.key == "ENTER" && password.value !== "" && username.value !== "") {
            //send password to server
            socket.emit("login", await hash(password.value), username.value, (res: boolean) => {
                if (res) {
                    //if password is correct
                    //send username to server
                    socket.emit("getItems", (res: string) => {
                        //if username is correct
                        //send items to client
                        var items = JSON.parse(res);
                        var list = document.getElementById("list") as HTMLUListElement;
                        items.forEach((e: item) => {
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

socket.on("update", (data: String) => {
    console.log(JSON.stringify(data));
});


//make a hash from password using jssha512
function hash(password: string): Promise<string> {
    var shaObj = new jsSHA("SHA-512", "TEXT");
    shaObj.update(password);
    return shaObj.getHash("HEX");
}
