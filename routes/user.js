var express = require('express'),
	router = express.Router(),
	mongoose = require('mongoose'), // mongoose connection
	bodyParser = require('body-parser'), // parses info from POST
	methodOverride = require('method-override'); // used to manipulate POST

router.use(bodyParser.urlencoded({extended: true}));
router.use(methodOverride(function(req, res){
	if (req.body && typeof req.body === 'object' && '_method' in req.body){
		// look in urlencoded POST bodies and delete it
		var method = req.body._method;
		delete req.body._method;
		return method;
	};
}));

// build the rest operations at the base for users
// this will be accessibl from localhost:3000/users if default for '/'
// is not changed

router.route('/') // get all users
	.get(function(req, res, next){
		mongoose.model('User').find({} function (err, users){
			if (err) {
				return console.log(err);
			} else {
				res.format({
					html: function(){
						res.render('users/index', {
							title: 'All Users',
							"users": users
						});
					},
					json: function(){
						res.json(infophotos);
					}
				});
			};
		});
	});
	.post(function(req, res){
		var name = req.body.name;
		var email = req.body.email;
		var isAdmin = req.body.isAdmin;
		mongoose.model('User').create({
			name: name,
			email: email,
			isAdmin: isAdmin
		}, function (err, user){
			if (err){
				res.send("There was a problem adding record to the database.");
			} else {
				console.log("POST creating new user: " + user);
				res.format({
					html: function(){
						res.location("users");
						res.redirect("/users");
					},
					json: function(){
						res.json(user);
					}
				});
			};
		});
	});

router.get('/new', function(req, res){
	res.render('users/new', { title: 'Add new user'});
});

// route middleware to validate :id
router.param('id', function(req, res, next, id) {
    //console.log('validating ' + id + ' exists');
    //find the ID in the Database
    mongoose.model('User').findById(id, function (err, user) {
        //if it isn't found, we are going to repond with 404
        if (err) {
            console.log(id + ' was not found');
            res.status(404)
            var err = new Error('Not Found');
            err.status = 404;
            res.format({
                html: function(){
                    next(err);
                 },
                json: function(){
                       res.json({message : err.status  + ' ' + err});
                 }
            });
        //if it is found we continue on
        } else {
            //uncomment this next line if you want to see every JSON document response for every GET/PUT/DELETE call
            //console.log(user);
            // once validation is done save the new item in the req
            req.id = id;
            // go to the next thing
            next(); 
        } 
    });
});

router.route('/:id/edit')
	//GET the individual user by Mongo ID
	.get(function(req, res) {
	    //search for the user within Mongo
	    mongoose.model('User').findById(req.id, function (err, user) {
	        if (err) {
	            console.log('GET Error: There was a problem retrieving: ' + err);
	        } else {
	            //Return the user
	            console.log('GET Retrieving ID: ' + user._id);
	            res.format({
	                //HTML response will render the 'edit.jade' template
	                html: function(){
	                       res.render('users/edit', {
	                          title: 'User' + user._id,
	                          "user" : user
	                      });
	                 },
	                 //JSON response will return the JSON output
	                json: function(){
	                       res.json(user);
	                 }
	            });
	        }
	    });
	})
	//PUT to update a user by ID
	.put(function(req, res) {
	    // Get our REST or form values. These rely on the "name" attributes
	    var name = req.body.name;
	    var email = req.body.email;
	    var isAdmin = req.body.isAdmin;

	    //find the document by ID
	    mongoose.model('user').findById(req.id, function (err, user) {
	        //update it
	        user.update({
	            name : name,
	            email : email,
	            isAdmin : isAdmin
	        }, function (err, userID) {
	          if (err) {
	              res.send("There was a problem updating the information to the database: " + err);
	          } 
	          else {
	                  //HTML responds by going back to the page or you can be fancy and create a new view that shows a success page.
	                  res.format({
	                      html: function(){
	                           res.redirect("/users/" + user._id);
	                     },
	                     //JSON responds showing the updated values
	                    json: function(){
	                           res.json(user);
	                     }
	                  });
	           }
	        })
	    });
	})

	//DELETE a User by ID
	.delete(function (req, res){
	    //find blob by ID
	    mongoose.model('User').findById(req.id, function (err, blob) {
	        if (err) {
	            return console.error(err);
	        } else {
	            //remove it from Mongo
	            user.remove(function (err, user) {
	                if (err) {
	                    return console.error(err);
	                } else {
	                    //Returning success messages saying it was deleted
	                    console.log('DELETE removing ID: ' + user._id);
	                    res.format({
	                        //HTML returns us back to the main page, or you can create a success page
	                          html: function(){
	                               res.redirect("/users");
	                         },
	                         //JSON returns the item with the message that is has been deleted
	                        json: function(){
	                               res.json({message : 'deleted',
	                                   item : user
	                               });
	                         }
	                      });
	                }
	            });
	        }
	    });
	});

module.exports = router;





