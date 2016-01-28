var express = require('express');
var $ = require('jquery');
var router = express.Router();

/*
 * GET userlist.
 */
router.get('/aereoporti', function(req, res) {
	var url = 'http://www501test.regione.toscana.it/SIM/oggetto/cerca?latMin=40.767205&lonMin=9.259474&latMax=44.787532&lonMax=13.307882&tipoOggetto=AEROPORTO';
    
    $.getJSON( url, function( data ) {
       res.json(data);
    });
});


module.exports = router;