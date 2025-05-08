const router = require("express").Router();

router.use('/user', require("../controllers/user/index"));


module.exports = router;
