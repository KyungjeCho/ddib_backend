module.exports = {
    isOwner: function(req, res){
        if (req.session.is_logined) {
            return true;
        }
        else {
            return false;
        }
    }
}