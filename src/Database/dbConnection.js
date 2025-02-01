import mongoose from "mongoose";

export const DBConnection = async() => {
  return await mongoose
    .connect(process.env.DB_URI)
    .then(() => {
      console.log("Database Connected Successfully!!!");
    })
    .catch((error) => {
      console.log("Fail to connect on DB");
    });
};
