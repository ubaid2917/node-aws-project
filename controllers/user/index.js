const router = require("express").Router();
const userService = require("../../services/user/index"); 
const { upload } = require("../../utils/multer");    


// ======================= user  =======================

router.post('/register',  upload.single("profile"),  userService.register); 
 
router.get('/getUsers', userService.getMany);
     
module.exports = router;