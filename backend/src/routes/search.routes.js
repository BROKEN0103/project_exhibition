const router = require("express").Router();
const searchController = require("../controllers/search.controller");
const auth = require("../middleware/auth.middleware");

router.post("/semantic", auth, searchController.search);

module.exports = router;
