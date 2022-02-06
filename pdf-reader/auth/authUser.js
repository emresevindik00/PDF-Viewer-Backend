
function authUser(req, res, next) {
    if(req.body.kullanici_ad == null){
        res.status(403);
        return res.send("You need to sign in");
    }
    next();
}

function authRole(role) {
    return (req, res, next) => {
        const userRole = req.body.kullanici_ad;
        if(role.includes(userRole)){
            next();
        }
        else {
            res.send("Not allowed");
        }
    }
}


function authPost() {
    return (req, res, next) => {
        
        if(req.params.id == req.body.kullanici_id){
            next();
        }
        else {
            res.send("Not allowed");
        }
    }
}


module.exports = {authUser, authRole, authPost, authAdmin}