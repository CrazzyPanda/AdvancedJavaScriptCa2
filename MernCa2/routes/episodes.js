const router = require('express').Router();
const passport = require('passport');
const settings = require('../config/passport')(passport);

let Episode = require('../models/Episode');

const getToken = (headers) => {
    if(headers && headers.autherization){
        let parted = headers.autherization.split(' ');
        if(parted.length === 2){
            return parted[1];
        }
        else{
            return null;
        }
    }
    else{
        return null;
    }
};

//Getting a list of episodes
router.route('/').get((req, res) => {
    Episode.find()
        .then(episodes => res.json(episodes))
        .catch(err => res.status(400).json('Error: ' + err)); //status 400 means bad request
});

//Finding a specific episode
router.route("/:id").get((req, res) => {
    const episodeId = req.params.id;

    Episode.findById(episodeId) //find movie id using mongoose model
        .populate('characters', 'name')
        .then(result => {
            if(!result){ //check if it exists, respond with 404
                return res.status(404).json({
                    message: "Episode not found with id " + episodeId
                });
            }
            res.json(result); //if no error, respond with episode data as json object
        })
        .catch(err => { //catches error, respond with 404 or 500
            if (err.kind === 'ObjectId') {
                return res.status(404).json({
                    message: "Episode not found with id " + episodeId
                });
            }
            return res.status(500).json({
                message: "Error retrieveing episode with id " + episodeId
            });
        });
});


//Creating new episode
router.route("/").post((req, res) => {
    const episode = req.body;

    if(!episode.name){
        return res.status(400).json({
            message: "Episode name can not be empty"
        });
    }

    const newEpisode = new Episode(episode); //creating new episode and passing in whatever is in the request body

    newEpisode.save() //it saves the episode in the database
        .then(data => {
            res.json(data); //once saved, it responds with the episode
        })
        .catch(err => res.status(400).json('Error: ' + err)); //catches any errors
});

//////////////// Creating a new episode, needs a token to see the create page /////////////////////////
// router.route("/").post(passport.authenticate('jwt', {session: false}), (req, res) => {
//     const token = getToken(req,headers);
//     const episode = req.body;
//
//     if (token){
//         if(!episode.name){
//             return res.status(400).json({
//                 message: "Episode name can not be empty"
//             });
//         }
//
//         const newEpisode = new Episode(episode);
//
//         newEpisode.save()
//             .then(data => {
//                 res.json(data);
//             })
//             .catch(err => res.status(400).json('Error: ' + err));
//     }
//     else {
//         return res.status(403).json({success: false, message: 'Unauthorised'});
//     }
// });

//Editing an episode
router.route("/:id").put((req, res) => {
    const episodeId = req.params.id;
    const newEpisode = req.body;

    Episode.findByIdAndUpdate(episodeId, newEpisode, {new: true}) //using mongoose model to find by id and update
    .then(episode => {
        if(!episode) {
            return res.status(404).json({
                message: "Episode not found with id " + episodeId
            });
        }
        res.json(episode); //respond with new episode
    })
    .catch(err => {
        if(err.kind === 'ObjectId'){ //catches errors and responds with 404 or 500
            return res.status(404).json({
                message: "Episode not found with id " + episodeId
            });
        }
        return res.status(500).json({
            message: "Error updating episode with id " + episodeId
        });
    });
});

////////////// Editing an episode, need a token to see the edit page //////////////////////
// router.route("/:id").put(passport.authenticate('jwt', {session: false}), (req, res) => {
//     const token = getToken(req,headers);
//     const episodeId = req.params.id;
//     const newEpisode = req.body;
//
//     if (token){
//         Episode.findByIdAndUpdate(episodeId, newEpisode, {new: true})
//         .then(episode => {
//             if(!episode) {
//                 return res.status(404).json({
//                     message: "Episode not found with id " + episodeId
//                 });
//             }
//             res.json(episode);
//         }).catch(err => {
//             if(err.kind === 'ObjectId'){
//                 return res.status(404).json({
//                     message: "Episode not found with id " + episodeId
//                 });
//             }
//             return res.status(500).json({
//                 message: "Error updating episode with id " + episodeId
//             });
//         });
//     }
//     else {
//         return res.status(403).json({success: false, message: 'Unauthorised'});
//     }
// });

//Deleting an episode
router.route("/:id").delete((req, res) => {
    const episodeId = req.params.id;

    Episode.findByIdAndRemove(episodeId) //find episode by id and removes
        .then(episode => {
            if(!episode){
                return res.status(404).json({
                    message:"Episode not found with id " + episodeId
                });
            }
            res.json({message: "Episode deleted successfully"});
        })
        .catch(err => {
            if(err.kind === 'ObjectId' || err.name === 'NotFound'){ //catches errors and responds with 404 or 500
                return res.status(404).json({
                    message: "Episode not found with id " + episodeId
                });
            }
            return res.status(500).send({
                message: "Could not delete episode with id " + episodeId
            });
        });
});


module.exports = router;
