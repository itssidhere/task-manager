const express = require('express')
const User = require('../models/user');
const auth = require('../middleware/auth');
const router = new express.Router()


router.post('/users', async (req, res) => {
    const user = new User(req.body)
    try {

        await user.save()
        const token = await user.generateAuthToken();
        res.status(201).send({ user, token })
    } catch (e) {
        res.status(400).send(e);
    }
});

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch (e) {
        res.status(400).send(e)
    }
});

router.get('/users/me', auth, (req, res) => {
    res.send(req.user)
});

router.get('/users/:id', auth, (req, res) => {
    const _id = req.params.id

    User.findById(_id).then((user) => {
        if (!user) {
            return res.status(404).send()
        }

        res.send(user)
    }).catch((error) => {
        res.status(500).send()
    })
});

router.delete('/users/:id', auth, (req, res) => {
    const _id = req.params.id

    User.findByIdAndDelete(_id).then((user) => {
        if (!user) {
            return res.status(404).send()
        }

        res.send(user)
    }).catch((error) => {
        res.status(500).send()
    })
});

router.patch('/users/:id', async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        const user = await User.findById(req.params.id)
        //const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

        updates.forEach((update) => user[update] = req.body[update])
        await user.save();
        if (!user) {
            return res.status(404).send()
        }

        res.send(user)
    } catch (e) {
        res.status(400).send(e)
    }
});


module.exports = router