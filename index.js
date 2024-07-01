import express from "express";
import cors from "cors";
import fileSystem from "node:fs";

const app = express();
app.use(cors());
app.use(express.json());

//NOTE FIX THIS AND MOVE FUNCTION TO ITS OWN FILE
//Claude 3.5 changed the function to use promises!it works now!
function getNumberData() {
    return new Promise((resolve, reject) => {
        fileSystem.readFile("./data/num_train_small.csv", "utf8", (err, data) => {
            if (err) {
                console.error(err);
                reject(err);
            } else {
                resolve(data.split("\n"));
            }
        });
    });
}


app.get("/number-data", async (req, res) => {
    try {
        const numberData = await getNumberData();
        res.send({ type: "number_test",size: numberData.length, data: numberData });
    } catch (error) {
        res.status(500).send({ error: "Failed to retrieve number data" });
    }
});

app.listen(8800, () => {
    console.log("Backend Connection Established");
});