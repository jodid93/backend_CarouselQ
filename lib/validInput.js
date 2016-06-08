'use strict';

var validInput = {
	
	//athugar hvort gildi sé netfang 
	//eða ekki, nóg er að athuga hvort
	//@merki og punktur séu til staðar
	isEmail: function(email){
		return (/.*@.*\.[a-z]*$/g).test( email );
	},

	//s er krafist, athugar hvort
	//s sé ekki tómi strengurinn 
	//og innihaldi eitthvað gildi
	required: function(s){
		var res1 = (typeof s === "string") ? true : false;
		var res2 = (s.length > 0) ? true : false;
		return Boolean((res1+res2) === 2);
	},

	//athugar hvort s sé a.m.k. n stafir
	length: function(s, n){
		return ( s.toString().length >= Number(n) ) ? true : false;
	},

	//athugar hvort s líti út einsog 
	//heimilisfang, sé á <strengur> <tala>
	address: function(s){
		return (/[a-z]+\s*[0-9]+$/ig).test(s);
	},

	//athugar hvort s sé gildi í array
	oneOf: function(s, array){
		var res = false;
		for( var index in array ){
			res += (array[index] === s) ? true : false;
		}
		return (res>0);
	},

	//athugar hvort s sé íslenskt símanúmer
	// - Byrjar á 4, 5, 6, 7 eða 8
	// - Má innihalda - eða bil
	// - Án - og bila skal vera sjö stafir
	phonenumber: function(s){
		return (/[4,5,6,7,8]([0-9]{2}[\s,-][0-9]{4}|[0-9]{6})$/g).test(s);
	}
};

module.exports = validInput;