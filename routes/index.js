
/*
 * GET home page.
 */

exports.index = function(req, res){
	//file to render with title variable
  res.render('index', { title: 'WASEv1' });
};