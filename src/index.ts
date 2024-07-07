import express from "express";
import cors from "cors";
import fileSystem from "node:fs";
import { getNumberData } from "./scripts/DataFunctions";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/number-data", async (req, res) => {
    try {
        const numberData = await getNumberData();
        res.send({ type: "number_test",size: [numberData.x.length, numberData.y.length], data: numberData });
    } catch (error) {
        res.status(500).send({ error: "Failed to retrieve number data" });
    }
});

app.listen(8800, () => {
    console.log("Backend Connection Established");
});