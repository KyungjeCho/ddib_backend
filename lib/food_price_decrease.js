var db = require('../lib/db');

/* Automatical food price decrease function
* 
* 
*/
module.exports = function () {

    var all_count                         = 0;
    var half_count                        = 0;
    var minimum_count                     = 0;
    var error_count                       = 0;
  
    db.query('SELECT * FROM item WHERE timesale = 1 AND original_item_count / 2 < itemcount;', function(error, results){
      if (error) {
        return false;
      }
      
      all_count                           = results.length;
  
      for (var i = 0; i < results.length; i++) {
        var date                          = new Date();
        
        // Each server has different time. It should be based on Korean time(KST/ UTC+9)
        date.setHours(date.getUTCHours() + 9);
  
        var start_time                     = new Date(results[i].starttime);
        var end_time                       = new Date(results[i].endtime);
  
        var half_time                      = (start_time.getTime() + end_time.getTime()) / 2;
        var quarter_time                   = ((1 - 3/ 4) * start_time.getTime() + (3/4) * end_time.getTime());
  
        if (date.getTime() > half_time && results[i].sale_step === 0) {
          // The price of food is reduced to half of the minimun price and the present price.
          var sale_price =  ((results[i].saleprice + results[i].leastprice) / 2.0) / 100 * 100;
  
          db.query('UPDATE item SET saleprice = ?, sale_step = ?, original_item_count = ? WHERE iid = ?;', [sale_price, 1, results[i].itemcount, results[i].iid], function (error2, resutls2){
            if (error2) {
              console.error('Error : Half decrease update error');
              error_count                  += 1;
            } else {
              half_count                   += 1;
            }
          })
  
        } else if (date.getTime() > quarter_time && results[i].sale_step === 1) {
          // The price of food is reduced to the minimun price.
          var sale_price = results[i].leastprice;
  
          db.query('UPDATE item SET saleprice = ?, sale_step = ?, timesale = ? WHERE iid = ?;', [sale_price, 2, 0, results[i].iid], function (error2, resutls2){
            if (error2) {
              console.error('Error : Minimum decrease update error');
              error_count                   += 1;
            } else {
              minimum_count                 += 1;
            }
          })
  
        } else {
          // Nothing
        }
      }
    })
  
    console.log('Food Price Decrease Results;');
    console.log('All      : ' + all_count + 
                'Half     : ' + half_count +
                'Minimum  : ' + minimum_count +
                'Error    : ' + error_count);  
  }