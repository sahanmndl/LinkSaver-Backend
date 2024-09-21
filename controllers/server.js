export const checkServerStatus = async (req, res) => {
    try {
        return res.status(200).send("Server is up and running! 🙂")
    } catch (e) {
        return res.status(500).send("Internal server error! 🥲")
    }
}