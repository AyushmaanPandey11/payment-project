import express from "express";
import zod from "zod";

const app = express();
app.use(express.json());
const paymentBody = zod.object({
    token : zod.string(),
    userId : zod.string(),
    amount : zod.number()
});

app.post("/hdfcWebhook", (req,res) : any => {
    const body = req.body;
    const {success,data} = paymentBody.safeParse(body);
    if(!success){
        return res.status(411).json({
            message:"Invalid Input"
        })
    }
    const paymentDetail = data;


    return res.status(200).json({
        message:"Money Received successfully",
        paymentDetail
    });
});


app.listen(3000, () => {
    console.log("Bank WebHookServer running on port 3000");
});