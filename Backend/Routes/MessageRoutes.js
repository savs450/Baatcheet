

const { sendMessage, allMessage } = require("../controllers/MessageController");
const { protect } = require("../middleware/authMiddleware");
const express = require('express')

const router = express.Router();
//for sending the messge
//for fetching all message in a particular chat

router.route('/').post(protect, sendMessage);
router.route('/:chatId').get(protect,allMessage);
module.exports = router;