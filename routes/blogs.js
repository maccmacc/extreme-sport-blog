const express = require('express');
const router = express.Router();
const User=require('../models/user');
const Blog=require('../models/blog');
const jwt=require('jsonwebtoken');


const config = require('../config/database');

router.post('/newBlog', (req, res) => {
    if (!req.body.title) {
        res.json({ success: false, message: 'Blog title is required.' });
    } else {
        if (!req.body.body) {
            res.json({ success: false, message: 'Blog body is required.' });
        } else if (!req.body.createdBy) {
            res.json({success: false, message: 'Blog creator is required.'});
        } else {


            const blog = new Blog({
                title: req.body.title,
                body: req.body.body,
                createdBy: req.body.createdBy,
                createdAt: req.body.createdAt,
                likes: req.body.likes,
                likedBy: req.body.likedBy,
                dislikes: req.body.dislikes
            });

            blog.save((err) => {
                if (err) {
                    if (err.errors) {
                        if (err.errors.title) {
                            res.json({success: false, message: err.errors.title.message});
                        } else {
                            if (err.errors.body) {
                                res.json({success: false, message: err.errors.body.message});
                            } else {
                                res.json({success: false, message: err});
                            }
                        }
                    } else {
                        res.json({success: false, message: err});
                    }
                } else {
                    res.json({success: true, message: 'Blog saved!'});
                }
            });
        }
    }
});

router.get('/allBlogs', (req, res) => {
    Blog.find({}, (err, blogs) => {
        if (err) {
            res.json({ success: false, message: err });
        } else {
            if (!blogs) {
                res.json({ success: false, message: 'No blogs found.' });
            } else {
                res.json({ success: true, blogs: blogs });
            }
        }
    }).sort({ '_id': -1 });
});

router.get('/singleBlog/:id', (req, res) => {
    if (!req.params.id) {
        res.json({ success: false, message: 'No blog ID was provided.' });
    } else {
        Blog.findOne({ _id: req.params.id }, (err, blog) => {
            if (err) {
                res.json({ success: false, message: 'Not a valid blog id' });
            } else {
                if (!blog) {
                    res.json({ success: false, message: 'Blog not found.' });
                } else {
                    res.json({ success: true, blog: blog});
                

                       User.findOne({ _id: req.body._id }, (err, user) => {
                        if (err) {
                            res.json({ success: false, message: err });
                        } else {
                            if (!user) {
                                res.json({ success: false, message: 'Unable to authenticate user' });
                            } else {
                                if (user.username !== blog.createdBy) {
                                    res.json({ success: false, message: 'You are not authorized to eidt this blog.' });
                                } else {
                                    res.json({ success: true, blog: blog });
                                }
                            }
                        }
                    });
                }
            }
        });
    }
});

router.put('/updateBlog', (req, res) => {
    if (!req.body._id) {
        res.json({ success: false, message: 'No blog id provided' });
    } else {
        Blog.findOne({ _id: req.body._id }, (err, blog) => {
            if (err) {
                res.json({ success: false, message: 'Not a valid blog id' });
            } else {
                if (!blog) {
                    res.json({ success: false, message: 'Blog id was not found.' });
                } else {
                    // Check who user is that is requesting blog update
                    User.findOne({ _id: req.body.user._Id }, (err, user) => {
                        if (err) {
                            res.json({ success: false, message: err });
                        } else {
                            if (!user) {
                                res.json({ success: false, message: 'Unable to authenticate user.' });
                            } else{
                                if (user.username !== blog.createdBy) {
                                    res.json({ success: false, message: 'You are not authorized to edit this blog post.' });
                                } else {
                                    blog.title = req.body.title; // save latest blog title
                                    blog.body = req.body.body; // save latest body
                                    blog.save((err) => {
                                        if (err) {
                                            if (err.errors) {
                                                res.json({ success: false, message: 'Check is it filled out properly' });
                                            } else {
                                                res.json({ success: false, message: err });
                                            }
                                        } else {
                                            res.json({ success: true, message: 'Blog Updated!' });
                                        }
                                    });
                                }
                            }
                        }
                    });
                }
            }
        });
    }
});

router.delete('/deleteBlog/:id', (req, res) => {
    if (!req.params.id) {
        res.json({ success: false, message: 'No id provided' });
    } else {
        Blog.findOne({ _id: req.params.id }, (err, blog) => {
            if (err) {
                res.json({ success: false, message: 'Invalid id' });
            } else {
                if (!blog) {
                    res.json({ success: false, messasge: 'Blog was not found' });
                } else {
                    //  user who want to delete post
                    User.findOne({ _id: req.body.user_id }, (err, user) => {
                        if (err) {
                            res.json({ success: false, message: err });
                        } else {
                            if (!user) {
                                res.json({ success: false, message: 'Unable to authenticate user.' });
                            } else {
                                if (user.username !== blog.createdBy) {
                                    res.json({ success: false, message: 'You are not authorized to delete this blog post' });
                                } else {
                                    blog.remove((err) => {
                                        if (err) {
                                            res.json({ success: false, message: err });
                                        } else {
                                            res.json({ success: true, message: 'Blog deleted!' });
                                        }
                                    });
                                }
                            }
                        }
                    });
                }
            }
        });
    }
});

router.post('/random', (req,res) => {
    if(!req.body.name) {
        res.json({success:false, message: 'Nema tela forme'});
    } else {
        res.json({success:true, message: "Ima body" + req.body.name});
    }
});

router.post('/comment', (req, res) => {
    if (!req.body.comment) {
        res.json({ success: false, message: 'No comment provided' });
    } else {
        if (!req.body.id) {
            res.json({ success: false, message: 'No id was provided' });
        } else {
            Blog.findOne({ _id: req.body.id }, (err, blog) => {
                if (err) {
                    res.json({ success: false, message: 'Invalid blog id' });
                } else {
                    if (!blog) {
                        res.json({ success: false, message: 'Blog not found.' });
                    } else {
                        //  user that is logged in????????????????????????/
                        User.findOne({ _id: req.body.user_id }, (err, user) => {
                            if (err) {
                                res.json({ success: false, message: 'Something went wrong' });
                            } else {
                                if (!user) {
                                    res.json({ success: false, message: 'User not found.' });
                                } else {
                                    // Add new comment to the blog array
                                    blog.comments.push({
                                        comment: req.body.comment, // Comment field
                                        commentator: user.username // Person who commented
                                    });
                                    blog.save((err) => {
                                        if (err) {
                                            res.json({ success: false, message: 'Something went wrong.' });
                                        } else {
                                            res.json({ success: true, message: 'Comment saved' });
                                        }
                                    });
                                }
                            }
                        });
                    }
                }
            });
        }
    }
});

module.exports=router;
