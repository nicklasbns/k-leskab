import http from "http";
// import types from "./dist/types"
// const types = require("./types")
import {item, userSocket} from "./types"
import {Server} from "socket.io";
import {JsonDB as jsondb} from "node-json-db";
import {hash, pubKey} from "./functions";
import express from "express";
import {getImage} from "./googleimages";
// send everything in "public", "dist/prublic" and send "node_modules\jssha\dist\sha.js" as "sha.js"
const server = express().use(express.static("public")).use(express.static("dist/public"));
var io = new Server(http.createServer(server).listen(80));

var database = new jsondb("database.json", true, true);

//database.push("/accounts/tom[]", {item: "milk", size: "1L"});
console.log(JSON.stringify(database.getData("/accounts/tom")));

function createUser(username: string, password: string): boolean {
    // check if user exists
    try {
        database.getData("/accounts/" + username);
        console.log("tried creating " + username);
        return false;
    } catch(e) {
        database.push("/accounts/" + username, {
            name: username,
            password: password,
            isAdmin: false,
            items: []
        });
        console.log("User created: " + username);
        return true;
    }
}


io.on("connection", (socket: userSocket) => {
    console.log("a user connected");
    //console.log(pubKey());
    socket.user = {loggedIn: false};
    socket.on("disconnect", () => {
        console.log("user disconnected");
    });

    socket.on("signup", (username: string, password: string, res: (res: boolean) => void) => {
        res(createUser(username, password));
    });

    socket.on("login", (username: string, hash: string, res: (res: string|boolean) => void) => {
        try {
            database.getData("/accounts/" + username);
            if (database.getData("/accounts/" + username).password === hash) {
                socket.user = {
                    loggedIn: true,
                    id: "not yet implemented",
                    name: username,
                    isAdmin: database.getData("/accounts/" + username).isAdmin
                };
                res(username);
            } else {
                res(false);
            }
        } catch(e) {
            res(false);
        }
    });

    socket.on("logout", () => {
        socket.user = {loggedIn: false};
    });

    socket.on("add", async (data: string, res: (res: boolean) => void) => {
        if (socket.user?.loggedIn) {
            console.log(data);
            var item: item = JSON.parse(data);
            database.push("/accounts/" + socket.user.name + "/items[]", {item: item.item, size: item.size, image: await getImage(item.item)});
            res(true);
        } else {
            res(false);
        }
    });

    socket.on("getItems", (res: (res: string) => void) => {
        if (socket.user?.loggedIn) {
            res(JSON.stringify(database.getData("/accounts/"+socket.user.name).items)); //TODO: this is unsafe
        } else {
            res("");
        }
    });

});

