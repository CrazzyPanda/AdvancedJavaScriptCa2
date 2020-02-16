const router = require('express').Router();
const passport = require('passport');
const settings = require('../config/passport')(passport);

let Character = require('../models/Character');

// const getToken = (headers) => {
//     if(headers && headers.autherization){
//         let parted = headers.autherization.split(' ');
//         if(parted.length === 2){
//             return parted[1];
//         }
//         else{
//             return null;
//         }
//     }
//     else{
//         return null;
//     }
// };

//Getting a list of characters
router.route('/').get((req, res) => {
    Character.find()
        .then(characters => res.json(characters))
        .catch(err => res.status(400).json('Error: ' + err)); //status 400 means bad request
});

//Finding a specific character
router.route("/:id").get((req, res) => {
    const characterId = req.params.id;

    Character.findById(characterId)
        .then(result => {
            if(!result){
                return res.status(404).json({
                    message: "Character not found with id " + characterId
                });
            }
            res.json(result);
        })
        .catch(err => {
            if (err.kind === 'ObjectId') {
                return res.status(404).json({
                    message: "Character not found with id " + characterId
                });
            }
            return res.status(500).json({
                message: "Error retrieveing character with id " + characterId
            });
        });
});

//Creating a new character
router.route("/").post((req, res) => {
    const character = req.body;

    if(!character.name){
        return res.status(400).json({
            message: "Character name can not be empty"
        });
    }

    const newCharacter = new Character(character); //creating new character and passing in whatever is in the request body

    newCharacter.save() //it saves the character in the database
        .then(data => {
            res.json(data); //once saved, it responds with this
        })
        .catch(err => res.status(400).json('Error: ' + err)); //catches any errors
});

//////////////// Creating a character, needs a token to see the create page //////////////////////////////
// router.route("/").post(passport.authenticate('jwt', {session: false}), (req, res) => {
//     const token = getToken(req,headers);
//     const character = req.body;
//
//     if (token){
//         if(!character.name){
//             return res.status(400).json({
//                 message: "Character name can not be empty"
//             });
//         }
//
//         const newCharacter = new Character(character);
//
//         newCharacter.save()
//             .then(data => {
//                 res.json(data);
//             })
//             .catch(err => res.status(400).json('Error: ' + err));
//     }
//     else {
//         return res.status(403).json({success: false, message: 'Unauthorised'});
//     }
// });

//Editing a character
router.route("/:id").put((req, res) => {
    const characterId = req.params.id;
    const newCharacter = req.body;

    Character.findByIdAndUpdate(characterId, newCharacter, {new: true})
    .then(character => {
        if(!character) {
            return res.status(404).json({
                message: "Character not found with id " + characterId
            });
        }
        res.json(character);
    })
    .catch(err => {
        if(err.kind === 'ObjectId'){
            return res.status(404).json({
                message: "Character not found with id " + characterId
            });
        }
        return res.status(500).json({
            message: "Error updating character with id " + characterId
        });
    });
});

//Deleting a character
router.route("/:id").delete((req, res) => {
    const characterId = req.params.id;

    Character.findByIdAndRemove(characterId)
        .then(character => {
            if(!character){
                return res.status(404).json({
                    message:"Character not found with id " + characterId
                });
            }
            res.json({message: "Character deleted successfully"});
        }).catch(err => {
            if(err.kind === 'ObjectId' || err.name === 'NotFound'){
                return res.status(404).json({
                    message: "Character not found with id " + characterId
                });
            }
            return res.status(500).send({
                message: "Could not delete character with id " + characterId
            });
        });
});


module.exports = router;
