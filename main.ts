import http from "http";
// import types from "./dist/types"
// const types = require("./types")
import {item, userSocket} from "./types"
import {Server} from "socket.io";
import {JsonDB as jsondb} from "node-json-db";
import {createSession, hash, pubKey} from "./functions";
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
            items: [],
            sessions: []
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
        username = username.replace(/[^a-zA-Z0-9]/g, "");
        res(createUser(username, password));
    });

    socket.on("login", (username: string, hash: string, res: (res: string|boolean) => void) => {
        try {
            username = username.replace(/[^a-zA-Z0-9]/g, "");
            database.getData("/accounts/" + username);
            if (database.getData("/accounts/" + username).password === hash) {
                var session = createSession();
                socket.user = {
                    loggedIn: true,
                    id: "not yet implemented",
                    name: username,
                    isAdmin: database.getData("/accounts/" + username).isAdmin,
                    session: session
                };
                database.push("/sessions[]", {
                    user: username,
                    session: session,
                    date: Date.now()
                });
                res(username + ":" + session);
            } else {
                res(false);
            }
        } catch(e) {
            res(false);
        }
    });

    socket.on("session", (session: string, res: (res: string|boolean) => void) => {
        var sessions = database.getData("/sessions");
        sessions.forEach((s: {user: string, session: string, date: number}, i: number) => {
            if (s.date + 1000*60*35 < Date.now()) {
                database.delete("/sessions/[" + i + "]");
            }
        });
        var sessionObject = sessions.find((e: any) => e.session == session);
        if (sessionObject) {
            socket.user = {
                loggedIn: true,
                id: "not yet implemented",
                name: sessionObject.user,
                isAdmin: database.getData("/accounts/" + sessionObject.user).isAdmin,
                session: sessionObject.session
            };
            res(sessionObject.user);
        } else {
            res(false);
        }
    });


    socket.on("logout", () => {
        var sessions = database.getData("/sessions");
        sessions.forEach((e: {user: string, session: string, date: number}, i: number) => {
            if (e.session == socket.user?.session) {
                database.delete("/sessions/[" + i + "]");
            }
        });
        socket.user = {loggedIn: false};
    });

    socket.on("add", async (data: string, res: (res: boolean|object) => void) => {
        if (socket.user?.loggedIn) {
            console.log(data);
            var item: item = JSON.parse(data);
            database.push("/accounts/" + socket.user.name + "/items[]", {item: item.item, size: item.size, image: await getImage(item.item), date: item.date});
            res({item: item.item, size: item.size, image: await getImage(item.item), date: item.date});
        } else {
            res(false);
        }
    });

    socket.on("getItems", (res: (res: string) => void) => {
        if (socket.user?.loggedIn) {
            res(JSON.stringify(database.getData("/accounts/"+socket.user.name).items)); //TODO: this is unsafe
        } else {
            res('[{"item": "item Name", "size": "", "image": "", "date": ""}]');
        }
    });

});

