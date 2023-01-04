const { Router } = require("express");
const router = Router();
const fs = require("fs/promises");
const path = require("path");
const { randomUUID } = require("crypto");

const usersGetList = async () => {
  return JSON.parse(await fs.readFile(usersPath));
};

const writeUsers = async (users) => {
  return await fs.writeFile(usersPath, JSON.stringify(users));
};

const usersPath = path.join(__dirname, "../db/users.json");

router.get("/users", async (req, res) => {
  try {
    const users = await usersGetList();
    res.status(200).json(users);
  } catch (error) {}
});

router.get("/users/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const users = await usersGetList();
    const user = users.find((user) => String(user.id) === id);

    if (!user) {
      return res.status(404).json({ message: "User wasn`t found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/users", async (req, res) => {
  try {
    const { body } = req;
    const users = await usersGetList();
    const user = { id: randomUUID(), ...body };
    users.push(user);
    await writeUsers(users);
    res.status(201).json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/users/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { body } = req;

    const users = await usersGetList();

    const index = users.findIndex((user) => String(user.id) === id);
    if (index === -1) {
      return res.status(404).json({ message: "User wasn`t found" });
    }
    const user = { id, ...body };
    users[index] = user;
    await writeUsers(users);
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/users/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const users = await usersGetList();

    const filteredUsers = users.filter((user) => String(user.id) !== id);

    if (filteredUsers.length === users.length) {
      return res.status(404).json({ message: "User wasn`t found" });
    }
    await writeUsers(filteredUsers);
    res.status(200).json({ message: "User was delete" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
