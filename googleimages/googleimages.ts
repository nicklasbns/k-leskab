import https from 'https';
import { JsonDB as jsondb } from "node-json-db";
import { key } from './key';


var database = new jsondb("./googleimages/images.json", true, true);

export async function getImage(image: string): Promise<string> {
    image = image.replace(/[^\w ]/g, "");
    if (image.length < 1) return getImage("no image");
    try {
        return database.getData("/images/" + image)
    } catch(e) {
        const url = await newImage(image);
        database.push("/images/" + image, url);
        return url
    }
}

//get first image from google
//https://customsearch.googleapis.com/customsearch/v1?gl=dk&q=cat&searchType=image&cx=b8750a38f7af1cfaa&key=key
async function newImage(image: string): Promise<string> {
    const url = "https://customsearch.googleapis.com/customsearch/v1?q=" + image + "&searchType=image&cx=b8750a38f7af1cfaa&key=" + key;
    return new Promise((resolve) => {
        https.get(url, (res) => {
            let data = "";
            res.on("data", (chunk) => {
                data += chunk;
            });
            res.on("end", () => {
                resolve(JSON.parse(data)?.items[0].link);
            });
        });
    });
}