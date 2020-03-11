function parseNumArray(str) {
  str = str.replace(/^\s+|\s+$/g, '');
  str = str.replace(/^\[|\]$/g, '');

  var getSeparator = function (str) {
    if (str.match(/[,|.].*;/)) {
      return /\s*;\s*/;
    }

    var spaceSep = /\s+/;
    if (str.match(/.\.*,/) || str.match(/,.*\./) ) {
      if (str.match(/\s/)) {
        if (str.match(/\s+,|,\s+/)) {
          return /\s+,|,\s+/;
        }

        var commaSep = /\s*,\s*/;
        var spaceLen = str.split(spaceSep).length;
        var commaLen = str.split(commaSep).length;

        if (spaceLen > commaLen) {
          return spaceSep;
        }

        return commaSep;
      }
      return /,/;
    }

    return spaceSep;
  }

  var separator = getSeparator(str);

  // return str
  //   .split(separator)
  //   .filter(function(val) {
  //     return val.length > 0;
  //   })
  //   .map(function(val) {
  //     var val = val.replace(/^\s+|\s+$/g, '');

  //     if (val.match(/,/)) {
  //       val = val.replace(/,/, '.');
  //     }

  //     return Number(val);
  //   });
  var numArray = str
    .split(separator)
    .filter(function(val) {
      return val.length > 0;
    })
    .map(function(val) {
      var val = val.replace(/^\s+|\s+$/g, '');

      if (val.match(/,/)) {
        val = val.replace(/,/, '.');
      }

      return Number(val);
    });

  return numArray;
}

export { parseNumArray };

  // tests
  // function testStr(str, expect) {
  //   var parsedArr = parseNumArray(str);
  //   // console.log(str, ' => ',
  //   //   parsedArr, ' => ',
  //   //   JSON.stringify(parsedArr) === JSON.stringify(expect));
  // }
  
  // testStr(" 1,1 1,2 3,4 15,6 ", [1.1,1.2,3.4,15.6]);
  // testStr(" 0.1 1.2 3.4 5.6", [0.1,1.2,3.4,5.6]);
  // testStr("1,1\n1,2\n3,4\n15\n", [1.1,1.2,3.4,15]);
  // testStr("1,1;1,2; 3,4;15;", [1.1,1.2,3.4,15]);
  // testStr("9.111;1.2 ;3.4;15;", [9.111,1.2,3.4,15]);
  // testStr(" 1 1 3 4 5", [1,1,3,4,5]);
  // testStr("[1 ,1 , 3 , 4.5 ,5]", [1,1,3,4.5,5]);
  // testStr("1,2.3,4.5,6,7,", [1,2.3,4.5,6,7]);
  // testStr("1.2 1.2 1,3 1.5 1.6 1.7 1.8", [1.2,1.2,1.3,1.5,1.6,1.7,1.8]);
  // testStr("1,2.3,4.a,6,7", [1,2.3,NaN,6,7]);
  // testStr(".4 2.3 .6 5.7", [0.4,2.3,0.6,5.7]);
  