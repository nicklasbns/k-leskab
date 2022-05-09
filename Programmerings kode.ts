//word data

true //true
false //false

5 > 2 //true
8 < 6 //false
14069 == 4 //false


100
75
90911901919
var a = 100;
a //100

BigInt(100); //100n
BigInt("129048319048391048910348109348")+BigInt(1); //129048319048391048910348109349n

"bogstaver"
"string" + "string" //"stringstring"
var navn = "Nicklas";
var efternavn = "Østerberg";
navn + " " + efternavn; //"Nicklas Østerberg"

`${navn} ${efternavn}` //"Nicklas Østerberg"


var person = {navn: "Nicklas", efternavn: "Østerberg", alder: 18, sej: true, sjovJoke: () => {return "What do you call a fish with no eyes? Fsh";}};

function encrypt(data) {
    const encrypted = crypto.publicEncrypt(publicKey, Buffer.from(data));
    return encrypted.toString("base64");
}


import {JsonDB as jsondb} from "node-json-db";

var database = new jsondb("database.json", true, true);

socket.on("add", async (data: string, res: (res: boolean|object) => void) => {
    if (socket.user?.loggedIn) {
        console.log(data);
        var recieved: item = JSON.parse(data);
        var item: item = {
            item: recieved.item, 
            size: recieved.size, 
            image: await getImage(recieved.item), 
            date: recieved.date, 
            id: crypto.randomUUID(), 
            uses: 0, 
            barcode: recieved.barcode || "", 
            expirationPeriod: recieved.expirationPeriod || 0
        }
        database.push("/accounts/" + socket.user.name + "/items[]", item);
        res(item);
    } else {
        res(false);
    }
});


addItem.addEventListener("click", newItem);
function newItem() {
    var name = document.getElementById("item-name");
    var size = document.getElementById("item-size");
    var list = document.getElementById("list");
    if (item.value !== "" && size.value !== "") {
        var item = {
            item: name,
            size: size
        }
        socket.emit("add", JSON.stringify({item: item.name, size: size.value, date}), (res) => {
            if (res) {
                list.insertBefore(itemElement(res), list.firstChild);
            } else {
                alert("error");
            }
            item.value = "";
            size.value = "";
        });
    }
}
